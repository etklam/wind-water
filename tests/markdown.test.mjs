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

test('renderMarkdown renders markdown tables', () => {
  const input = [
    '| 欄位 | 內容 |',
    '| --- | --- |',
    '| 五行 | 木火土金水 |',
    '| 備註 | **重點** |'
  ].join('\n')

  const html = renderMarkdown(input)
  assert.match(html, /<table>/)
  assert.match(html, /<thead><tr><th>欄位<\/th><th>內容<\/th><\/tr><\/thead>/)
  assert.match(html, /<tbody>/)
  assert.match(html, /<td>五行<\/td><td>木火土金水<\/td>/)
  assert.match(html, /<td>備註<\/td><td><strong>重點<\/strong><\/td>/)
})
