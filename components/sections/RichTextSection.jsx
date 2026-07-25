// content: { eyebrow, title, html, align }
export default function RichTextSection({ content = {} }) {
  const { eyebrow, title, html, align = 'left' } = content
  if (!html && !title) return null

  const centerClass = align === 'center' ? 'text-center mx-auto' : ''

  return (
    <section className="py-16">
      <div className={`section-wrap max-w-3xl ${centerClass}`}>
        {eyebrow && <span className="eyebrow mb-3 inline-block">{eyebrow}</span>}
        {title && <h2 className="heading-display mb-6">{title}</h2>}
        {html && (
          <div className="prose prose-slate max-w-none text-body text-gray-600" dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </div>
    </section>
  )
}
