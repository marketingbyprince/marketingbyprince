export default function MilestoneList({ items = [], className = '' }) {
  if (!items.length) return null

  return (
    <ol className={`space-y-4 ${className}`}>
      {items.map((item, i) => {
        const title = typeof item === 'string' ? null : item.title
        const body  = typeof item === 'string' ? item  : item.description ?? item.body ?? ''

        return (
          <li key={i} className="flex gap-4">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className="heading-section mb-1">{title}</h4>
              )}
              <p className="text-body text-gray-500">{body}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
