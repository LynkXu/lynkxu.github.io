import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MASTODON_INSTANCE = process.env.MASTODON_INSTANCE || 'https://mastodon.social';
const MASTODON_USERNAME = process.env.MASTODON_USERNAME || 'lynkxu';
const OUTPUT_FILE = path.join(__dirname, '../src/data/mastodon.json');

// Simple HTML to Markdown converter
function htmlToMarkdown(html) {
    if (!html) return '';
    
    let text = html;
    
    // Convert paragraphs
    text = text.replace(/<\/p>\s*<p>/gi, '\n\n');
    text = text.replace(/<p[^>]*>/gi, '');
    text = text.replace(/<\/p>/gi, '\n');
    
    // Convert line breaks
    text = text.replace(/<br\s*\/?>/gi, '\n');
    
    // Convert links
    text = text.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi, '[$2]($1)');
    
    // Convert bold
    text = text.replace(/<strong[^>]*>([^<]+)<\/strong>/gi, '**$1**');
    text = text.replace(/<b[^>]*>([^<]+)<\/b>/gi, '**$1**');
    
    // Convert italic
    text = text.replace(/<em[^>]*>([^<]+)<\/em>/gi, '*$1*');
    text = text.replace(/<i[^>]*>([^<]+)<\/i>/gi, '*$1*');
    
    // Convert hashtags (remove span wrapper)
    text = text.replace(/<a[^>]*class=["'][^"']*mention hashtag[^"']*["'][^>]*href=["']([^"']+)["'][^>]*><span>([^<]*)<\/span>([^<]+)<\/a>/gi, '$2$3');
    
    // Convert mentions
    text = text.replace(/<span[^>]*class=["'][^"']*h-card[^"']*["'][^>]*>.*?<a[^>]*href=["']([^"']+)["'][^>]*>@?<span>([^<]+)<\/span>.*?<\/a>.*?<\/span>/gi, '[@$2]($1)');
    
    // Remove remaining HTML tags
    text = text.replace(/<[^>]+>/g, '');
    
    // Decode HTML entities
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&nbsp;/g, ' ');
    
    // Clean up multiple newlines
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Trim whitespace
    text = text.trim();
    
    return text;
}

// Read existing data
function readExistingData() {
    if (!fs.existsSync(OUTPUT_FILE)) {
        return [];
    }
    try {
        const content = fs.readFileSync(OUTPUT_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.warn('Failed to parse existing Mastodon data, fallback to empty array:', error.message);
        return [];
    }
}

// Get latest status ID for incremental updates
function getLatestStatusId(existingData) {
    if (!Array.isArray(existingData) || existingData.length === 0) {
        return null;
    }
    // Status IDs are strings that can be compared lexicographically for chronological order
    const ids = existingData.map(item => item.id).filter(Boolean);
    if (ids.length === 0) return null;
    return ids.sort((a, b) => b.localeCompare(a))[0]; // Get the largest (newest) ID
}

// Fetch account information
async function getAccountId(instance, username) {
    const url = `${instance}/api/v1/accounts/lookup?acct=${username}`;
    console.log(`Fetching account info: ${url}`);
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch account: ${response.status} ${response.statusText}`);
        }
        const account = await response.json();
        console.log(`Found account: ${account.display_name} (@${account.username}), ID: ${account.id}`);
        return account.id;
    } catch (error) {
        console.error('Error fetching account:', error.message);
        throw error;
    }
}

// Fetch all public statuses
async function fetchStatuses(instance, accountId, existingData) {
    console.log(`Fetching all public statuses...`);
    
    const allStatuses = [];
    let maxId = null;
    const MAX_PAGES = 5; // Fetch up to 5 pages (200 statuses)
    let page = 0;
    
    const latestId = getLatestStatusId(existingData);
    if (latestId) {
        console.log(`Using incremental update, latest status ID: ${latestId}`);
    }
    
    while (page < MAX_PAGES) {
        try {
            // Build URL with pagination
            let url = `${instance}/api/v1/accounts/${accountId}/statuses?limit=40&exclude_replies=true&exclude_reblogs=true`;
            if (maxId) {
                url += `&max_id=${maxId}`;
            }
            if (latestId && page === 0) {
                url += `&since_id=${latestId}`;
            }
            
            console.log(`Fetching page ${page + 1}: ${url}`);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch statuses: ${response.status} ${response.statusText}`);
            }
            
            const statuses = await response.json();
            
            if (!Array.isArray(statuses) || statuses.length === 0) {
                console.log('No more statuses to fetch');
                break;
            }
            
            console.log(`Fetched ${statuses.length} statuses from page ${page + 1}`);
            allStatuses.push(...statuses);
            
            // If we're doing incremental update and got fewer results, we can stop
            if (latestId && statuses.length < 40) {
                break;
            }
            
            // Update maxId for next page
            maxId = statuses[statuses.length - 1].id;
            page++;
            
            // Rate limiting: wait 1 second between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`Error fetching statuses page ${page + 1}:`, error.message);
            break;
        }
    }
    
    console.log(`Fetched ${allStatuses.length} total statuses`);
    return allStatuses;
}

// Transform status to our format
function transformStatus(status) {
    return {
        id: status.id,
        created_at: status.created_at,
        content_html: status.content,
        content_markdown: htmlToMarkdown(status.content),
        url: status.url,
        visibility: status.visibility,
        tags: status.tags.map(tag => tag.name),
        media_attachments: status.media_attachments.map(media => ({
            type: media.type,
            url: media.url,
            preview_url: media.preview_url,
            description: media.description
        })),
        favourites_count: status.favourites_count,
        reblogs_count: status.reblogs_count,
        replies_count: status.replies_count
    };
}

// Check if a status should be filtered out (e.g., blog sync posts)
function shouldFilterStatus(status) {
    const tags = status.tags.map(tag => tag.name.toLowerCase());
    // 过滤掉从博客同步过来的文章
    return tags.includes('blogsync');
}

// Merge new and existing data, removing duplicates
function mergeData(newStatuses, existingData) {
    const merged = [...newStatuses, ...existingData];
    const seen = new Set();
    const unique = [];
    
    for (const status of merged) {
        if (!seen.has(status.id)) {
            seen.add(status.id);
            unique.push(status);
        }
    }
    
    // Sort by creation date (newest first)
    unique.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    return unique;
}

async function main() {
    try {
        console.log('Starting Mastodon sync...');
        console.log(`Instance: ${MASTODON_INSTANCE}`);
        console.log(`Username: ${MASTODON_USERNAME}`);
        
        // Read existing data
        const existingData = readExistingData();
        console.log(`Found ${existingData.length} existing statuses`);
        
        // Get account ID
        const accountId = await getAccountId(MASTODON_INSTANCE, MASTODON_USERNAME);
        
        // Fetch statuses
        const statuses = await fetchStatuses(MASTODON_INSTANCE, accountId, existingData);
        
        // Filter out blog sync posts
        const filteredStatuses = statuses.filter(status => !shouldFilterStatus(status));
        console.log(`Filtered out ${statuses.length - filteredStatuses.length} blog sync posts`);
        
        // Transform statuses
        const transformed = filteredStatuses.map(transformStatus);
        
        // Merge with existing data
        const merged = mergeData(transformed, existingData);
        
        console.log(`Total statuses after merge: ${merged.length}`);
        
        // Ensure directory exists
        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write to file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2));
        console.log(`Successfully wrote Mastodon data to ${OUTPUT_FILE}`);
        
    } catch (error) {
        console.error('Error in Mastodon sync:', error);
        process.exit(1);
    }
}

main();
