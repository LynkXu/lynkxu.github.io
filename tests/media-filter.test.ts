import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatRecordedMonth,
  getAlternateTitle,
  getMediaStatusLabel,
  getPreferredTitle,
  matchesMediaFilter,
  toFilledStars,
} from '../src/lib/media-filter.ts';

test('the all filter matches every media kind', () => {
  assert.equal(matchesMediaFilter('book', 'all'), true);
  assert.equal(matchesMediaFilter('movie', 'all'), true);
});

test('a type filter matches only the same media kind', () => {
  assert.equal(matchesMediaFilter('tv', 'tv'), true);
  assert.equal(matchesMediaFilter('game', 'tv'), false);
});

test('prefers a Chinese title and keeps an English subtitle', () => {
  const localized = [
    { lang: 'zh-cn', text: '三体' },
    { lang: 'en', text: 'The Three-Body Problem' },
  ];
  assert.equal(getPreferredTitle(localized, 'The Three-Body Problem'), '三体');
  assert.equal(getAlternateTitle(localized, '三体'), 'The Three-Body Problem');
  assert.equal(getAlternateTitle(localized, 'The Three-Body Problem'), '');
});

test('skips season-only localized titles and uses the work name', () => {
  const localized = [
    { lang: 'en', text: 'Season 1' },
    { lang: 'zh-cn', text: '第 1 季' },
  ];
  assert.equal(getPreferredTitle(localized, '第 1 季', '美丽毒素'), '美丽毒素');
});

test('maps shelf status to the record type and formats ratings', () => {
  assert.equal(getMediaStatusLabel('book', 'complete'), '已读');
  assert.equal(getMediaStatusLabel('movie', 'progress'), '在看');
  assert.equal(getMediaStatusLabel('game', 'complete'), '已通关');
  assert.equal(formatRecordedMonth('2025-08-09T05:09:47.982Z'), '2025.08');
  assert.equal(toFilledStars(8), 4);
  assert.equal(toFilledStars(null), null);
});
