import type { RunDetail } from '../../engine/wireProtocol'

export type HowItGotHereProps = { trace: NonNullable<RunDetail['trace']> }
