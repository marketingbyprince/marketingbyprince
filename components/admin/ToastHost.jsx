'use client'
import { useEffect, useState, useRef } from 'react'

export default function ToastHost() {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  useEffect(() => {
    const onToast = (e) => {
      const id = nextId.current++
      const { message, type = 'error' } = e.detail || {}
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 8000)
    }
    window.addEventListener('admin-toast', onToast)
    return () => window.removeEventListener('admin-toast', onToast)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          role="alert"
          className="rounded-xl border px-4 py-3 text-sm font-medium shadow-lg"
          style={{
            backgroundColor: t.type === 'error' ? '#3f1d1d' : '#1d3f2a',
            borderColor: t.type === 'error' ? '#7f1d1d' : '#166534',
            color: t.type === 'error' ? '#fca5a5' : '#86efac',
          }}
        >
          {t.message}
          <button
            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            className="ml-3 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
