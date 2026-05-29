/**
 * Reusable CRUD modal dialog.
 *
 * Props
 *   open        - boolean controlling visibility
 *   onClose     - called when backdrop or ✕ is clicked
 *   title       - string shown in the modal header
 *   onSubmit    - form submit handler (receives the native submit event)
 *   saving      - boolean disables the submit button and shows spinner text
 *   submitLabel - CTA button label (default: 'Save')
 *   error       - optional error string shown above the fields
 *   size        - 'md' (default, max-w-md) | 'lg' (max-w-lg)
 *   children    - form body (FieldGroup + any custom fields)
 */
export default function CrudModal({
  open,
  onClose,
  title,
  onSubmit,
  saving,
  submitLabel = 'Save',
  error,
  size = 'md',
  children,
}) {
  if (!open) return null

  const maxW = size === 'lg' ? 'max-w-lg' : 'max-w-md'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
      onClick={onClose}
    >
      <form
        onSubmit={onSubmit}
        className={`admin-card rounded-2xl w-full ${maxW} flex flex-col`}
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 pt-5 pb-4 border-b shrink-0"
          style={{ borderColor: 'var(--admin-border)' }}
        >
          <h3 className="text-white font-extrabold tracking-tight text-base">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors text-sm leading-none"
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {children}
        </div>

        {/* ── Footer ── */}
        <div
          className="px-6 pt-4 pb-5 border-t flex gap-3 shrink-0"
          style={{ borderColor: 'var(--admin-border)' }}
        >
          <button
            type="submit"
            disabled={saving}
            className="flex-1 btn-admin btn-md disabled:opacity-60"
          >
            {saving ? 'Saving…' : submitLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn btn-md border text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
            style={{ borderColor: 'var(--admin-border)' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
