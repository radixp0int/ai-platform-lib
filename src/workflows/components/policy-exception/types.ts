import type { RunDetail } from '../../engine/wireProtocol'

export type PolicyExceptionProps = { exc: NonNullable<RunDetail['exception']> }
