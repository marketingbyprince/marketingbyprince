const variants = {
  accent: 'badge-accent',
  gray:   'badge-gray',
  warn:   'badge-warn',
  green:  'badge-green',
  red:    'badge-red',
  purple: 'badge-purple',
}

export default function Badge({
  variant   = 'accent',
  className = '',
  children,
  ...props
}) {
  return (
    <span className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  )
}
