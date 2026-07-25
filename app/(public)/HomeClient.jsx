'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

/* ── Static fallback data ──────────────────────────────────────── */

const DEFAULT_SERVICES = [
  { id: 1,  title: 'Performance Marketing & Paid Media Management',      description: 'Meta, Google, TikTok, X, Reddit, Pinterest, Telegram, Taboola, Traffic Junky & AI-native ad platforms.' },
  { id: 2,  title: 'Marketing Automation & CRM Architecture',            description: 'Email, SMS, WhatsApp automation + CRM setup (HubSpot, Salesforce, GoHighLevel, ActiveCampaign).' },
  { id: 3,  title: 'Tracking, Attribution & Analytics Setup',            description: 'Server-side tracking (CAPI), GA4, GTM, Mixpanel/Amplitude, custom attribution modeling.' },
  { id: 4,  title: 'SEO & Answer Engine Optimization (AEO)',             description: 'Traditional SEO plus optimization for ChatGPT, Perplexity, Gemini and AI search.' },
  { id: 5,  title: 'Website & Landing Page Development',                 description: 'CMS setups, WordPress/Webflow/Shopify, custom builds, and conversion rate optimization.' },
  { id: 6,  title: 'Mobile App Development & App Store Optimization (ASO)', description: 'iOS/Android development + Play Console & App Store listing optimization.' },
  { id: 7,  title: 'Workflow & AI Automation Consulting',                description: 'AI flowcharts, Zapier/Make/n8n automation, and operational workflow design.' },
  { id: 8,  title: 'Social Media Marketing & Organic Growth',            description: 'Content strategy, community management, and cross-platform organic growth.' },
  { id: 9,  title: 'Chrome Extension Development & Store Optimization',  description: 'Custom extensions + Chrome Web Store (CWS) listing and install optimization.' },
  { id: 10, title: 'White-Label Digital Services for Agencies',          description: 'Campaign management, dev, automation, and tracking delivered under your brand.' },
]

const PROCESS_STEPS = [
  { title: 'Audit',    desc: 'Deep-dive into your current ad accounts, tracking, and attribution gaps.' },
  { title: 'Build',    desc: 'Architecture of campaigns, creatives, and tracking infrastructure.' },
  { title: 'Scale',    desc: 'Aggressive budget allocation toward winning audiences and creatives.' },
  { title: 'Optimize', desc: 'Continuous A/B testing, CRO, and margin protection.' },
]

const STATS = [
  { number: '3+',   label: 'Years Experience' },
  { number: '40+',  label: 'Client Accounts' },
  { number: '$12K+', label: 'Monthly Ad Budget Managed' },
  { number: '10x',  label: 'Peak ROAS' },
]

const PRICING_BULLETS = [
  'Full-funnel strategy',
  'Dedicated account management',
  'Weekly performance reviews',
  'Priority support & optimization',
]

/* ── Reusable section headline ─────────────────────────────────── */
function SectionHeadline({ children, light = false }) {
  return (
    <h2 className="section-headline" style={{ color: light ? '#fff' : '#111827' }}>
      {children}
    </h2>
  )
}

/* ── Milestone badge (numbered list item) ──────────────────────── */
function MilestoneBadge({ n, light = false }) {
  const num = String(n).padStart(2, '0')
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '26px',
        height: '19px',
        backgroundColor: light ? '#FF6933' : '#111827',
        color: '#fff',
        fontSize: '10px',
        fontWeight: 800,
        borderRadius: '4px',
        flexShrink: 0,
      }}
    >
      {num}
    </span>
  )
}

/* ── Hero slider ───────────────────────────────────────────────── */
function HeroSlider({ slides }) {
  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)
  const timerRef  = useRef(null)
  const startX    = useRef(null)

  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const next = useCallback(() => setCurrent(c => (c + 1) % (slides.length || 1)), [slides.length])
  const prev = useCallback(() => setCurrent(c => (c - 1 + (slides.length || 1)) % (slides.length || 1)), [slides.length])

  useEffect(() => {
    if (prefersReduced || paused || slides.length < 2) return
    timerRef.current = setInterval(next, 5000)
    return () => clearInterval(timerRef.current)
  }, [paused, slides.length, next, prefersReduced])

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    startX.current = null
  }

  if (!slides.length) {
    return (
      <div
        className="w-full h-full rounded-xl flex items-center justify-center"
        style={{
          background: '#F9FAFB',
          backgroundImage: 'radial-gradient(circle, #E5E7EB 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          minHeight: '300px',
        }}
      >
        <span style={{ color: '#9CA3AF', fontSize: '13px' }}>Hero images will appear here</span>
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: '300px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id || i}
          className="absolute inset-0 transition-opacity"
          style={{
            opacity: i === current ? 1 : 0,
            transitionDuration: '600ms',
            transitionTimingFunction: 'ease-in-out',
          }}
        >
          <img
            src={slide.image_url}
            alt={slide.alt_text || 'Hero slide'}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)',
            }}
          />
        </div>
      ))}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-4 md:right-4 left-0 md:left-auto flex justify-center md:justify-end gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all min-w-[8px] min-h-[8px]"
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: i === current ? '#FF6933' : '#D1D5DB',
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main page ─────────────────────────────────────────────────── */
export default function HomeClient() {
  const [services,    setServices]    = useState([])
  const [heroSlides,  setHeroSlides]  = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    async function fetchSlides() {
      try {
        const now = new Date().toISOString()
        const { data } = await supabase
          .from('hero_slides')
          .select('id,image_url,alt_text,display_order')
          .eq('is_active', true)
          .lte('start_date', now)
          .or('end_date.is.null,end_date.gte.' + now)
          .order('display_order', { ascending: true })
        if (data?.length) setHeroSlides(data)
      } catch {}
    }

    async function fetchServices() {
      try {
        const { data } = await supabase
          .from('services')
          .select('id,title,description,cta_link')
          .eq('is_active', true)
          .eq('show_on_homepage', true)
          .order('homepage_order', { ascending: true })
          .limit(10)
        if (data?.length) setServices(data)
      } catch {}
    }

    Promise.all([fetchSlides(), fetchServices()]).finally(() => setLoading(false))
  }, [])

  const displayServices = services.length ? services : DEFAULT_SERVICES

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Raleway', sans-serif" }}>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section
        id="hero"
        className="w-full flex flex-col lg:flex-row items-stretch"
        style={{ minHeight: '90vh', paddingTop: '80px' }}
      >
        {/* Text side */}
        <div
          className="flex flex-col justify-center px-4 sm:px-6 lg:px-16 py-16 lg:py-24"
          style={{ flex: '0 0 55%' }}
        >
          <div className="max-w-lg">
            <span
              style={{
                display: 'inline-block',
                color: '#FF6933',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '14px',
              }}
            >
              Full-Funnel Digital Growth Partner
            </span>

            <h1
              style={{
                fontSize: 'clamp(28px, 4vw, 38px)',
                fontWeight: 800,
                lineHeight: 1.1,
                color: '#111827',
                marginBottom: '20px',
              }}
            >
              Performance Marketing for Brands Ready to Scale
            </h1>

            <p
              style={{
                fontSize: '14.5px',
                fontWeight: 400,
                color: '#1F2937',
                lineHeight: 1.7,
                marginBottom: '32px',
              }}
            >
              I manage $12K+/mo in ad spend across Meta, Google, and TikTok — delivering up to 10x ROAS for 40+ clients, backed by SEO, marketplace growth, and automation that make every channel compound.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/contact"
                className="flex items-center justify-center text-white font-bold rounded-lg transition-all hover:-translate-y-px hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: '#FF6933',
                  fontSize: '14px',
                  padding: '14px 28px',
                  borderRadius: '6px',
                  focusRingColor: '#FF6933',
                }}
              >
                Book a Strategy Call
              </Link>
              <Link
                href="/case-studies"
                className="flex items-center justify-center font-semibold underline-offset-2 hover:underline transition-colors"
                style={{ color: '#111827', fontSize: '14px', minHeight: '44px' }}
              >
                View Case Studies &rarr;
              </Link>
            </div>

            {/* Trust bar */}
            <div
              className="overflow-x-auto"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <p
                className="whitespace-nowrap"
                style={{ color: '#6B7280', fontSize: '13px', opacity: 0.7, fontWeight: 500 }}
              >
                Trusted by teams at{' '}
                {['Adcuratio', 'Growthschool', 'Upreports', 'Brandfluence', 'Agency Partners'].map((c, i) => (
                  <span key={c}>
                    <span className="font-semibold" style={{ color: '#374151' }}>{c}</span>
                    {i < 4 ? '  ·  ' : ''}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>

        {/* Slider side */}
        <div
          className="relative flex items-stretch"
          style={{
            flex: '0 0 45%',
            minHeight: 'clamp(240px, 40vh, 560px)',
            padding: '24px 24px 24px 0',
          }}
        >
          <div className="w-full">
            <HeroSlider slides={heroSlides} />
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
        <div
          className="max-w-[1280px] mx-auto overflow-x-auto"
          style={{ padding: '40px 24px', WebkitOverflowScrolling: 'touch' }}
        >
          <div
            className="grid gap-8"
            style={{ gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))' }}
          >
            {STATS.map(({ number, label }) => (
              <div key={label} className="text-center">
                <div
                  style={{
                    fontSize: '26px',
                    fontWeight: 900,
                    color: '#FF6933',
                    lineHeight: 1.2,
                    marginBottom: '6px',
                  }}
                >
                  {number}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#1F2937' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          SERVICES
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fff', padding: 'clamp(48px, 8vw, 120px) 0' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="mb-12">
            <SectionHeadline>Performance Marketing, Backed by a Full Growth Stack</SectionHeadline>
            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.7, marginTop: '12px', maxWidth: '640px' }}>
              Performance marketing drives the results — SEO &amp; AEO, marketplace growth, development, and automation make sure they compound.
            </p>
          </div>

          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))' }}
          >
            {displayServices.slice(0, 10).map((svc, i) => (
              <ServiceCard key={svc.id || i} service={svc} index={i} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/services"
              style={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}
              className="hover:underline underline-offset-2 transition-colors"
            >
              View All Services &rarr;
            </Link>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          PROCESS
      ══════════════════════════════════════ */}
      <section id="process" style={{ backgroundColor: '#111827', padding: 'clamp(48px, 8vw, 120px) 0' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="mb-12">
            <h2 className="section-headline" style={{ color: '#fff' }}>
              How I Work
            </h2>
          </div>

          <div
            className="grid gap-8"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))' }}
          >
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.title} className="flex flex-col gap-4">
                <MilestoneBadge n={i + 1} light />
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '14px', fontWeight: 400, color: '#D1D5DB', lineHeight: 1.7 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center font-bold rounded-lg transition-all hover:-translate-y-px hover:shadow-lg"
              style={{
                backgroundColor: '#fff',
                color: '#111827',
                fontSize: '14px',
                padding: '14px 28px',
                borderRadius: '6px',
              }}
            >
              Start Your Audit &rarr;
            </Link>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          RESULTS / CASE STUDY TEASER
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fff', padding: 'clamp(48px, 8vw, 120px) 0' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6">
                <SectionHeadline>Real Results, Not Just Reports</SectionHeadline>
              </div>
              <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7, marginBottom: '24px' }}>
                Every engagement is built around one goal: measurable growth. From tracking architecture to creative strategy, everything is tied to outcomes that move the needle.
              </p>
              <Link
                href="/portfolio"
                style={{ color: '#FF6933', fontSize: '14px', fontWeight: 600 }}
                className="hover:underline underline-offset-2"
              >
                View Full Portfolio &rarr;
              </Link>
            </div>

            <div className="order-first md:order-last">
              <div
                className="rounded-xl p-8"
                style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}
              >
                <div
                  style={{
                    fontSize: '38px',
                    fontWeight: 800,
                    color: '#111827',
                    lineHeight: 1.1,
                    borderBottom: '3px solid #FF6933',
                    display: 'inline-block',
                    marginBottom: '12px',
                    paddingBottom: '4px',
                  }}
                >
                  10x Peak ROAS
                </div>
                <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7, marginTop: '12px' }}>
                  For a D2C brand in India — scaled from $2K to $20K/mo in 90 days while improving ROAS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          PRICING TEASER
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: '#F9FAFB', padding: 'clamp(48px, 8vw, 120px) 0' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="mb-12 text-center">
            <SectionHeadline>Engagement Models</SectionHeadline>
          </div>

          <div className="mx-auto" style={{ maxWidth: '640px' }}>
            <div
              className="rounded-xl p-8"
              style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            >
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#111827',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Overall Digital Growth
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
                Custom Retainer — Tailored for brands ready to dominate their market
              </p>

              <ul
                className="space-y-3 mb-8"
                style={{ listStyle: 'none', padding: 0 }}
              >
                {PRICING_BULLETS.map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <span
                      className="shrink-0"
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,105,51,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l2.5 2.5L9 1" stroke="#FF6933" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span style={{ fontSize: '14px', color: '#1F2937' }}>{b}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className="block w-full text-center text-white font-bold rounded-lg transition-all hover:-translate-y-px hover:shadow-lg"
                style={{ backgroundColor: '#FF6933', fontSize: '14px', padding: '14px 28px', borderRadius: '6px' }}
              >
                Book a Discovery Call
              </Link>
            </div>

            {/* Disclaimer */}
            <div
              className="mt-5 rounded-lg px-5 py-4"
              style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FCD34D',
              }}
            >
              <p style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.6 }}>
                All engagements begin with a paid audit. Custom scopes available for enterprise brands.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

/* ── Service card component ────────────────────────────────────── */
function ServiceCard({ service, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex flex-col relative transition-all duration-200"
      style={{
        border: `1px solid ${hovered ? '#FF6933' : '#E5E7EB'}`,
        borderRadius: '8px',
        padding: '32px',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-3 mb-4">
        <MilestoneBadge n={index + 1} />
      </div>

      <h3
        style={{
          fontSize: '16px',
          fontWeight: 800,
          color: '#111827',
          textTransform: 'uppercase',
          lineHeight: 1.3,
          marginBottom: '12px',
          letterSpacing: '0.01em',
        }}
      >
        {service.title}
      </h3>

      <p
        style={{
          fontSize: '13px',
          fontWeight: 400,
          color: '#1F2937',
          lineHeight: 1.7,
          flex: 1,
          marginBottom: '20px',
        }}
      >
        {service.description}
      </p>

      <Link
        href={service.cta_link || '/contact'}
        className="block text-center font-semibold rounded-lg transition-all"
        style={{
          border: `1px solid ${hovered ? 'transparent' : '#FF6933'}`,
          backgroundColor: hovered ? '#FF6933' : 'transparent',
          color: hovered ? '#fff' : '#FF6933',
          fontSize: '13px',
          padding: '10px 16px',
          borderRadius: '6px',
        }}
      >
        Get Quote
      </Link>
    </div>
  )
}
