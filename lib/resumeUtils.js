import { supabase } from './supabase'
import { buildResumePdf } from './resumePdf'

// Liberation Sans (OFL, Helvetica-metric) is embedded so symbols like ≈ and →
// render; jsPDF's built-in Helvetica only covers WinAnsi.
const FONT_URLS = {
  regular: '/fonts/resume/LiberationSans-Regular.ttf',
  bold: '/fonts/resume/LiberationSans-Bold.ttf',
}

async function fetchFontBase64(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Font request failed: ${url}`)
  const bytes = new Uint8Array(await res.arrayBuffer())
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

async function loadFonts() {
  try {
    const [regular, bold] = await Promise.all([fetchFontBase64(FONT_URLS.regular), fetchFontBase64(FONT_URLS.bold)])
    return { regular, bold }
  } catch (e) {
    // Falls back to Helvetica with ASCII stand-ins for unsupported symbols.
    console.warn('Resume font unavailable, using Helvetica', e)
    return null
  }
}

export async function generateResume() {
  const [
    fonts,
    { data: about },
    { data: experience },
    { data: skills },
    { data: education },
    { data: caseStudies },
  ] = await Promise.all([
    loadFonts(),
    supabase.from('about_content').select('*').single(),
    supabase.from('work_experience').select('*').order('sort_order'),
    supabase.from('skills').select('*').order('category').order('sort_order'),
    supabase.from('education').select('*').order('sort_order'),
    supabase.from('case_studies').select('*').eq('is_visible_on_resume', true).order('sort_order'),
  ])

  const doc = buildResumePdf({ about, experience, skills, education, caseStudies }, { fonts })
  doc.save(`Prince_Pandey_Resume_${new Date().getFullYear()}.pdf`)
}
