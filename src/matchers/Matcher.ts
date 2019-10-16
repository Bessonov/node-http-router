import {
	IncomingMessage, ServerResponse,
} from 'http'
import { MatchResult } from './MatchResult'

export interface Matcher<T extends MatchResult = MatchResult> {
	match(req: IncomingMessage, res: ServerResponse): T
}
