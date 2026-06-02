'use client'

import { CURRENCIES } from '@/context/CurrencyContext'

export default function CurrencySelector({ currency, onChange, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="text-xs font-semibold text-gray-400 hidden sm:inline">Currency:</span>
      <select
        value={currency}
        onChange={e => onChange(e.target.value)}
        className="text-xs font-bold border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-accent cursor-pointer"
        style={{ color: 'var(--color-text-2)' }}
        aria-label="Select currency"
      >
        {CURRENCIES.map(c => (
          <option key={c.code} value={c.code}>{c.label}</option>
        ))}
      </select>
    </div>
  )
}
