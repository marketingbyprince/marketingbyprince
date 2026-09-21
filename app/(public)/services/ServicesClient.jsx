import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'
import ServiceCard from '@/components/ServiceCard'

const PM_FALLBACK = {
  id: 'performance-marketing',
  title: 'Performance Marketing & Paid Media Management',
  description: 'Meta, Google, TikTok, X, Reddit, Pinterest, Telegram, Taboola, Traffic Junky & AI-native ad platforms.',
  icon: '🚀',
  slug: 'performance-marketing',
}

const NEW_SERVICES = [
  {
    id: 'google-ads-management',
    title: 'Google Ads Management',
    description: 'Search, Performance Max, Shopping and YouTube campaigns built around conversion tracking and profitable growth.',
    icon: '🔍',
    slug: 'google-ads-management',
  },
  {
    id: 'meta-ads-management',
    title: 'Meta Ads Management',
    description: 'Facebook and Instagram Ads management focused on creative testing, tracking and profitable scaling.',
    icon: '📱',
    slug: 'meta-ads-management',
  },
  {
    id: 'linkedin-ads-management',
    title: 'LinkedIn Ads Management',
    description: 'B2B LinkedIn Ads built around precise targeting, lead quality and cost per lead, not just impressions.',
    icon: '💼',
    slug: 'linkedin-ads-management',
  },
  {
    id: 'tiktok-ads-management',
    title: 'TikTok Ads Management',
    description: 'TikTok Ads management built around creative testing and conversion tracking, turning attention into acquisition.',
    icon: '🎵',
    slug: 'tiktok-ads-management',
  },
  {
    id: 'tracking-attribution-analytics',
    title: 'Tracking, Attribution & Analytics',
    description: 'GA4, Google Tag Manager and server-side tracking setup, so your ad decisions are based on real data.',
    icon: '📊',
    slug: 'tracking-attribution-analytics',
  },
  {
    id: 'landing-page-cro',
    title: 'Landing Page & CRO',
    description: 'Landing page build and conversion rate optimization so the traffic you already pay for converts more often.',
    icon: '🖥️',
    slug: 'landing-page-cro',
  },
  {
    id: 'ppc-audit',
    title: 'PPC & Ad Account Audit',
    description: 'An independent audit of your Google, Meta, LinkedIn or TikTok account, covering tracking, structure and wasted spend.',
    icon: '🧐',
    slug: 'ppc-audit',
  },
  {
    id: 'white-label-ppc',
    title: 'White-Label PPC for Agencies',
    description: 'White-label PPC execution for agencies across Google, Meta, LinkedIn and TikTok Ads, delivered under your brand.',
    icon: '🤝',
    slug: 'white-label-ppc',
  },
]

export default function ServicesClient({ performanceMarketingCard }) {
  const pmCard = performanceMarketingCard || PM_FALLBACK

  return (
    <div className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-wrap">

        <SectionHeader
          eyebrow="Services"
          title="Performance Marketing Services"
          subtitle="Paid media, tracking and conversion work focused on one thing: profitable growth."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          <ServiceCard service={pmCard} />
          {NEW_SERVICES.map(s => <ServiceCard key={s.id} service={s} />)}
        </div>

        <div
          className="rounded-2xl p-10 text-center"
          style={{
            backgroundColor: 'var(--accent-muted)',
            border: '1px solid var(--accent-border)',
          }}
        >
          <h3 className="heading-section mb-2">Don&rsquo;t see what you need?</h3>
          <p className="text-body text-gray-500 mb-6 max-w-md mx-auto">
            Let&rsquo;s discuss a custom solution tailored to your exact goals and budget.
          </p>
          <Link href="/contact" className="btn-primary btn-lg">Talk to Me</Link>
        </div>

      </div>
    </div>
  )
}
