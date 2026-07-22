import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sportsPage = readFileSync(new URL('../src/content/page/sports.mdx', import.meta.url), 'utf8');

test('sports page exposes a strength tab backed by mock fitness data', () => {
  assert.match(sportsPage, /import\s+StrengthDashboard\s+from\s+['"]\.\.\/\.\.\/components\/StrengthDashboard\.astro['"]/);
  assert.match(sportsPage, /import\s+fitnessStats\s+from\s+['"]\.\.\/\.\.\/data\/fitness-stats\.json['"]/);
  assert.match(sportsPage, /<TabItem\s+label="力量">/);
  assert.match(sportsPage, /<StrengthDashboard\s+stats=\{fitnessStats\.strength\}\s*\/>/);
});

test('mock fitness stats provide dashboard-ready aggregate fields', () => {
  const stats = JSON.parse(readFileSync(new URL('../src/data/fitness-stats.json', import.meta.url), 'utf8'));

  assert.equal(stats.source, 'mock-hevy');
  assert.ok(stats.generatedAt);
  assert.ok(stats.strength);

  const { cards, monthly, muscles, lifts, recentWorkouts } = stats.strength;
  for (const key of ['totalWorkouts', 'totalTime', 'totalVolume', 'activeWeeks']) {
    assert.ok(cards[key], `missing card ${key}`);
    assert.ok(cards[key].label);
    assert.ok(cards[key].value);
  }

  assert.ok(monthly.length >= 6);
  assert.ok(monthly.every((row) => row.month && Number.isFinite(row.workouts) && Number.isFinite(row.volumeKg)));
  assert.ok(muscles.length >= 5);
  assert.ok(lifts.length >= 3);
  assert.ok(lifts.every((lift) => lift.name && lift.bestSet && lift.history.length >= 3));
  assert.ok(recentWorkouts.length >= 4);
});
