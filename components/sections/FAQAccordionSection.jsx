'use client'
import { useState } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'

// content: { eyebrow, title, subtitle, items?: [{ question, answer }] }
// If items is omitted, pass faqs (fetched from the `faqs` table for this page) instead.
export default function FAQAccordionSection({ content = {}, faqs }) {
  const { eyebrow = 'FAQs', title = 'Frequently Asked Questions', subtitle } = content
  const items = faqs?.length ? faqs.map(f => ({ question: f.question, answer: f.answer })) : (content.items || [])
  const [openIndex, setOpenIndex] = useState(null)

  if (!items.length) return null

  return (
    <section className="py-16">
      <div className="section-wrap max-w-3xl">
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} align="center" />
        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-deep">{item.question}</span>
                  <svg
                    className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-body-sm text-gray-500">{item.answer}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
