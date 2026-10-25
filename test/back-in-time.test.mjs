import test from 'node:test';
import assert from 'node:assert/strict';
import { MOVIE_DATES, elapsedTime, hillValleyTime } from '../src/back-in-time.mjs';

test('movie circuits show Pacific dates independently of the computer time zone', () => {
  const expected = [['SEP', '02', '1885', '08', '00'], ['NOV', '05', '1955', '06', '00'], ['NOV', '12', '1955', '22', '04'], ['OCT', '26', '1985', '01', '21'], ['OCT', '21', '2015', '16', '29']];
  MOVIE_DATES.forEach((event, i) => {
    const t = hillValleyTime(event.epoch);
    assert.deepEqual([t.month, t.day, t.year, t.hour, t.minute], expected[i]);
  });
  assert.equal(hillValleyTime(Date.parse('2026-10-25T01:00:00+02:00')).day, '24');
  assert.equal(hillValleyTime(Date.parse('2026-10-25T07:00:00Z')).hour, '00');
});
test('elapsed time carries seconds, minutes and days and handles future dates', () => {
  const event = MOVIE_DATES.at(-1).epoch;
  assert.deepEqual(elapsedTime(event, event + 90061000), { days: 1, hours: 1, minutes: 1, seconds: 1, past: true });
  assert.deepEqual(elapsedTime(event, event - 1000), { days: 0, hours: 0, minutes: 0, seconds: 1, past: false });
  assert.deepEqual(elapsedTime(event, event), { days: 0, hours: 0, minutes: 0, seconds: 0, past: true });
  assert.equal(elapsedTime(Date.parse('2024-02-28T23:00Z'), Date.parse('2024-03-01T23:00Z')).days, 2);
});
test('elapsed days measure actual duration across California DST transitions', () => {
  const before = Date.parse('2026-03-08T00:00:00-08:00');
  const after = Date.parse('2026-03-09T00:00:00-07:00');
  assert.deepEqual(elapsedTime(before, after), { days: 0, hours: 23, minutes: 0, seconds: 0, past: true });
});
