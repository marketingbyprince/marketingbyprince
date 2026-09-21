import SectionHeader from '@/components/ui/SectionHeader'

// Matches a URL (http/https or bare www.) or an email address, stopping
// before any trailing punctuation so "...visit https://x.com." doesn't pull
// the period into the link.
const LINK_RE = /(https?:\/\/[^\s<]+[^\s<.,;:'")\]]|www\.[^\s<]+[^\s<.,;:'")\]]|[\w.+-]+@[\w-]+\.[\w.-]+)/g
const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.-]+$/

function linkify(text) {
  if (!text) return text
  return text.split(LINK_RE).map((part, i) => {
    if (!part) return null
    if (EMAIL_RE.test(part)) {
      return <a key={i} href={`mailto:${part}`} className="underline decoration-1 underline-offset-2" style={{ color: 'var(--accent)' }}>{part}</a>
    }
    if (/^(https?:\/\/|www\.)/.test(part)) {
      const href = part.startsWith('www.') ? `https://${part}` : part
      return <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-1 underline-offset-2" style={{ color: 'var(--accent)' }}>{part}</a>
    }
    return part
  })
}

// faqs: [{ question, answer }] from lib/seo's getPageFaqs(), same list the
// page's FAQPage JSON-LD is built from. Renders nothing when empty.
export default function FaqSection({ faqs }) {
  if (!faqs?.length) return null

  return (
    <section className="py-16">
      <div className="section-wrap max-w-3xl">
        <SectionHeader eyebrow="FAQ" title="Frequently Asked Questions" align="center" />
        <div className="space-y-3">
          {faqs.map((item, i) => (
            <details key={i} className="card group overflow-hidden" open={i === 0}>
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <h3 className="font-semibold text-deep text-body">{item.question}</h3>
                <svg
                  className="w-4 h-4 shrink-0 transition-transform group-open:rotate-180"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-body-sm text-gray-500">{linkify(item.answer)}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
