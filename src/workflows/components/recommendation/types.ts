import type { RunDetail } from '../../engine/wireProtocol'

export type RecommendationProps = { rec: NonNullable<RunDetail['recommendation']> }
