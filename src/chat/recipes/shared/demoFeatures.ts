export * from '../../../recipes/settings/settings-state'
import { useFeatureFlags } from '../../../lib/settings'
import { DEMO_CATALOGUE } from '../../../recipes/settings/settings-state'
export function useDemoComposerFeatures() {
  const { flags } = useFeatureFlags({
    catalogue: DEMO_CATALOGUE,
    storageKey: 'widget-demo-features',
  })
  return { suggestions: flags.suggestions, queue: flags.queue }
}
