import { useEffect, useRef, useState } from 'react'

export default function StatCounter({ value, prefix = '', suffix = '', label }) {
  const [count,     setCount]     = useState(0)
  const [triggered, setTriggered] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!triggered) return
    const duration  = 1800
    const steps     = 60
    const increment = value / steps
    let current = 0
    let step    = 0
    const timer = setInterval(() => {
      step++
      current = Math.min(increment * step, value)
      setCount(Math.round(current))
      if (step >= steps) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [triggered, value])

  return (
    <div ref={ref} className="text-center">
      <div className="font-black text-deep mb-1" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
        <span style={{ color: 'var(--accent)' }}>{prefix}</span>
        {count}
        <span style={{ color: 'var(--accent)' }}>{suffix}</span>
      </div>
      <div className="text-body-sm text-gray-500 font-semibold">{label}</div>
    </div>
  )
}
