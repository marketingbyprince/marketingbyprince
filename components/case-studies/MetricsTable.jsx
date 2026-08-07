// data: { columns: string[], rows: string[][], highlightLastCol?: boolean }
// Renders a real before/after or period-comparison table supplied by the
// case study data — never fabricated, only shown when the source data exists.
export default function MetricsTable({ data }) {
  if (!data?.columns?.length || !data?.rows?.length) return null
  const { columns, rows, highlightLastCol } = data

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--deep, #111827)' }}>
            {columns.map((col, i) => (
              <th key={col + i} className="text-left text-white font-bold px-4 py-3 text-xs uppercase tracking-wide whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ backgroundColor: ri % 2 ? '#F9FAFB' : '#fff' }}>
              {row.map((cell, ci) => {
                const isLast = highlightLastCol && ci === row.length - 1
                return (
                  <td
                    key={ci}
                    className="px-4 py-3 whitespace-nowrap border-t border-gray-100"
                    style={{
                      fontWeight: ci === 0 || isLast ? 700 : 500,
                      color: isLast ? 'var(--accent)' : ci === 0 ? '#111827' : '#4B5563',
                    }}
                  >
                    {cell}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
