import type { TopBarButtonProps } from '../types'

/** An icon button sized and coloured for the bar's navy field. */
export function TopBarButton({
  active = false,
  className = '',
  type = 'button',
  ...rest
}: TopBarButtonProps) {
  return (
    <button
      type={type}
      className={`grid size-11 shrink-0 place-items-center rounded-control transition ${
        active ? 'bg-white/15 text-white' : 'text-brand-100 hover:bg-white/10 hover:text-white'
      } ${className}`}
      {...rest}
    />
  )
}
