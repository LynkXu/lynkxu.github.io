import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// const dotenv = await import('dotenv');
// dotenv.config();

// Simple .env parser to avoid npm install issues
function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            content.split('\n').forEach(line => {
                const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    const key = match[1];
                    let value = match[2] || '';
                    // Remove quotes if present
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    }
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            });
            console.log('Loaded .env file');
        }
    } catch (e) {
        console.warn('Failed to load .env file:', e.message);
    }
}

loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const NEODB_API_BASE = 'https://neodb.social/api';
const OUTPUT_FILE = path.join(__dirname, '../src/data/neodb.json');

// Get token from environment variable
const TOKEN = process.env.NEODB_ACCESS_TOKEN;

if (!TOKEN) {
    console.warn('Warning: NEODB_ACCESS_TOKEN not found in environment variables.');
    console.warn('Skipping NeoDB sync. Using existing data if available.');
    process.exit(0);
}

// Fetch all shelf types for each category
// Shelf types: 'wishlist' (想看), 'progress' (在看), 'complete' (看过), 'dropped' (搁置)
const SHELF_TYPES = ['complete', 'progress']; // Now fetching both 'complete' and 'progress'
const CATEGORIES = ['book', 'movie', 'tv', 'game']; // Added 'tv' for TV shows/series
const ITEM_API_BASE = 'https://neodb.social';

function normalizeTime(value) {
    const time = Date.parse(value);
    return Number.isNaN(time) ? 0 : time;
}

function readExistingData() {
    if (!fs.existsSync(OUTPUT_FILE)) {
        return null;
    }
    try {
        const content = fs.readFileSync(OUTPUT_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.warn('Failed to parse existing NeoDB data, fallback to full sync:', error.message);
        return null;
    }
}

function getLatestCreatedTime(items, shelfType) {
    if (!Array.isArray(items) || items.length === 0) {
        return 0;
    }
    let latest = 0;
    for (const item of items) {
        if (item?.shelf_type !== shelfType) {
            continue;
        }
        const time = normalizeTime(item?.created_time);
        if (time > latest) {
            latest = time;
        }
    }
    return latest;
}

function getItemKey(item) {
    if (item?.post_id) {
        return `post:${item.post_id}`;
    }
    if (item?.item?.uuid) {
        return `uuid:${item.item.uuid}`;
    }
    return JSON.stringify(item);
}

function mergeItems(newItems, existingItems) {
    const merged = [];
    const seenKeys = new Set();
    for (const item of [...newItems, ...existingItems]) {
        const key = getItemKey(item);
        if (seenKeys.has(key)) {
            continue;
        }
        seenKeys.add(key);
        merged.push(item);
    }

    // Sort newest first so the most recent shelf state wins in UUID dedup below
    merged.sort((a, b) => normalizeTime(b?.created_time) - normalizeTime(a?.created_time));

    // Deduplicate by item UUID: when an item transitions (e.g. progress → complete),
    // both states share the same UUID but have different post_ids. Keep only the newest.
    const seenUuids = new Set();
    const deduplicated = [];
    for (const item of merged) {
        const uuid = item?.item?.uuid;
        if (uuid) {
            if (seenUuids.has(uuid)) {
                continue;
            }
            seenUuids.add(uuid);
        }
        deduplicated.push(item);
    }

    return deduplicated;
}

function buildExistingYearMap(existingData) {
    const map = new Map();
    if (!existingData) {
        return map;
    }
    for (const category of CATEGORIES) {
        const items = existingData?.[category] ?? [];
        for (const item of items) {
            const key = getItemKey(item);
            if (item?.publication_year) {
                map.set(key, item.publication_year);
            }
        }
    }
    return map;
}

function pickYear(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }
    if (typeof value === 'string') {
        const match = value.match(/\d{4}/);
        return match ? match[0] : undefined;
    }
    return undefined;
}

function extractYearFromApi(payload) {
    return (
        pickYear(payload?.pub_year) ||
        pickYear(payload?.year) ||
        pickYear(payload?.release_year) ||
        pickYear(payload?.release_date) ||
        pickYear(payload?.pub_date) ||
        pickYear(payload?.first_air_date) ||
        pickYear(payload?.air_date) ||
        pickYear(payload?.premiere_date)
    );
}

async function fetchPublicationYear(apiUrl, cache) {
    if (!apiUrl) {
        return '未知';
    }
    if (cache.has(apiUrl)) {
        return cache.get(apiUrl);
    }
    try {
        const response = await fetch(`${ITEM_API_BASE}${apiUrl}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const year = extractYearFromApi(data) || '未知';
        cache.set(apiUrl, year);
        return year;
    } catch (error) {
        console.warn(`Failed to fetch detail for ${apiUrl}:`, error.message);
        cache.set(apiUrl, '未知');
        return '未知';
    }
}

async function attachPublicationYears(items, existingYearMap) {
    const cache = new Map();
    for (const item of items) {
        if (item?.publication_year) {
            continue;
        }
        const key = getItemKey(item);
        if (existingYearMap.has(key)) {
            item.publication_year = existingYearMap.get(key);
            continue;
        }
        const apiUrl = item?.item?.api_url;
        item.publication_year = await fetchPublicationYear(apiUrl, cache);
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

async function fetchCategory(category, existingItems) {
    console.log(`Fetching ${category}...`);
    let allItems = [];
    
    // We need to fetch for each shelf type if we want everything, but user likely wants 'complete'
    // Let's iterate over shelf types if needed, but for now just 'complete'
    for (const shelfType of SHELF_TYPES) {
        let page = 1;
        let hasNext = true;
        const MAX_PAGES = 3; 
        const cutoffTime = getLatestCreatedTime(existingItems, shelfType);
        if (cutoffTime > 0) {
            console.log(`Using incremental cutoff for ${category}/${shelfType}: ${new Date(cutoffTime).toISOString()}`);
        }

        while (hasNext && page <= MAX_PAGES) {
            try {
                // Correct endpoint: /me/shelf/{shelf_type}?category={category}
                const url = `${NEODB_API_BASE}/me/shelf/${shelfType}?category=${category}&page=${page}`;
                console.log(`Requesting: ${url}`);
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${TOKEN}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
                }

                const data = await response.json();
                
                if (data.data && Array.isArray(data.data)) {
                    // Add shelf type info to items
                    const itemsWithShelfType = data.data.map(item => ({
                        ...item,
                        shelf_type: shelfType // Add 'complete' or 'progress' to the item data
                    }));
                    const filteredItems = cutoffTime > 0
                        ? itemsWithShelfType.filter(item => normalizeTime(item?.created_time) > cutoffTime)
                        : itemsWithShelfType;
                    allItems = allItems.concat(filteredItems);

                    // NeoDB returns newest first. Once we hit older items, we can stop paging.
                    if (cutoffTime > 0 && filteredItems.length < itemsWithShelfType.length) {
                        hasNext = false;
                    }
                }

                if (hasNext && data.pages > page) {
                    page++;
                } else {
                    hasNext = false;
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`Error fetching ${category} (${shelfType}) page ${page}:`, error.message);
                hasNext = false; 
            }
        }
    }
    
    console.log(`Fetched ${allItems.length} items for ${category}`);
    return allItems;
}

async function main() {
    const result = {};
    const existingData = readExistingData();
    const existingYearMap = buildExistingYearMap(existingData);

    for (const category of CATEGORIES) {
        const existingItems = existingData?.[category] ?? [];
        const newItems = await fetchCategory(category, existingItems);
        const mergedItems = mergeItems(newItems, existingItems);
        await attachPublicationYears(mergedItems, existingYearMap);
        result[category] = mergedItems;
    }

    // Ensure directory exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
    console.log(`Successfully wrote NeoDB data to ${OUTPUT_FILE}`);
}

main().catch(console.error);
