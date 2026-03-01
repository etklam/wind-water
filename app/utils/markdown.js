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

function splitTableRow(line) {
  let text = line.trim()
  if (text.startsWith('|')) text = text.slice(1)
  if (text.endsWith('|')) text = text.slice(0, -1)
  return text.split('|').map((item) => item.trim())
}

function isTableSeparator(line) {
  const cells = splitTableRow(line)
  if (cells.length === 0) return false
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell))
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

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i]
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

    const nextLine = lines[i + 1]
    if (line.includes('|') && nextLine && isTableSeparator(nextLine)) {
      const headers = splitTableRow(line)
      const separators = splitTableRow(nextLine)
      if (headers.length === separators.length) {
        flushParagraph()
        flushList()
        const bodyRows = []
        i += 2
        while (i < lines.length) {
          const rowLine = lines[i].trim()
          if (!rowLine || !rowLine.includes('|')) break
          const cells = splitTableRow(rowLine)
          if (cells.length !== headers.length) break
          bodyRows.push(cells)
          i += 1
        }
        i -= 1

        const headerHtml = headers.map((cell) => `<th>${renderInline(cell)}</th>`).join('')
        const bodyHtml = bodyRows
          .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`)
          .join('')
        blocks.push(`<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`)
        continue
      }
    }

    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()
  return blocks.join('\n')
}
