import test from 'node:test'
import assert from 'node:assert/strict'
import { renderMarkdown } from '../app/utils/markdown.js'

test('renderMarkdown renders headings, bold, and unordered lists', () => {
  const input = [
    '# 標題',
    '',
    '這是 **重點** 段落',
    '',
    '- 第一項',
    '- 第二項'
  ].join('\n')

  const html = renderMarkdown(input)
  assert.match(html, /<h1>標題<\/h1>/)
  assert.match(html, /<p>這是 <strong>重點<\/strong> 段落<\/p>/)
  assert.match(html, /<ul><li>第一項<\/li><li>第二項<\/li><\/ul>/)
})

test('renderMarkdown renders ordered lists and escapes raw html', () => {
  const input = [
    '1. 第一點',
    '2. 第二點 <script>alert(1)<\/script>'
  ].join('\n')

  const html = renderMarkdown(input)
  assert.match(html, /<ol><li>第一點<\/li><li>第二點 &lt;script&gt;alert\(1\)&lt;\/script&gt;<\/li><\/ol>/)
  assert.doesNotMatch(html, /<script>/)
})
