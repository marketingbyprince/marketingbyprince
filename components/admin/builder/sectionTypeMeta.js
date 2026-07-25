// Admin-facing metadata for each buildable section type: label, icon, and the
// FieldGroup-compatible field list used to edit its `content` jsonb blob.
// Keep in sync with the renderer registry in components/sections/index.js.

export const SECTION_TYPE_META = {
  hero: {
    label: 'Hero',
    icon: '🦸',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow' },
      { name: 'title', label: 'Title', required: true },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
      [
        { name: 'ctaLabel', label: 'CTA Label' },
        { name: 'ctaHref', label: 'CTA Link', placeholder: '/contact' },
      ],
      [
        { name: 'secondaryLabel', label: 'Secondary CTA Label' },
        { name: 'secondaryHref', label: 'Secondary CTA Link' },
      ],
      { name: 'backgroundImage', label: 'Background Image URL', type: 'url' },
    ],
  },
  rich_text: {
    label: 'Rich Text',
    icon: '📝',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow' },
      { name: 'title', label: 'Title' },
      {
        name: 'align', label: 'Alignment', type: 'select',
        options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }],
      },
    ],
    // `html` is edited separately via the rich text editor, not FieldGroup.
    hasHtmlField: true,
  },
  cta: {
    label: 'Call To Action',
    icon: '📣',
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
      [
        { name: 'ctaLabel', label: 'Button Label', placeholder: 'Book Strategy Call' },
        { name: 'ctaHref', label: 'Button Link', placeholder: '/contact' },
      ],
    ],
  },
  faq_accordion: {
    label: 'FAQ Accordion',
    icon: '❓',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow' },
      { name: 'title', label: 'Title' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
    ],
    // Individual Q&A items live in the `faqs` table, managed via FaqItemsManager.
    hasFaqItems: true,
  },

  // ── Homepage redesign section library ──────────────────────────────────
  // Array-valued fields (cards/steps/stats/...) are edited as raw JSON —
  // same pattern already used for case studies' key_metrics — rather than a
  // dedicated repeater UI. jsonFields tells SectionsManager which keys to
  // JSON.stringify/parse around the textarea.
  hero_v2: {
    label: 'Hero (Homepage)',
    icon: '🦸',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow' },
      { name: 'title', label: 'Title', required: true },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
      { name: 'trustStripLabel', label: 'Trust Strip Label', placeholder: 'Trusted by teams at' },
      { name: 'trustStripItems', label: 'Trust Strip Items (JSON array of strings)', type: 'textarea', rows: 2, placeholder: '["Client A", "Client B"]' },
      { name: 'primaryCta', label: 'Primary CTA (JSON: {"label":"","href":""})', type: 'textarea', rows: 2 },
      { name: 'secondaryCta', label: 'Secondary CTA (JSON: {"label":"","href":""})', type: 'textarea', rows: 2 },
      { name: 'dashboardStats', label: 'Dashboard Stats (JSON array of {label,value})', type: 'textarea', rows: 3 },
    ],
    jsonFields: ['trustStripItems', 'primaryCta', 'secondaryCta', 'dashboardStats'],
  },
  stats_trust: {
    label: 'Brand Trust',
    icon: '🤝',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow' },
      { name: 'title', label: 'Title' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
      { name: 'stats', label: 'Stats (JSON array of {label,value})', type: 'textarea', rows: 4 },
    ],
    jsonFields: ['stats'],
    note: 'Client/platform/certification logos are managed in Trust Logos, not here.',
  },
  services_grid: {
    label: 'Services Grid',
    icon: '🧩',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow' },
      { name: 'title', label: 'Title' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
      { name: 'cards', label: 'Cards (JSON array of {pillar,title,description,icon,href})', type: 'textarea', rows: 6 },
    ],
    jsonFields: ['cards'],
  },
  feature_cards: {
    label: 'Feature Cards',
    icon: '⭐',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow' },
      { name: 'title', label: 'Title' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
      { name: 'cards', label: 'Cards (JSON array of {icon,title,description})', type: 'textarea', rows: 6 },
    ],
    jsonFields: ['cards'],
  },
  process_timeline: {
    label: 'Process Timeline',
    icon: '🗺️',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow' },
      { name: 'title', label: 'Title' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
      { name: 'steps', label: 'Steps (JSON array of {number,title,description})', type: 'textarea', rows: 6 },
    ],
    jsonFields: ['steps'],
  },
  case_study_slider: {
    label: 'Case Study Slider',
    icon: '📁',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow' },
      { name: 'title', label: 'Title' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
      { name: 'ctaLabel', label: 'CTA Label' },
      { name: 'ctaHref', label: 'CTA Link' },
    ],
    note: 'Cards are pulled live from featured Case Studies — manage content there, not here.',
  },
  industries_grid: {
    label: 'Industries Grid',
    icon: '🏢',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow' },
      { name: 'title', label: 'Title' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
      { name: 'industries', label: 'Industries (JSON array of {name,icon})', type: 'textarea', rows: 5 },
    ],
    jsonFields: ['industries'],
  },
  ecosystem_diagram: {
    label: 'Marketing Ecosystem',
    icon: '🌐',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow' },
      { name: 'title', label: 'Title' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
      { name: 'centerLabel', label: 'Center Label', placeholder: 'Performance Marketing' },
      { name: 'nodes', label: 'Nodes (JSON array of {label,icon})', type: 'textarea', rows: 5 },
    ],
    jsonFields: ['nodes'],
  },
  testimonials_slider: {
    label: 'Testimonials',
    icon: '💬',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow' },
      { name: 'title', label: 'Title' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
    ],
    note: 'Quotes are pulled live from the Testimonials table — manage content there, not here.',
  },
  insights_slider: {
    label: 'Insights Slider',
    icon: '✍️',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow' },
      { name: 'title', label: 'Title' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
      { name: 'ctaLabel', label: 'CTA Label' },
      { name: 'ctaHref', label: 'CTA Link' },
    ],
    note: 'Cards are pulled live from the latest published Blog articles — manage content there, not here.',
  },
}

export const SECTION_TYPES = Object.keys(SECTION_TYPE_META)
