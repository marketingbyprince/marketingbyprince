import HeroSection from './HeroSection'
import RichTextSection from './RichTextSection'
import CTASection from './CTASection'
import FAQAccordionSection from './FAQAccordionSection'
import LegacyHomeSection from './LegacyHomeSection'

// Registry mapping a page_sections.section_type value to its renderer.
// New section types (TrustLogos, Stats, ServicesGrid, Testimonials, etc.)
// get added here as they're built in later phases.
export const SECTION_REGISTRY = {
  hero: HeroSection,
  rich_text: RichTextSection,
  cta: CTASection,
  faq_accordion: FAQAccordionSection,
  // Wraps an existing hardcoded page (e.g. HomeClient) as a single opaque
  // section so it can live in the page-builder pipeline unchanged, pending
  // a later decomposition into real reusable sections.
  legacy_home: LegacyHomeSection,
}
