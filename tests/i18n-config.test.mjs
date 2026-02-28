import test from 'node:test'
import assert from 'node:assert/strict'
import zhHant from '../i18n/locales/zh-Hant.json' with { type: 'json' }
import zhHans from '../i18n/locales/zh-Hans.json' with { type: 'json' }
import { messages } from '../app/i18n/messages.js'

test('locale files contain required keys', () => {
  assert.equal(zhHant.app.title, '納音五行計算')
  assert.equal(zhHans.form.mode.gregorian, '公历直排')
  assert.equal(zhHant.result.pillars.year, '年柱')
})

test('bagua UI translation keys exist in all locales', () => {
  for (const locale of Object.keys(messages)) {
    assert.ok(messages[locale].bagua)
    assert.equal(typeof messages[locale].bagua.title, 'string')
    assert.equal(typeof messages[locale].bagua.center, 'string')
    assert.equal(typeof messages[locale].bagua.highlight, 'string')
  }
})
