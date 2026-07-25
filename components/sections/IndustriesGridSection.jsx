import SectionHeader from '@/components/ui/SectionHeader'

// content: { eyebrow, title, subtitle, industries[{ name, icon }] }
export default function IndustriesGridSection({ content = {} }) {
  const { eyebrow, title, subtitle, industries = [] } = content
  if (!industries.length) return null

  return (
    <section className="py-16 lg:py-24" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="section-wrap">
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} align="center" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {industries.map(ind => (
            <div key={ind.name} className="card p-5 flex items-center gap-3">
              <span className="text-2xl leading-none">{ind.icon || '🏢'}</span>
              <span className="font-semibold text-deep text-sm">{ind.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
