const sizes = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  xl: 'btn-xl',
}

const variants = {
  primary:   'btn bg-accent text-white hover:bg-accent-dark hover:shadow-accent hover:-translate-y-px active:translate-y-0',
  secondary: 'btn bg-white text-deep border border-gray-200 hover:border-accent/40 hover:shadow-card-hover hover:-translate-y-px active:translate-y-0',
  ghost:     'btn text-gray-500 hover:text-deep hover:bg-gray-100',
  outline:   'btn border-2 border-accent text-accent hover:bg-accent hover:text-white hover:shadow-accent',
  danger:    'btn bg-red-500 text-white hover:bg-red-600',
  admin:     'btn bg-accent text-white hover:bg-accent-dark hover:shadow-accent',
}

export default function Button({
  variant = 'primary',
  size    = 'md',
  type    = 'button',
  disabled,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
