import SectionHeader from '@/components/ui/SectionHeader'

// content: { eyebrow, title, subtitle, cards[{ icon, title, description }] }
export default function FeatureCardsSection({ content = {} }) {
  const { eyebrow, title, subtitle, cards = [] } = content
  if (!cards.length) return null

  return (
    <section className="py-16 lg:py-24" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="section-wrap">
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} align="center" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => (
            <div key={card.title} className="card p-6">
              <div className="text-2xl mb-4">{card.icon || '✦'}</div>
              <h3 className="font-extrabold text-deep mb-2">{card.title}</h3>
              {card.description && <p className="text-body-sm text-gray-500">{card.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
