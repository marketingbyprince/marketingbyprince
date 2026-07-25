import PageRenderer from './PageRenderer'
import { getPageWithSections } from '@/lib/pages'

// Renders a simple page-builder-driven page (legal pages, etc). Shows a
// friendly placeholder when the page hasn't been published or has no
// sections yet, rather than a broken/empty layout.
export default async function StaticPage({ slug, fallbackTitle }) {
  const page = await getPageWithSections(slug)

  if (!page || page.sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4" style={{ paddingTop: '80px' }}>
        <div>
          <span className="eyebrow mb-3 inline-block">{fallbackTitle}</span>
          <h1 className="heading-display mb-4">Coming Soon</h1>
          <p className="text-body text-gray-500 max-w-md mx-auto">
            This page is being prepared and will be published shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '80px' }}>
      <PageRenderer sections={page.sections} faqsBySection={page.faqsBySection} />
    </div>
  )
}
