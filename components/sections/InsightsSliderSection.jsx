import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'

// content: { eyebrow, title, subtitle, ctaLabel, ctaHref }
// data: { articles: [...] } — latest 3 published articles
export default function InsightsSliderSection({ content = {}, data = {} }) {
  const { eyebrow, title, subtitle, ctaLabel = 'View All Insights', ctaHref = '/blog' } = content
  const articles = data.articles || []
  if (!articles.length) return null

  return (
    <section className="py-16 lg:py-24" style={{ backgroundColor: '#fff' }}>
      <div className="section-wrap">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
          <Link href={ctaHref} className="text-body-sm font-bold shrink-0 mb-12" style={{ color: 'var(--accent)' }}>
            {ctaLabel} &rarr;
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {articles.map(a => (
            <Link key={a.id} href={`/blog/${a.slug}`} className="card-interactive overflow-hidden block">
              {a.cover_image_url ? (
                <img src={a.cover_image_url} alt={a.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-3xl" style={{ background: 'var(--accent-muted)' }}>✍️</div>
              )}
              <div className="p-5">
                {a.category && <span className="badge-accent mb-2 inline-block">{a.category}</span>}
                <h3 className="font-extrabold text-deep text-sm leading-snug">{a.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
