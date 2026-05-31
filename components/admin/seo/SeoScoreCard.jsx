'use client'
import { scoreColor, scoreBg, scoreLabel } from '@/lib/seo-scoring'

export default function SeoScoreCard({ label, score, size = 'md' }) {
  const color = scoreColor(score)
  const bg = scoreBg(score)
  const lbl = scoreLabel(score)
  const radius = size === 'lg' ? 40 : 28
  const stroke = size === 'lg' ? 7 : 5
  const dim = radius * 2 + stroke * 2
  const circumference = 2 * Math.PI * radius
  const dash = (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none" stroke="#e5e7eb" strokeWidth={stroke}
        />
        <circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
        />
        <text
          x="50%" y="50%"
          dominantBaseline="middle" textAnchor="middle"
          fontSize={size === 'lg' ? 18 : 13}
          fontWeight="700" fill={color}
        >
          {score}
        </text>
      </svg>
      <span className="text-xs font-medium text-gray-400 text-center">{label}</span>
      <span className="text-xs font-semibold" style={{ color }}>{lbl}</span>
    </div>
  )
}
