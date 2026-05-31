import { Link } from 'react-router-dom'

/**
 * Reusable service card for the public services list and related-services grid.
 *
 * The `service` object should have:
 *   title, description, icon, pillar — always present
 *   slug — optional; when present, the title becomes a link to /services/:slug
 *          and a "Details →" link appears in the footer
 */
export default function ServiceCard({ service }) {
  const { title, description, icon, slug } = service

  return (
    <article className="card-interactive flex flex-col group">
      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="p-6 flex flex-col flex-1">

        {/* Icon badge */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 shrink-0 transition-colors group-hover:bg-accent-muted"
          style={{ backgroundColor: 'rgba(255, 105, 51, 0.08)' }}
        >
          {icon || '📌'}
        </div>

        {/* Title — clickable if slug exists */}
        <div className="flex-1">
          {slug ? (
            <Link
              to={`/services/${slug}`}
              className="heading-section text-deep hover:text-accent transition-colors block mb-2"
            >
              {title}
            </Link>
          ) : (
            <h3 className="heading-section mb-2 text-deep">{title}</h3>
          )}

          {description && (
            <p className="text-body text-gray-500 leading-relaxed">{description}</p>
          )}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between">
        <Link
          to={`/contact?subject=${encodeURIComponent(title)}`}
          className="btn-primary btn-sm"
        >
          Get Quote
        </Link>

        {slug && (
          <Link
            to={`/services/${slug}`}
            className="text-body-sm font-bold transition-all flex items-center gap-1 group-hover:gap-1.5"
            style={{ color: 'var(--color-muted)' }}
          >
            Details <span aria-hidden>&rarr;</span>
          </Link>
        )}
      </div>
    </article>
  )
}
