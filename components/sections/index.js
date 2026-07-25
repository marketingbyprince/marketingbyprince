import HeroSection from './HeroSection'
import RichTextSection from './RichTextSection'
import CTASection from './CTASection'
import FAQAccordionSection from './FAQAccordionSection'
import LegacyHomeSection from './LegacyHomeSection'
import HeroSectionV2 from './HeroSectionV2'
import StatsTrustSection from './StatsTrustSection'
import ServicesGridSection from './ServicesGridSection'
import FeatureCardsSection from './FeatureCardsSection'
import ProcessTimelineSection from './ProcessTimelineSection'
import CaseStudySliderSection from './CaseStudySliderSection'
import IndustriesGridSection from './IndustriesGridSection'
import EcosystemDiagramSection from './EcosystemDiagramSection'
import TestimonialsSliderSection from './TestimonialsSliderSection'
import InsightsSliderSection from './InsightsSliderSection'

// Registry mapping a page_sections.section_type value to its renderer.
export const SECTION_REGISTRY = {
  hero: HeroSection,
  rich_text: RichTextSection,
  cta: CTASection,
  faq_accordion: FAQAccordionSection,
  // Wraps an existing hardcoded page (e.g. HomeClient) as a single opaque
  // section so it can live in the page-builder pipeline unchanged, pending
  // a later decomposition into real reusable sections.
  legacy_home: LegacyHomeSection,
  // Homepage redesign section library (richer than the generic 'hero' above,
  // built specifically for the Home conversion-funnel layout).
  hero_v2: HeroSectionV2,
  stats_trust: StatsTrustSection,
  services_grid: ServicesGridSection,
  feature_cards: FeatureCardsSection,
  process_timeline: ProcessTimelineSection,
  case_study_slider: CaseStudySliderSection,
  industries_grid: IndustriesGridSection,
  ecosystem_diagram: EcosystemDiagramSection,
  testimonials_slider: TestimonialsSliderSection,
  insights_slider: InsightsSliderSection,
}
