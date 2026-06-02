'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export const CURRENCIES = [
  { code: 'USD', label: 'USD ($)',  symbol: '$',  locale: 'en-US' },
  { code: 'EUR', label: 'EUR (€)',  symbol: '€',  locale: 'de-DE' },
  { code: 'GBP', label: 'GBP (£)',  symbol: '£',  locale: 'en-GB' },
  { code: 'INR', label: 'INR (₹)',  symbol: '₹',  locale: 'en-IN' },
  { code: 'CAD', label: 'CAD (C$)', symbol: 'C$', locale: 'en-CA' },
  { code: 'AUD', label: 'AUD (A$)', symbol: 'A$', locale: 'en-AU' },
  { code: 'SGD', label: 'SGD (S$)', symbol: 'S$', locale: 'en-SG' },
  { code: 'AED', label: 'AED',      symbol: 'AED',locale: 'ar-AE' },
]

const FALLBACK_RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5,
  CAD: 1.36, AUD: 1.53, SGD: 1.34, AED: 3.67,
}

const CACHE_KEY = 'fx_rates_v1'
const PREF_KEY  = 'preferred_currency'
const TTL_MS    = 12 * 60 * 60 * 1000

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState('USD')
  const [rates,    setRates]         = useState(FALLBACK_RATES)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREF_KEY)
      if (saved && CURRENCIES.some(c => c.code === saved)) setCurrencyState(saved)
    } catch {}

    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
      if (cached && Date.now() - cached.ts < TTL_MS) {
        setRates({ ...FALLBACK_RATES, ...cached.rates })
        return
      }
    } catch {}

    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => {
        if (d?.rates) {
          const r = { ...FALLBACK_RATES, ...d.rates }
          setRates(r)
          try { localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: r, ts: Date.now() })) } catch {}
        }
      })
      .catch(() => {})
  }, [])

  const setCurrency = useCallback(code => {
    setCurrencyState(code)
    try { localStorage.setItem(PREF_KEY, code) } catch {}
  }, [])

  const format = useCallback((amountUSD) => {
    if (!amountUSD && amountUSD !== 0) return ''
    const converted = amountUSD * (rates[currency] ?? 1)
    const meta = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0]
    try {
      return new Intl.NumberFormat(meta.locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(converted)
    } catch {
      return `${meta.symbol}${Math.round(converted).toLocaleString()}`
    }
  }, [currency, rates])

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider')
  return ctx
}
