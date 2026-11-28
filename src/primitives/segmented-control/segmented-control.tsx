import type { SegmentedControlProps } from './types'

const tones = {
  default: {
    track: 'border-line bg-tint/5',
    on: 'bg-panel-solid font-bold text-accent-fg shadow-sm',
    off: 'font-semibold text-ink-soft hover:text-ink-strong',
  },
  // The band stays navy in both modes, so these are literal whites and the
  // brand ramp rather than ink tokens that flip with the mode.
  inverse: {
    track: 'border-white/22 bg-white/8',
    on: 'bg-white font-extrabold text-brand-900',
    off: 'font-bold text-brand-100 hover:bg-white/12 hover:text-white',
  },
}

export function SegmentedControl({
  label,
  value,
  options,
  onValueChange,
  tone = 'default',
  className = '',
}: SegmentedControlProps) {
  const look = tones[tone]
  return (
    <div
      role="group"
      aria-label={label}
      data-tone={tone}
      className={`flex shrink-0 rounded-control border p-[3px] ${look.track} ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={option.disabled}
          onClick={() => onValueChange(option.value)}
          aria-pressed={value === option.value}
          className={`h-[30px] rounded-control px-4 text-[13px] whitespace-nowrap transition disabled:opacity-40 ${value === option.value ? look.on : look.off}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
