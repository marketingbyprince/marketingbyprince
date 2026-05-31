const widths = {
  wide:   'section-wrap',
  narrow: 'section-narrow',
  tight:  'section-tight',
}

export default function Container({
  width     = 'wide',
  as        = 'div',
  className = '',
  children,
  ...props
}) {
  const Tag = as
  return (
    <Tag className={`${widths[width]} ${className}`} {...props}>
      {children}
    </Tag>
  )
}
