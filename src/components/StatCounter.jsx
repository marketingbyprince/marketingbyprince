import { useEffect, useRef, useState } from 'react'

export default function StatCounter({ value, prefix = '', suffix = '', label }) {
  const [count, setCount] = useState(0)
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
    const duration = 1800
    const steps = 60
    const increment = value / steps
    let current = 0
    let step = 0
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
      <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
        {prefix}{count}{suffix}
      </div>
      <div className="text-gray-400 text-sm font-medium">{label}</div>
    </div>
  )
}
