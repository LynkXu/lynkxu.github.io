export const CITY_BOUNDARY_MIN_ZOOM = 7;
export const CITY_FOCUS_MAX_ZOOM = 8;

const GCJ_A = 6378245;
const GCJ_EE = 0.00669342162296594323;

export function getBoundaryUrl(adminCode?: string): string | null {
  if (!adminCode || !/^\d{6}$/.test(adminCode)) return null;
  return `/travel-boundaries/${adminCode}.json`;
}

export function isBoundaryVisible(zoom: number): boolean {
  return zoom >= CITY_BOUNDARY_MIN_ZOOM;
}

export function getSelectionLabel(name: string, date: string): string {
  const displayDate = /^\d{4}-\d{2}$/.test(date) ? date.replace('-', '.') : date;
  return `${name} · ${displayDate}`;
}

export function getPlaceMonth(date: string, year: string): string {
  const isoMonth = date.match(/^\d{4}[-.](\d{2})/);
  if (isoMonth) return isoMonth[1];
  return date.replace(new RegExp(`^${year}\\s*[-.]?\\s*`), '') || date;
}

export function getFittedLng(lng: number, lngs: number[]): number {
  if (lngs.length === 0) return lng;
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  if (maxLng - minLng <= 180 || lng >= 0) return lng;
  return lng + 360;
}

export function gcj02ToWgs84(lng: number, lat: number): [number, number] {
  if (lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271) {
    return [lng, lat];
  }

  const dLat = transformLat(lng - 105, lat - 35);
  const dLng = transformLng(lng - 105, lat - 35);
  const radLat = (lat / 180) * Math.PI;
  const magic = 1 - GCJ_EE * Math.sin(radLat) ** 2;
  const sqrtMagic = Math.sqrt(magic);
  const latOffset = (dLat * 180) / (((GCJ_A * (1 - GCJ_EE)) / (magic * sqrtMagic)) * Math.PI);
  const lngOffset = (dLng * 180) / ((GCJ_A / sqrtMagic) * Math.cos(radLat) * Math.PI);
  return [lng - lngOffset, lat - latOffset];
}

export function gcj02GeoJSONToWgs84<T>(geometry: T): T {
  return transformGeoJSON(structuredClone(geometry));
}

function transformLat(lng: number, lat: number) {
  let value = -100 + 2 * lng + 3 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  value += ((20 * Math.sin(6 * lng * Math.PI) + 20 * Math.sin(2 * lng * Math.PI)) * 2) / 3;
  value += ((20 * Math.sin(lat * Math.PI) + 40 * Math.sin((lat / 3) * Math.PI)) * 2) / 3;
  value += ((160 * Math.sin((lat / 12) * Math.PI) + 320 * Math.sin((lat * Math.PI) / 30)) * 2) / 3;
  return value;
}

function transformLng(lng: number, lat: number) {
  let value = 300 + lng + 2 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  value += ((20 * Math.sin(6 * lng * Math.PI) + 20 * Math.sin(2 * lng * Math.PI)) * 2) / 3;
  value += ((20 * Math.sin(lng * Math.PI) + 40 * Math.sin((lng / 3) * Math.PI)) * 2) / 3;
  value += ((150 * Math.sin((lng / 12) * Math.PI) + 300 * Math.sin((lng / 30) * Math.PI)) * 2) / 3;
  return value;
}

function transformGeoJSON<T>(value: T): T {
  if (Array.isArray(value)) {
    if (typeof value[0] === 'number' && typeof value[1] === 'number') {
      const [lng, lat] = gcj02ToWgs84(value[0], value[1]);
      const next = value.slice() as number[];
      next[0] = lng;
      next[1] = lat;
      return next as T;
    }
    return value.map((item) => transformGeoJSON(item)) as T;
  }

  if (value && typeof value === 'object') {
    const next = value as T & { coordinates?: unknown; geometry?: unknown; features?: unknown };
    if ('coordinates' in next && next.coordinates) next.coordinates = transformGeoJSON(next.coordinates);
    if ('geometry' in next && next.geometry) next.geometry = transformGeoJSON(next.geometry);
    if ('features' in next && Array.isArray(next.features)) {
      next.features = next.features.map((feature) => transformGeoJSON(feature));
    }
    return next;
  }

  return value;
}
