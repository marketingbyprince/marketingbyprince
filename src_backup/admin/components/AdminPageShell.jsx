/**
 * Standard admin page wrapper.
 * Renders a header row (title + optional record count + action CTA)
 * and the page body below.
 */
export default function AdminPageShell({ title, count, action, children }) {
  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{title}</h1>
          {count !== undefined && (
            <p className="text-gray-500 text-sm mt-0.5">
              {count} {count === 1 ? 'record' : 'records'}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  )
}
