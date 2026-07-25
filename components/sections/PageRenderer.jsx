import { SECTION_REGISTRY } from './index'

// Renders a page's sections in order. Unknown section_types are skipped
// (logged in dev) rather than crashing the page.
export default function PageRenderer({ sections = [], faqsBySection = {}, dataBySection = {} }) {
  return (
    <>
      {sections.map((section) => {
        const Renderer = SECTION_REGISTRY[section.section_type]
        if (!Renderer) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`PageRenderer: unknown section_type "${section.section_type}"`)
          }
          return null
        }
        return (
          <Renderer
            key={section.id}
            content={section.content || {}}
            faqs={faqsBySection[section.id]}
            data={dataBySection[section.id]}
          />
        )
      })}
    </>
  )
}
