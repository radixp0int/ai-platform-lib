import { AccountMenu } from '../../components/account-menu'
import { DEMO_USER } from '../../fixtures/platform/user'
import { SlidersIcon, UserIcon } from '../../primitives/icons'
import { ThemeToggle } from '../../primitives/theme-toggle'
export function AccountButton({
  onOpenUserSettings,
  onOpenFeatureToggles,
}: {
  onOpenUserSettings: () => void
  onOpenFeatureToggles: () => void
}) {
  return (
    <AccountMenu
      trigger="avatar"
      user={{ ...DEMO_USER, detail: DEMO_USER.email }}
      items={[
        {
          id: 'user',
          label: 'User settings',
          hint: 'Profile and appearance',
          icon: <UserIcon width={16} height={16} />,
          onSelect: onOpenUserSettings,
        },
        {
          id: 'features',
          label: 'Feature toggles',
          hint: 'What a chat response shows',
          icon: <SlidersIcon width={16} height={16} />,
          onSelect: onOpenFeatureToggles,
        },
      ]}
      footer={
        <>
          <span className="flex-1 text-[13px] font-semibold text-ink-strong">Light or dark</span>
          <ThemeToggle />
        </>
      }
    />
  )
}
