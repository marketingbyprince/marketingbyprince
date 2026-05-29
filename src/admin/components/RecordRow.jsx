/**
 * Single row in an admin list.
 *
 * Props
 *   icon      - emoji or string shown as a leading icon (optional)
 *   title     - primary text (required)
 *   subtitle  - secondary / muted text below title (optional)
 *   meta      - extra JSX rendered between subtitle and action buttons
 *               (e.g. price tag, tier badge) — hidden on mobile
 *   isActive  - if defined, renders an Active / Inactive toggle pill
 *   onToggle  - called when the toggle pill is clicked
 *   onEdit    - called when Edit is clicked
 *   onDelete  - called when Del is clicked
 */
export default function RecordRow({
  icon,
  title,
  subtitle,
  meta,
  isActive,
  onToggle,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex items-center gap-3 admin-card rounded-xl px-5 py-3.5">
      {icon && (
        <span className="text-xl w-8 text-center shrink-0 leading-none">{icon}</span>
      )}

      {/* Title + subtitle */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate leading-snug">{title}</p>
        {subtitle && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--admin-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Optional meta slot (hidden below sm) */}
      {meta && (
        <div className="hidden sm:flex items-center gap-2 shrink-0">{meta}</div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-1 shrink-0">
        {onToggle !== undefined && (
          <button
            onClick={onToggle}
            className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
              isActive
                ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                : 'bg-white/5 text-gray-500 hover:bg-white/10'
            }`}
          >
            {isActive ? 'Active' : 'Off'}
          </button>
        )}
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all font-semibold"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-gray-500 hover:text-red-400 text-xs px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-all font-semibold"
        >
          Del
        </button>
      </div>
    </div>
  )
}
