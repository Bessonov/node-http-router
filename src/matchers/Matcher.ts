import {
	IncomingMessage, ServerResponse,
} from 'http'
import { MatchResult } from './MatchResult'

export type ExtractMatchResult<M> = M extends Matcher<infer MR> ? MR : never

export interface Matcher<T extends MatchResult = MatchResult> {
	match(req: IncomingMessage, res: ServerResponse): T
}
