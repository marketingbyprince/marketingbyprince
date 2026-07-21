'use client'

import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'

const PHASES = [
  {
    title: 'Foundations',
    topics: [
      'Marketing & Business Fundamentals',
      'Consumer Psychology & Buyer Behavior',
      'Funnel & Customer Journey Mapping',
      'Offer, Positioning & Value Proposition',
      'Metrics & Unit Economics (CAC, LTV, ROAS, MER, AOV, payback, contribution margin)',
      'Media Math & Budgeting Fundamentals',
    ],
  },
  {
    title: 'Measurement & Data Infrastructure',
    topics: [
      'Tracking Fundamentals (pixels, events, params)',
      'Google Tag Manager & Server-Side Tagging',
      'GA4 & Analytics Platforms',
      'Conversion APIs / Server-Side Tracking (CAPI)',
      'Attribution Models & Windows',
      'Privacy, Consent & Compliance (GDPR, ATT, Consent Mode v2)',
      'First-Party Data & CDPs',
    ],
  },
  {
    title: 'Audience & Targeting',
    topics: [
      'Audience Research & Segmentation',
      'Targeting Strategy (interest, behavioral, contextual, lookalike, custom)',
      'Customer Data & List Building',
      'Retargeting & Lifecycle Intersection',
    ],
  },
  {
    title: 'Platform Mastery',
    topics: [
      'Google Search Ads',
      'Performance Max & Shopping (Merchant Center, feeds)',
      'Google Demand Gen & Display',
      'YouTube Ads',
      'Meta Ads (FB / IG)',
      'TikTok Ads',
      'LinkedIn Ads',
      'Pinterest Ads',
      'X (Twitter) Ads',
      'Reddit Ads',
      'Snapchat / Quora / Other Social',
      'CTV & Streaming (JioHotstar, Hulu, etc.)',
      'Programmatic & DSPs (DV360, Trade Desk)',
      'Retail Media (Amazon, Flipkart, etc.)',
      'App Marketing (UAC, ASA, MMPs)',
      'AI-Native & Emerging Platforms (ChatGPT, Perplexity, etc.)',
    ],
  },
  {
    title: 'Creative',
    topics: [
      'Creative Strategy & Frameworks (hooks, angles)',
      'Ad Copywriting & Messaging',
      'Creative Production & UGC Pipeline',
      'Creative Testing Systems',
    ],
  },
  {
    title: 'Optimization & Post-Click',
    topics: [
      'Landing Pages & CRO',
      'Bidding, Budgets & Automation (Smart Bidding logic)',
      'Testing & Experimentation Methodology',
      'Scaling Frameworks',
    ],
  },
  {
    title: 'Lifecycle, Owned Channels & Automation',
    topics: [
      'Email Marketing (deliverability, ESPs, campaigns vs flows)',
      'SMS & WhatsApp Marketing (compliance, RCS, conversational commerce)',
      'Push Notifications & In-App Messaging',
      'Marketing Automation & Journey Design (triggers, drip logic, behavioral flows)',
      'CRM, Retention & LTV Expansion (cohorts, churn, winback, loyalty)',
      'Referral & Affiliate Marketing',
      'Paid ↔ Owned Integration (suppression, audience sync, retention-fed lookalikes)',
    ],
  },
  {
    title: 'Advanced Measurement & Strategy',
    topics: [
      'Incrementality Testing',
      'Marketing Mix Modeling (MMM)',
      'Full-Funnel & Media Planning',
      'Data Analysis & SQL',
      'Dashboarding & BI (Looker Studio, etc.)',
    ],
  },
  {
    title: 'Meta-Skills / Professional',
    topics: [
      'AI & Automation for Marketers (scripts, APIs, n8n/Zapier, bulk ops)',
      'Client, Stakeholder & Reporting',
      'Account Ops & Hygiene (naming, structure, QA)',
      'Competitive Intelligence',
      'Staying Current & Testing Culture',
    ],
  },
]

function slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function ExpertiseClient() {
  let topicCounter = 0

  return (
    <div className="min-h-screen pt-24 pb-20 bg-soft">
      <div className="section-narrow">

        <SectionHeader
          eyebrow="Expertise"
          title="What I've Mastered"
          subtitle="A full breakdown of the marketing discipline I've built — from fundamentals and measurement to platform execution, creative, lifecycle marketing, and advanced analytics."
        />

        {/* ── Phase jump nav ─────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-12">
          {PHASES.map((phase, i) => (
            <a key={phase.title} href={`#${slug(phase.title)}`} className="filter-pill-off">
              <span className="mr-1.5">{i + 1}</span>{phase.title}
            </a>
          ))}
        </div>

        {/* ── Phases ──────────────────────────────────────────────────── */}
        <div className="space-y-8">
          {PHASES.map((phase, i) => (
            <div key={phase.title} id={slug(phase.title)} className="card p-6 scroll-mt-24">
              <span className="eyebrow mb-2">Phase {i + 1}</span>
              <h2 className="heading-section text-deep mb-5">{phase.title}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {phase.topics.map((topic) => {
                  topicCounter += 1
                  return (
                    <div key={topic} className="flex items-start gap-3">
                      <span
                        className="shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}
                      >
                        {topicCounter}
                      </span>
                      <span className="text-body-sm text-gray-600 leading-snug">{topic}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <div
          className="mt-20 rounded-2xl p-10 text-center"
          style={{
            backgroundColor: 'var(--accent-muted)',
            border: '1px solid var(--accent-border)',
          }}
        >
          <h3 className="heading-section mb-2">Want to put this to work for your brand?</h3>
          <p className="text-body text-gray-500 mb-6 max-w-md mx-auto">
            Let&rsquo;s talk about how this range of expertise can move your numbers.
          </p>
          <Link href="/contact" className="btn-primary btn-lg">Talk to Me</Link>
        </div>

      </div>
    </div>
  )
}
