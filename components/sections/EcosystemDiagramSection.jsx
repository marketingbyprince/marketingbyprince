import SectionHeader from '@/components/ui/SectionHeader'

// content: { eyebrow, title, subtitle, centerLabel, nodes[{ label, icon }] }
export default function EcosystemDiagramSection({ content = {} }) {
  const { eyebrow, title, subtitle, centerLabel = 'Performance Marketing', nodes = [] } = content
  if (!nodes.length) return null

  return (
    <section className="py-16 lg:py-24" style={{ backgroundColor: '#fff' }}>
      <div className="section-wrap">
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} align="center" />

        <div className="flex flex-col items-center gap-8">
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center text-center font-extrabold text-white px-4 shrink-0"
            style={{ backgroundColor: 'var(--accent)', boxShadow: 'var(--shadow-accent-lg)' }}
          >
            {centerLabel}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
            {nodes.map(node => (
              <div key={node.label} className="card p-4 text-center">
                <div className="text-xl mb-2">{node.icon || '⚙️'}</div>
                <div className="text-body-sm font-semibold text-deep">{node.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
