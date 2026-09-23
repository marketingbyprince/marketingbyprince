import { jsPDF } from 'jspdf'

// Pure resume layout: takes already-fetched data and returns a jsPDF doc.
// Kept free of Supabase/fetch so it can be exercised outside the browser.

const ACCENT = [255, 105, 51] // #FF6933
const DARK = [30, 30, 30]
const BODY = [70, 70, 70]
const MUTED = [130, 130, 130]

// A4 in mm. Content never goes below CONTENT_BOTTOM; the footer lives in the
// band underneath it, so the two can't overlap.
const PAGE_W = 210
const LEFT = 20
const RIGHT = 190
const WIDTH = RIGHT - LEFT
const CONTENT_TOP = 20
const CONTENT_BOTTOM = 273
const FOOTER_RULE_Y = 279
const FOOTER_TEXT_Y = 284

const BULLET_X = LEFT + 3
const BULLET_TEXT_X = LEFT + 7

// ─── Text cleaning ─────────────────────────────────────────────────────────

const ENTITY_RE = /&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);/i
const TAG_RE = /<\/?[a-z][^>]*>/i

function parseHtml(html) {
  if (typeof DOMParser === 'undefined') throw new Error('Resume PDF generation requires DOMParser')
  // DOMParser builds an inert document: scripts don't run and nothing is
  // attached to the page. We only ever read text out of it.
  return new DOMParser().parseFromString(html, 'text/html').body
}

// Decodes every named/numeric entity via the HTML parser (not a lookup
// table) and strips any tags that were double-escaped in the source.
function decodeHtmlText(str) {
  let out = str
  for (let i = 0; i < 3 && (ENTITY_RE.test(out) || TAG_RE.test(out)); i++) {
    out = parseHtml(out).textContent
  }
  return out
}

// Em dashes read poorly in ATS parsers: number ranges become "to",
// parenthetical dashes become commas.
function replaceEmDashes(str) {
  return str
    .replace(/(\d[^\s—]*)\s*—\s*(?=[~$€£¥]?\d)/g, '$1 to ')
    .replace(/^\s*—\s*/, '')
    .replace(/\s*—\s*$/, '')
    .replace(/([:;,(])\s*—\s*/g, '$1 ')
    .replace(/\s*—\s*(?=[.,;:!?)])/g, '')
    .replace(/\s*—\s*/g, ', ')
}

export function cleanText(value) {
  if (value == null) return ''
  let s = decodeHtmlText(String(value))
  s = s
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .replace(/[\u200b-\u200d\ufeff\u00ad]/g, '')
  s = replaceEmDashes(s)
  return s
    .replace(/[ \t\r\f\v]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim()
}

// Glyphs missing from the built-in Helvetica (WinAnsi) encoding, used only if
// the embedded Unicode font can't be loaded.
const HELVETICA_FALLBACK = { '≈': '~', '→': '->', '←': '<-', '≤': '<=', '≥': '>=', '−': '-', '✓': '', '★': '*' }

// ─── Rich text (case study HTML) → blocks ────────────────────────────────────

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'SVG', 'IMG', 'VIDEO', 'AUDIO'])
const BLOCK_TAGS = new Set(['P', 'DIV', 'SECTION', 'ARTICLE', 'BLOCKQUOTE', 'PRE', 'FIGURE', 'FIGCAPTION', 'HEADER', 'FOOTER', 'MAIN', 'ASIDE'])
const HEADING_RE = /^H[1-6]$/

function inlineText(node) {
  let out = ''
  node.childNodes.forEach(child => {
    if (child.nodeType === 3) out += child.nodeValue
    else if (child.nodeType !== 1 || SKIP_TAGS.has(child.tagName)) return
    else if (child.tagName === 'BR') out += '\n'
    else if (child.tagName === 'UL' || child.tagName === 'OL') return
    else if (BLOCK_TAGS.has(child.tagName) || HEADING_RE.test(child.tagName)) out += ` ${inlineText(child)}\n`
    else out += inlineText(child)
  })
  return out.replace(/[ \t\r\n]*\n[ \t\r\n]*/g, '\n').replace(/[ \t\r]+/g, ' ')
}

function pushText(blocks, type, raw, extra = {}) {
  const text = cleanText(raw)
  if (text) blocks.push({ type, text, ...extra })
}

function walkList(list, blocks, depth) {
  let n = parseInt(list.getAttribute('start') || '1', 10) || 1
  list.childNodes.forEach(item => {
    if (item.nodeType !== 1) return
    if (item.tagName !== 'LI') { walkBlocks(item, blocks, depth); return }
    pushText(blocks, 'li', inlineText(item), { depth, marker: list.tagName === 'OL' ? `${n}.` : '•' })
    n++
    item.querySelectorAll(':scope > ul, :scope > ol').forEach(sub => walkList(sub, blocks, depth + 1))
  })
}

function walkBlocks(node, blocks, depth = 0) {
  let loose = ''
  const flush = () => { pushText(blocks, 'p', loose); loose = '' }

  node.childNodes.forEach(child => {
    if (child.nodeType === 3) { loose += child.nodeValue; return }
    if (child.nodeType !== 1 || SKIP_TAGS.has(child.tagName)) return
    const tag = child.tagName

    if (HEADING_RE.test(tag)) { flush(); pushText(blocks, 'h', inlineText(child)) }
    else if (tag === 'UL' || tag === 'OL') { flush(); walkList(child, blocks, depth) }
    else if (tag === 'TABLE') {
      flush()
      child.querySelectorAll('tr').forEach(tr => {
        const cells = [...tr.children].map(td => cleanText(inlineText(td))).filter(Boolean)
        if (cells.length) blocks.push({ type: 'li', text: cells.join(' | '), depth, marker: '•' })
      })
    }
    else if (tag === 'P' || tag === 'PRE') { flush(); pushText(blocks, 'p', inlineText(child)) }
    else if (tag === 'HR') flush()
    else if (BLOCK_TAGS.has(tag) || tag === 'LI') { flush(); walkBlocks(child, blocks, depth) }
    else if (tag === 'BR') loose += '\n'
    else loose += inlineText(child)
  })
  flush()
}

export function htmlToBlocks(html) {
  if (!html) return []
  const blocks = []
  walkBlocks(parseHtml(String(html)), blocks)
  return blocks
}

// ─── Metrics ─────────────────────────────────────────────────────────────────

// Same labels the website shows on case study cards (the key_metrics keys).
export function formatMetrics(raw) {
  let metrics = raw
  if (typeof metrics === 'string') {
    const trimmed = metrics.trim()
    if (!trimmed) return ''
    try { metrics = JSON.parse(trimmed) } catch { return cleanText(trimmed) }
  }
  if (Array.isArray(metrics)) return metrics.map(cleanText).filter(Boolean).join(' | ')
  if (!metrics || typeof metrics !== 'object') return cleanText(metrics)
  return Object.entries(metrics)
    .map(([label, value]) => {
      const l = cleanText(label)
      const v = cleanText(typeof value === 'object' && value !== null ? JSON.stringify(value) : value)
      return l && v ? `${l}: ${v}` : l || v
    })
    .filter(Boolean)
    .join(' | ')
}

// ─── Layout engine ─────────────────────────────────────────────────────────

// Content is laid out as rows (one wrapped line each). A row may ask to be
// kept on the same page as the next N rows, which is how headings stay
// attached to what follows them.
function createLayout(doc, fontFamily) {
  const unicode = fontFamily !== 'helvetica'
  let y = CONTENT_TOP

  const prep = text => unicode ? text : text.replace(/[≈→←≤≥−✓★]/g, c => HELVETICA_FALLBACK[c])

  function setFont(style, size, color) {
    doc.setFont(fontFamily, style)
    doc.setFontSize(size)
    doc.setTextColor(...color)
  }

  function wrap(text, { style = 'normal', size = 9.5, width = WIDTH }) {
    doc.setFont(fontFamily, style)
    doc.setFontSize(size)
    return doc.splitTextToSize(prep(text), width)
  }

  function textRows(text, opts = {}) {
    const { style = 'normal', size = 9.5, color = BODY, x = LEFT, width = RIGHT - x, lineH = size * 0.48 } = opts
    return wrap(text, { style, size, width }).map(line => ({
      h: lineH,
      draw: top => { setFont(style, size, color); doc.text(line, x, top + lineH * 0.72) },
    }))
  }

  const spacer = h => ({ h, spacer: true, draw() {} })

  function newPage() { doc.addPage(); y = CONTENT_TOP }

  function heightOf(rows, from, count) {
    let h = 0
    for (let i = from; i < Math.min(rows.length, from + count); i++) h += rows[i].h
    return h
  }

  function place(rows, { keepFirst = 1 } = {}) {
    if (!rows.length) return
    if (y + heightOf(rows, 0, keepFirst) > CONTENT_BOTTOM) newPage()
    rows.forEach((row, i) => {
      if (row.spacer) {
        if (y !== CONTENT_TOP) y = Math.min(y + row.h, CONTENT_BOTTOM)
        return
      }
      const need = row.keepNext ? heightOf(rows, i, row.keepNext + 1) : row.h
      if (y + need > CONTENT_BOTTOM) newPage()
      row.draw(y)
      y += row.h
    })
  }

  return {
    doc, textRows, spacer, place, wrap, setFont, prep,
    get y() { return y },
    set y(v) { y = v },
  }
}

function blocksToRows(L, blocks) {
  const rows = []
  blocks.forEach((b, i) => {
    if (b.type === 'h') {
      if (i > 0) rows.push(L.spacer(1.5))
      const hRows = L.textRows(b.text, { style: 'bold', size: 9.5, color: DARK, lineH: 5 })
      // Keep the subheading with at least two lines of its content.
      hRows[hRows.length - 1].keepNext = 2
      rows.push(...hRows)
    } else if (b.type === 'li') {
      const indent = b.depth * 5
      const textX = BULLET_TEXT_X + indent
      const lines = L.textRows(b.text, { x: textX, lineH: 4.5 })
      const firstDraw = lines[0].draw
      lines[0].draw = top => {
        L.setFont('normal', 9.5, BODY)
        L.doc.text(L.prep(b.marker), BULLET_X + indent, top + 4.5 * 0.72)
        firstDraw(top)
      }
      rows.push(...lines, L.spacer(0.6))
    } else {
      if (blocks[i - 1]?.type === 'li') rows.push(L.spacer(1.2))
      rows.push(...L.textRows(b.text, { lineH: 4.5 }), L.spacer(1.8))
    }
  })
  return rows
}

function sectionRows(L, title) {
  return [
    L.spacer(3),
    {
      h: 9,
      keepNext: 3,
      draw: top => {
        L.setFont('bold', 11, ACCENT)
        L.doc.text(title.toUpperCase(), LEFT, top + 5)
        L.doc.setDrawColor(...ACCENT)
        L.doc.setLineWidth(0.3)
        L.doc.line(LEFT, top + 6.8, RIGHT, top + 6.8)
      },
    },
  ]
}

// Title on the left, dates (or similar) right-aligned on the same line.
function titleRow(L, left, right, { style = 'bold', size = 10.5, color = DARK, rightColor = MUTED, lineH = 5.2 } = {}) {
  const rightW = right ? (L.setFont('normal', 9, rightColor), L.doc.getTextWidth(L.prep(right)) + 4) : 0
  const lines = L.textRows(left, { style, size, color, width: WIDTH - rightW, lineH })
  if (right) {
    const firstDraw = lines[0].draw
    lines[0].draw = top => {
      firstDraw(top)
      L.setFont('normal', 9, rightColor)
      L.doc.text(L.prep(right), RIGHT, top + lineH * 0.72, { align: 'right' })
    }
  }
  return lines
}

function formatMonth(date) {
  if (!date) return ''
  const d = new Date(date)
  return Number.isNaN(d.getTime()) ? cleanText(date) : d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

const looksLikeHtml = s => typeof s === 'string' && TAG_RE.test(s)

function descriptionBlocks(text) {
  if (!text) return []
  if (looksLikeHtml(text)) return htmlToBlocks(text)
  return cleanText(text)
    .split(/\n+|•\s*|\.\s+(?=[A-Z])/)
    .map(s => s.trim().replace(/\.$/, ''))
    .filter(s => s.length > 3)
    .map(text => ({ type: 'li', text, depth: 0, marker: '•' }))
}

function paragraphBlocks(text) {
  if (!text) return []
  if (looksLikeHtml(text)) return htmlToBlocks(text)
  return cleanText(text).split(/\n{2,}/).map(t => ({ type: 'p', text: t.replace(/\n/g, ' ') }))
}

// ─── Document ──────────────────────────────────────────────────────────────

export function buildResumePdf({ about, experience, skills, education, caseStudies }, { fonts } = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  let family = 'helvetica'
  if (fonts?.regular && fonts?.bold) {
    doc.addFileToVFS('LiberationSans-Regular.ttf', fonts.regular)
    doc.addFont('LiberationSans-Regular.ttf', 'LiberationSans', 'normal')
    doc.addFileToVFS('LiberationSans-Bold.ttf', fonts.bold)
    doc.addFont('LiberationSans-Bold.ttf', 'LiberationSans', 'bold')
    family = 'LiberationSans'
  }
  const L = createLayout(doc, family)

  const name = cleanText(about?.name) || 'Prince Pandey'
  doc.setProperties({ title: `${name} Resume`, author: name, subject: 'Resume', creator: 'marketingbyprince.com' })

  // ── Header ─────────────────────────────────────────────────────────
  doc.setFillColor(...ACCENT)
  doc.rect(0, 0, PAGE_W, 38, 'F')
  L.setFont('bold', 22, [255, 255, 255])
  doc.text(L.prep(name), LEFT, 16)
  L.setFont('normal', 10, [255, 235, 220])
  doc.text(L.wrap(cleanText(about?.tagline), { size: 10 })[0] || '', LEFT, 24)
  const contact = [about?.email, about?.phone, about?.is_location_visible && about?.location]
    .map(cleanText).filter(Boolean).join('  |  ')
  L.setFont('normal', 9, [255, 240, 230])
  doc.text(L.prep(contact), LEFT, 32)
  L.y = 44

  // ── Summary ────────────────────────────────────────────────────────
  const summary = paragraphBlocks(about?.description)
  if (summary.length) {
    L.place([...sectionRows(L, 'Summary'), ...blocksToRows(L, summary)], { keepFirst: 4 })
  }

  // ── Experience ─────────────────────────────────────────────────────
  if (experience?.length) {
    experience.forEach((job, i) => {
      const end = job.is_current ? 'Present' : formatMonth(job.end_date)
      const range = [formatMonth(job.start_date), end].filter(Boolean).join(' - ')
      const head = [
        ...(i > 0 ? [L.spacer(2.5)] : sectionRows(L, 'Experience')),
        ...titleRow(L, cleanText(job.role), range),
        ...L.textRows(cleanText(job.company), { size: 9.5, color: ACCENT, lineH: 5 }),
        L.spacer(0.8),
      ]
      const body = blocksToRows(L, descriptionBlocks(job.description))
      L.place([...head, ...body], { keepFirst: head.length + 2 })
    })
  }

  // ── Case Studies ───────────────────────────────────────────────────
  if (caseStudies?.length) {
    caseStudies.forEach((cs, i) => {
      const industry = cleanText(cs.industry)
      const metrics = formatMetrics(cs.key_metrics)
      const head = [
        ...(i > 0 ? [L.spacer(3.5)] : sectionRows(L, 'Case Studies')),
        ...titleRow(L, cleanText(cs.client_name || cs.title), ''),
        ...(industry ? L.textRows(industry, { size: 9.5, color: ACCENT, lineH: 5 }) : []),
        ...(metrics ? L.textRows(`Metrics: ${metrics}`, { style: 'bold', size: 9, color: DARK, lineH: 4.6 }) : []),
        L.spacer(1.2),
      ]
      const tail = []
      if (cs.portfolio_url) {
        tail.push(...L.textRows(cleanText(cs.portfolio_url), { size: 8.5, color: [60, 100, 200], lineH: 4.5 }))
      }
      const body = [...blocksToRows(L, htmlToBlocks(cs.results)), ...tail]
      // Title, industry and metrics always land on the same page as at
      // least the first three lines of the write-up.
      L.place([...head, ...body], { keepFirst: head.length + 3 })
    })
  }

  // ── Skills ─────────────────────────────────────────────────────────
  if (skills?.length) {
    const grouped = {}
    skills.forEach(s => {
      const cat = cleanText(s.category) || 'Other'
      ;(grouped[cat] ||= []).push(cleanText(s.name))
    })
    const rows = []
    Object.entries(grouped).forEach(([cat, names]) => {
      const label = `${cat}:`
      L.setFont('bold', 9.5, DARK)
      const labelW = doc.getTextWidth(L.prep(label)) + 2
      const lines = L.textRows(names.filter(Boolean).join(', '), { x: LEFT + labelW, lineH: 4.8 })
      const firstDraw = lines[0].draw
      lines[0].draw = top => {
        L.setFont('bold', 9.5, DARK)
        doc.text(L.prep(label), LEFT, top + 4.8 * 0.72)
        firstDraw(top)
      }
      rows.push(...lines, L.spacer(1))
    })
    L.place([...sectionRows(L, 'Skills'), ...rows], { keepFirst: 4 })
  }

  // ── Education ──────────────────────────────────────────────────────
  if (education?.length) {
    education.forEach((edu, i) => {
      const degree = [cleanText(edu.degree), cleanText(edu.field_of_study)].filter(Boolean).join(' in ')
      const years = [edu.start_year, edu.is_current ? 'Present' : edu.end_year].filter(Boolean).join(' - ')
      L.place([
        ...(i > 0 ? [L.spacer(2.5)] : sectionRows(L, 'Education')),
        ...titleRow(L, degree, cleanText(years)),
        ...L.textRows(cleanText(edu.institution), { size: 9.5, color: ACCENT, lineH: 5 }),
      ], { keepFirst: 99 })
    })
  }

  // ── Footer (drawn last so the page count is known) ─────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(225, 225, 225)
    doc.setLineWidth(0.2)
    doc.line(LEFT, FOOTER_RULE_Y, RIGHT, FOOTER_RULE_Y)
    L.setFont('normal', 8, [150, 150, 150])
    doc.text('marketingbyprince.com', LEFT, FOOTER_TEXT_Y)
    doc.text(`Page ${i} of ${pageCount}`, RIGHT, FOOTER_TEXT_Y, { align: 'right' })
  }

  return doc
}
