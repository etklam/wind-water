function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderInline(text) {
  const safe = escapeHtml(text)
  return safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

export function renderMarkdown(input) {
  if (!input || typeof input !== 'string') {
    return ''
  }

  const lines = input.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  const paragraph = []
  let listType = null
  let listItems = []

  function flushParagraph() {
    if (paragraph.length === 0) return
    const text = paragraph.map((line) => renderInline(line.trim())).join('<br>')
    blocks.push(`<p>${text}</p>`)
    paragraph.length = 0
  }

  function flushList() {
    if (!listType || listItems.length === 0) return
    const tag = listType === 'ol' ? 'ol' : 'ul'
    const items = listItems.map((item) => `<li>${renderInline(item)}</li>`).join('')
    blocks.push(`<${tag}>${items}</${tag}>`)
    listType = null
    listItems = []
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flushParagraph()
      flushList()
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      flushParagraph()
      flushList()
      const level = heading[1].length
      blocks.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`)
      continue
    }

    const unordered = line.match(/^[-*+]\s+(.+)$/)
    if (unordered) {
      flushParagraph()
      if (listType && listType !== 'ul') {
        flushList()
      }
      listType = 'ul'
      listItems.push(unordered[1].trim())
      continue
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/)
    if (ordered) {
      flushParagraph()
      if (listType && listType !== 'ol') {
        flushList()
      }
      listType = 'ol'
      listItems.push(ordered[1].trim())
      continue
    }

    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()
  return blocks.join('\n')
}
