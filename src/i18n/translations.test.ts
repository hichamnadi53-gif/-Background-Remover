import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveLanguage,
  getLanguageDirection,
  TRANSLATIONS,
} from './translations';

test('resolveLanguage defaults safely to Arabic and supports all 4 locales', () => {
  assert.equal(resolveLanguage(undefined), 'ar');
  assert.equal(resolveLanguage('invalid'), 'ar');
  assert.equal(resolveLanguage('ar'), 'ar');
  assert.equal(resolveLanguage('en'), 'en');
  assert.equal(resolveLanguage('pt'), 'pt');
  assert.equal(resolveLanguage('fr'), 'fr');
});

test('getLanguageDirection returns rtl for Arabic and ltr for others', () => {
  assert.equal(getLanguageDirection('ar'), 'rtl');
  assert.equal(getLanguageDirection('en'), 'ltr');
  assert.equal(getLanguageDirection('pt'), 'ltr');
  assert.equal(getLanguageDirection('fr'), 'ltr');
});

test('all 4 translation dictionaries include required keys and 3 engines', () => {
  for (const lang of ['ar', 'en', 'pt', 'fr'] as const) {
    const t = TRANSLATIONS[lang];
    assert.ok(t.hero.title.length > 5);
    assert.ok(t.engines.rmbg.name.length > 3);
    assert.ok(t.engines.imgly.name.length > 3);
    assert.ok(t.engines.cloud.name.length > 3);
    assert.equal(t.landing.steps.length, 3);
    assert.ok(t.landing.faqs.length >= 4);
  }
});
