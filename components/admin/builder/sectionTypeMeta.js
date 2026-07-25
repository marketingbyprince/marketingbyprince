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
}

export const SECTION_TYPES = Object.keys(SECTION_TYPE_META)
