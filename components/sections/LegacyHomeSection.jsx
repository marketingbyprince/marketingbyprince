import HomeClient from '@/app/(public)/HomeClient'

// Renders the pre-existing, hardcoded homepage unchanged inside the
// page-builder pipeline. Ignores `content`/`faqs` — HomeClient still owns
// its own data fetching. Superseded once Home is decomposed into real
// reusable sections (Hero, ServicesGrid, Process, PricingCards, ...).
export default function LegacyHomeSection() {
  return <HomeClient />
}
