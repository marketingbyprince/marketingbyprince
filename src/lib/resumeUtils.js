import { jsPDF } from 'jspdf'
import { supabase } from './supabase'

const ACCENT = [255, 105, 51] // #FF6933

function addSection(doc, title, y) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...ACCENT)
  doc.text(title.toUpperCase(), 20, y)
  doc.setDrawColor(...ACCENT)
  doc.setLineWidth(0.3)
  doc.line(20, y + 2, 190, y + 2)
  doc.setTextColor(40, 40, 40)
  return y + 8
}

function wrapText(doc, text, x, y, maxWidth, lineHeight = 5) {
  if (!text) return y
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(80, 80, 80)
  const lines = doc.splitTextToSize(text, maxWidth)
  lines.forEach(line => {
    if (y > 275) return
    doc.text(line, x, y)
    y += lineHeight
  })
  return y
}

function checkPage(doc, y, needed = 20) {
  if (y + needed > 280) {
    doc.addPage()
    return 20
  }
  return y
}

export async function generateResume() {
  const [
    { data: about },
    { data: experience },
    { data: skillsData },
    { data: educationData },
    { data: caseStudies },
  ] = await Promise.all([
    supabase.from('about_content').select('*').single(),
    supabase.from('work_experience').select('*').order('sort_order'),
    supabase.from('skills').select('*').order('category').order('sort_order'),
    supabase.from('education').select('*').order('sort_order'),
    supabase.from('case_studies').select('*').eq('is_visible_on_resume', true).order('sort_order'),
  ])

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  // ── Header ─────────────────────────────────────────────────
  doc.setFillColor(...ACCENT)
  doc.rect(0, 0, 210, 38, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.text(about?.name || 'Prince Pandey', 20, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(255, 220, 200)
  doc.text(about?.tagline || '', 20, 24)

  const contactLine = [about?.email, about?.phone, about?.is_location_visible && about?.location]
    .filter(Boolean).join('   |   ')
  doc.setFontSize(9)
  doc.setTextColor(255, 235, 220)
  doc.text(contactLine, 20, 32)

  let y = 48

  // ── Summary ───────────────────────────────────────────────────
  if (about?.description) {
    y = addSection(doc, 'Professional Summary', y)
    y = wrapText(doc, about.description, 20, y, 170)
    y += 4
  }

  // ── Work Experience ──────────────────────────────────────────────────
  if (experience?.length) {
    y = checkPage(doc, y)
    y = addSection(doc, 'Work Experience', y)

    experience.forEach(job => {
      y = checkPage(doc, y, 25)

      const startFmt = job.start_date
        ? new Date(job.start_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
        : ''
      const endFmt = job.is_current
        ? 'Present'
        : job.end_date
          ? new Date(job.end_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
          : ''
      const dateRange = [startFmt, endFmt].filter(Boolean).join(' – ')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(30, 30, 30)
      doc.text(job.role, 20, y)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...ACCENT)
      doc.text(job.company, 20, y + 5)

      doc.setTextColor(130, 130, 130)
      doc.text(dateRange, 190, y + 5, { align: 'right' })

      y += 10

      if (job.description) {
        const bullets = job.description.split(/\.\s+|•\s*|\n/).filter(b => b.trim().length > 3)
        bullets.forEach(bullet => {
          y = checkPage(doc, y)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(9)
          doc.setTextColor(80, 80, 80)
          const wrapped = doc.splitTextToSize(`• ${bullet.trim()}`, 165)
          wrapped.forEach(line => { doc.text(line, 23, y); y += 4.5 })
        })
      }
      y += 4
    })
  }

  // ── Case Studies & Portfolio ────────────────────────────────────────────
  if (caseStudies?.length) {
    y = checkPage(doc, y)
    y = addSection(doc, 'Case Studies & Portfolio', y)

    caseStudies.forEach(cs => {
      y = checkPage(doc, y, 20)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(30, 30, 30)
      const clientLabel = cs.industry ? `${cs.client_name}  ·  ${cs.industry}` : cs.client_name
      doc.text(clientLabel, 20, y)
      y += 5

      if (cs.results) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(80, 80, 80)
        const resultLines = doc.splitTextToSize(cs.results, 165)
        resultLines.forEach(line => { y = checkPage(doc, y); doc.text(line, 23, y); y += 4.5 })
      }

      const metricsStr = typeof cs.key_metrics === 'string'
        ? cs.key_metrics
        : cs.key_metrics && typeof cs.key_metrics === 'object'
          ? Object.values(cs.key_metrics).join(' · ')
          : ''
      if (metricsStr) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(...ACCENT)
        const mLines = doc.splitTextToSize(`Metrics: ${metricsStr}`, 165)
        mLines.forEach(line => { y = checkPage(doc, y); doc.text(line, 23, y); y += 4.5 })
      }

      if (cs.portfolio_url) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(100, 130, 220)
        doc.text(cs.portfolio_url, 23, y)
        y += 4.5
      }

      y += 3
    })
    y += 2
  }

  // ── Skills ─────────────────────────────────────────────────────
  if (skillsData?.length) {
    y = checkPage(doc, y)
    y = addSection(doc, 'Skills & Expertise', y)

    const grouped = {}
    skillsData.forEach(s => {
      const cat = s.category || 'Other'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(s.name)
    })

    Object.entries(grouped).forEach(([cat, names]) => {
      y = checkPage(doc, y)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(60, 60, 60)
      doc.text(`${cat}:`, 20, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      const nameStr = names.join('  ·  ')
      const wrapped = doc.splitTextToSize(nameStr, 145)
      wrapped.forEach((line, i) => { doc.text(line, i === 0 ? 50 : 20, y + i * 4.5) })
      y += wrapped.length * 4.5 + 2
    })
    y += 2
  }

  // ── Education ───────────────────────────────────────────────────
  if (educationData?.length) {
    y = checkPage(doc, y)
    y = addSection(doc, 'Education', y)

    educationData.forEach(edu => {
      y = checkPage(doc, y)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(30, 30, 30)
      doc.text(`${edu.degree}${edu.field_of_study ? ` in ${edu.field_of_study}` : ''}`, 20, y)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...ACCENT)
      doc.text(edu.institution, 20, y + 5)
      const yearRange = [edu.start_year, edu.is_current ? 'Ongoing' : edu.end_year].filter(Boolean).join(' – ')
      doc.setTextColor(130, 130, 130)
      doc.text(yearRange, 190, y + 5, { align: 'right' })
      y += 12
    })
  }

  // ── Footer ────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7.5)
    doc.setTextColor(180, 180, 180)
    doc.text('marketingbyprince.com', 20, 290)
    doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: 'right' })
  }

  doc.save(`Prince_Pandey_Resume_${new Date().getFullYear()}.pdf`)
}
