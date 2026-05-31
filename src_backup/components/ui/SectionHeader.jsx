export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align     = 'left',
  className = '',
}) {
  const centerClass = align === 'center' ? 'text-center' : ''
  const subMaxW     = align === 'center' ? 'mx-auto' : ''

  return (
    <div className={`mb-12 ${centerClass} ${className}`}>
      {eyebrow && <span className="eyebrow mb-3">{eyebrow}</span>}
      <h2 className="heading-display mb-4">{title}</h2>
      {subtitle && (
        <p className={`text-body text-gray-500 max-w-2xl ${subMaxW}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
