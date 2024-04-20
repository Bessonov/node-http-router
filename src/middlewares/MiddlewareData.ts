import type {
	MatchResultAny,
} from '../matchers/index.js'
import type {
	Handler,
} from '../Router.js'

export type MiddlewareData<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	T extends (handler: Handler<MatchResultAny, any>) => Handler<MatchResultAny, any>,
> = Parameters<Parameters<T>[0]>[0]['data']
