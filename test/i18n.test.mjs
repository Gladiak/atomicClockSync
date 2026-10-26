import test from 'node:test';
import assert from 'node:assert/strict';
import { messages } from '../src/locales/messages.mjs';
import { HISTORICAL_EVENTS } from '../src/time-machine-data.mjs';
import { LANGUAGES, t } from '../src/i18n.mjs';

test('all localized messages preserve interpolation fields in all five translations', () => {
  const fields = text => [...text.matchAll(/\{(\d+)\}/g)].map(match => match[1]).sort();
  for (const [source, translations] of Object.entries(messages)) for (const { id } of LANGUAGES.filter(item => item.id !== 'en')) {
    assert.equal(typeof translations[id], 'string', `${id}: ${source}`);
    assert.ok(translations[id].trim(), `${id}: ${source}`);
    assert.deepEqual(fields(translations[id]), fields(source), `${id}: ${source}`);
  }
  assert.equal(t('Unknown personal text <b>kept as text</b>'), 'Unknown personal text <b>kept as text</b>');
  assert.equal(t('Value {0}', '$&'), 'Value $&');
});
test('all 96 historical journey titles, stories and exhibit captions are translated', () => {
  for (const event of HISTORICAL_EVENTS) for (const field of ['title','detail','era','factLabel']) {
    assert.ok(Object.hasOwn(messages, event[field]), `${event.id}: ${field}`);
  }
});

test('every manual chapter has translated narrative and a real screenshot in each language', async () => {
  const { MANUAL_CHAPTERS } = await import('../src/guide-data.mjs');
  const { readFileSync } = await import('node:fs');
  for (const chapter of MANUAL_CHAPTERS) {
    for (const source of [chapter.title,chapter.purpose,...chapter.body,chapter.example,chapter.note]) {
      assert.ok(messages[source],chapter.id+': '+source);
      for (const language of ['it','fr','de','es','ja']) assert.notEqual(messages[source][language],source,chapter.id+' '+language);
    }
    for (const language of ['en','it','fr','de','es','ja']) {
      const image=readFileSync(new URL(`../assets/guide/${language}/${chapter.image}.jpg`,import.meta.url));
      assert.equal(image.readUInt16BE(0),0xffd8);assert.ok(image.length>10000,chapter.id+' '+language);
    }
  }
});
