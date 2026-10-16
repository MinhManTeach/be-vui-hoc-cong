import test from 'node:test';
import assert from 'node:assert/strict';
import { LOPSO_APPS, LOPSO_LINKS } from '../src/data/lopsoApps';

test('promo links only point to lopso.vn or the contact mailbox', () => {
  for (const { url } of [...LOPSO_APPS, ...LOPSO_LINKS]) {
    assert.ok(url.startsWith('https://lopso.vn/') || url.startsWith('mailto:'), url);
  }
});

test('promo app ids are unique', () => {
  const ids = LOPSO_APPS.map((app) => app.id);
  assert.equal(new Set(ids).size, ids.length);
});
