/**
 * Declarative form renderer.
 *
 * `fields` is an array where each item is either:
 *   - A field config object  → rendered as a full-width row
 *   - An array of field configs → rendered side-by-side in a CSS grid
 *
 * Field config shape:
 *   name        {string}   - form key (required)
 *   label       {string}   - display label (required)
 *   type        {string}   - 'text'|'number'|'email'|'url'|'textarea'|'select'|'checkbox'
 *                            (default: 'text')
 *   required    {boolean}
 *   placeholder {string}
 *   hint        {string}   - small helper text below the field
 *   rows        {number}   - textarea row count (default: 3)
 *   min / max   {number}   - for type='number'
 *   options     {Array}    - for type='select':
 *                            [{ value, label }] or ['string', …]
 */

function renderField(field, form, onChange) {
  const {
    name, label, type = 'text',
    required, placeholder, hint,
    rows, options, min, max,
  } = field

  const value  = form[name] ?? ''
  const change = val => onChange(name, val)

  // ── Checkbox ──────────────────────────────────────────────────
  if (type === 'checkbox') {
    return (
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={!!form[name]}
          onChange={e => change(e.target.checked)}
          className="w-4 h-4 rounded"
          style={{ accentColor: 'var(--accent)' }}
        />
        <span className="text-sm text-gray-300 font-medium">{label}</span>
      </label>
    )
  }

  // ── Textarea ──────────────────────────────────────────────────
  if (type === 'textarea') {
    return (
      <>
        <label className="admin-label">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <textarea
          rows={rows || 3}
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={e => change(e.target.value)}
          className="admin-input resize-none"
        />
        {hint && <p className="text-xs mt-1" style={{ color: 'var(--admin-muted)' }}>{hint}</p>}
      </>
    )
  }

  // ── Select ────────────────────────────────────────────────────
  if (type === 'select') {
    return (
      <>
        <label className="admin-label">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <select
          required={required}
          value={value}
          onChange={e => change(e.target.value)}
          className="admin-input"
        >
          <option value="">— Select —</option>
          {options?.map(opt => {
            const v = typeof opt === 'object' ? opt.value : opt
            const l = typeof opt === 'object' ? opt.label : opt
            return <option key={v} value={v}>{l}</option>
          })}
        </select>
        {hint && <p className="text-xs mt-1" style={{ color: 'var(--admin-muted)' }}>{hint}</p>}
      </>
    )
  }

  // ── All other input types (text, number, email, url, …) ────────
  return (
    <>
      <label className="admin-label">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        onChange={e => change(e.target.value)}
        className="admin-input"
      />
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--admin-muted)' }}>{hint}</p>}
    </>
  )
}

export default function FieldGroup({ fields, form, onChange }) {
  return (
    <>
      {fields.map((field, i) => {
        // Array of fields → render as equal-column grid
        if (Array.isArray(field)) {
          return (
            <div
              key={i}
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${field.length}, 1fr)` }}
            >
              {field.map(f => (
                <div key={f.name}>{renderField(f, form, onChange)}</div>
              ))}
            </div>
          )
        }
        // Single field
        return <div key={field.name}>{renderField(field, form, onChange)}</div>
      })}
    </>
  )
}
