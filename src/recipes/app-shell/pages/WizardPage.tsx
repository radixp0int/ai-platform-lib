import { useState } from 'react'
import { PageHeader } from '../../../components/page-header'
import { Button } from '../../../primitives/button'
import { ChoiceCard } from '../../../primitives/choice-card'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  IngestionIcon,
  PlugIcon,
} from '../../../primitives/icons'
import { Stepper } from '../../../primitives/stepper'
import { TextInput } from '../../../primitives/text-input'
import { usePlatform } from '../platform-context'

const STEPS = ['Source', 'Connect', 'Schedule', 'Review'] as const

type SourceKind = 'api' | 'documents'

/**
 * "Add a source", as a focused flow: the shell hides the side menu and the
 * pinned tabs for it and shows the tenant as a fixed label, so the only ways
 * out are finishing and the close button.
 *
 * Only the first step is designed. The other three are named so the frame —
 * steps down the left, one decision in the middle, Back and Next pinned to the
 * bottom — can be judged with a real length of flow.
 */
export function WizardPage() {
  const { tenant, base, go } = usePlatform()
  const [step, setStep] = useState(0)
  const [kind, setKind] = useState<SourceKind>('api')
  const [name, setName] = useState('')
  const last = step === STEPS.length - 1

  return (
    <div className="flex h-full flex-col bg-panel-solid">
      <div className="flex min-h-0 flex-1 gap-24 overflow-y-auto px-24 pt-8 pb-10 max-lg:flex-col max-lg:gap-8 max-lg:px-6">
        <Stepper steps={STEPS} current={step} />

        <div className="flex w-full max-w-[35rem] flex-col">
          <PageHeader title={STEPS[step]} />

          {step === 0 ? (
            <>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                Choose what to add. Sources stay inside {tenant.name}; other tenants never see them.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <ChoiceCard
                  type="radio"
                  name="source-kind"
                  checked={kind === 'api'}
                  onChange={() => setKind('api')}
                  icon={<PlugIcon />}
                  label="Connect an API"
                  description="Pull records from another system on a schedule."
                />
                <ChoiceCard
                  type="radio"
                  name="source-kind"
                  checked={kind === 'documents'}
                  onChange={() => setKind('documents')}
                  icon={<IngestionIcon />}
                  label="Upload documents"
                  description="Add files from your computer."
                />
              </div>
              <label className="mt-6 flex flex-col gap-1.5 text-[13px] font-semibold text-ink">
                Source name
                <TextInput
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Name this source"
                />
              </label>
            </>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-line px-5 py-6 text-[15px] leading-relaxed text-ink">
              This step has not been designed yet. It is here so the flow has its real length.
            </p>
          )}
        </div>
      </div>

      <footer className="flex h-20 shrink-0 items-center gap-2 border-t border-line pl-[calc(6rem+12rem+6rem)] max-lg:px-6">
        <Button
          type="button"
          onClick={() => (step === 0 ? go(`${base}/ingestion`) : setStep(step - 1))}
          size="lg"
        >
          <ChevronLeftIcon width={16} height={16} />
          Go back
        </Button>
        <Button
          type="button"
          onClick={() => (last ? go(`${base}/ingestion`) : setStep(step + 1))}
          variant="primary"
          size="lg"
        >
          {last ? 'Finish' : 'Next'}
          {!last && <ChevronRightIcon width={16} height={16} strokeWidth={2} />}
        </Button>
      </footer>
    </div>
  )
}
