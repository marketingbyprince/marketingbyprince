const variants = {
  default:     'card',
  elevated:    'card-elevated',
  interactive: 'card-interactive',
  featured:    'card-featured',
  warn:        'card-warn',
  dark:        'admin-card',
}

export default function Card({
  variant   = 'default',
  className = '',
  children,
  ...props
}) {
  return (
    <div className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}
