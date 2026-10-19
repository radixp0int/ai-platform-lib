import type { PageHeaderProps } from './types'
export const pageTitle = 'text-[28px] leading-tight font-normal tracking-tight text-ink-strong'
export const sectionTitle = 'text-lg font-normal text-ink-strong'
export const pageColumn = 'mx-auto flex w-full flex-col px-10 pt-6 pb-10 max-md:px-4'
export function PageHeader({
  title,
  description,
  titleClassName = pageTitle,
  descriptionClassName = 'text-sm text-ink-soft',
  className = 'flex flex-col gap-1',
  children,
  ...rest
}: PageHeaderProps) {
  return (
    <header className={className} {...rest}>
      <h1 className={titleClassName}>{title}</h1>
      {description && <p className={descriptionClassName}>{description}</p>}
      {children}
    </header>
  )
}
