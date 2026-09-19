import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CITY_BOUNDARY_MIN_ZOOM,
  gcj02GeoJSONToWgs84,
  gcj02ToWgs84,
  getBoundaryUrl,
  getFittedLng,
  getPlaceMonth,
  getSelectionLabel,
  isBoundaryVisible,
} from '../src/lib/travel-map-state.ts';

test('builds a same-origin boundary URL only for a six-digit administrative code', () => {
	assert.equal(getBoundaryUrl('510100'), '/travel-boundaries/510100.json');
	assert.equal(getBoundaryUrl('5101'), null);
	assert.equal(getBoundaryUrl('chengdu'), null);
	assert.equal(getBoundaryUrl(), null);
});

test('shows a city boundary only at the regional zoom threshold', () => {
  assert.equal(isBoundaryVisible(CITY_BOUNDARY_MIN_ZOOM - 1), false);
  assert.equal(isBoundaryVisible(CITY_BOUNDARY_MIN_ZOOM), true);
  assert.equal(isBoundaryVisible(CITY_BOUNDARY_MIN_ZOOM + 3), true);
});

test('formats the selected city and visit date without extra copy', () => {
  assert.equal(getSelectionLabel('成都', '2026-09'), '成都 · 2026.09');
  assert.equal(getSelectionLabel('上海', '2020 - 至今'), '上海 · 2020 - 至今');
});

test('extracts a compact month label for the archive row', () => {
  assert.equal(getPlaceMonth('2026-09', '2026'), '09');
  assert.equal(getPlaceMonth('2024.07', '2024'), '07');
  assert.equal(getPlaceMonth('2020 - 至今', '2020'), '至今');
});

test('wraps western longitudes so world bounds take the shorter Pacific path', () => {
  const lngs = [104.07, 135.5, -95.689];
  assert.equal(getFittedLng(104.07, lngs), 104.07);
  assert.equal(getFittedLng(-95.689, lngs), -95.689 + 360);
  assert.equal(getFittedLng(121.47, [121.47, 135.5]), 121.47);
});

test('converts China GCJ-02 coordinates onto the WGS-84 basemap', () => {
  const [lng, lat] = gcj02ToWgs84(104.066, 30.657);
  assert.ok(lng < 104.066);
  assert.notDeepEqual([lng, lat], [104.066, 30.657]);
  assert.deepEqual(gcj02ToWgs84(-95.369, 29.76), [-95.369, 29.76]);
});

test('rewrites GeoJSON coordinates without mutating the source', () => {
  const source = {
    type: 'Point',
    coordinates: [104.066, 30.657],
  };
  const converted = gcj02GeoJSONToWgs84(source);
  assert.deepEqual(source.coordinates, [104.066, 30.657]);
  assert.ok(converted.coordinates[0] < source.coordinates[0]);
});
