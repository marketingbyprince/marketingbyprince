import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'

// content: { eyebrow, title, subtitle, cards[{ pillar, title, description, icon, href }] }
export default function ServicesGridSection({ content = {} }) {
  const { eyebrow, title, subtitle, cards = [] } = content
  if (!cards.length) return null

  return (
    <section className="py-16 lg:py-24" style={{ backgroundColor: '#fff' }}>
      <div className="section-wrap">
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => (
            <Link key={card.pillar || card.title} href={card.href || '/services'} className="card-interactive p-6 block">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ backgroundColor: 'var(--accent-muted)' }}>
                {card.icon || '📌'}
              </div>
              <h3 className="heading-section mb-2">{card.title}</h3>
              {card.description && <p className="text-body-sm text-gray-500 mb-4">{card.description}</p>}
              <span className="text-body-sm font-bold inline-flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                Explore <span>&rarr;</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
