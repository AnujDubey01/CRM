import Icon from './Icon'

function Button({
  ariaLabel,
  children,
  className = '',
  icon,
  iconPosition = 'end',
  onClick,
  disabled = false,
  size = 'medium',
  title,
  type = 'button',
  variant = 'primary',
}) {
  const classes = ['button', `button--${variant}`, `button--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      aria-label={ariaLabel}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      title={title}
      type={type}
    >
      {icon && iconPosition === 'start' ? <Icon name={icon} /> : null}
      {children ? <span>{children}</span> : null}
      {icon && iconPosition === 'end' ? <Icon name={icon} /> : null}
    </button>
  )
}

export default Button
