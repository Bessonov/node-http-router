import {
	MatchResultAny,
} from '../matchers/MatchResult'
import {
	Handler,
} from '../Router'

export interface CorsMiddlewareInput {
	headers: {
		origin?: string
	}
	method: string
}

type HttpMethod =
	| 'POST'
	| 'GET'
	| 'PUT'
	| 'PATCH'
	| 'DELETE'
	| 'OPTIONS'

const DEFAULT_ALLOWED_METHODS: HttpMethod[] = [
	'POST',
	'GET',
	'PUT',
	'PATCH',
	'DELETE',
	'OPTIONS',
]

const DEFAULT_ALLOWED_HEADERS = [
	'X-Requested-With',
	'Access-Control-Allow-Origin',
	'Content-Type',
	'Authorization',
	'Accept',
]

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 // 24 hours

export interface CorsMiddlewareCallbackResult {
	// exact origins like 'http://0.0.0.0:8080' or '*'
	origins: string[]
	// methods like 'POST', 'GET' etc.
	allowMethods?: HttpMethod[]
	// headers like 'Authorization' or 'X-Requested-With'
	allowHeaders?: string[]
	// allows cookies in CORS scenario
	allowCredentials?: boolean
	// max age in seconds
	maxAge?: number
}

export function CorsMiddleware<
	D2,
	R extends CorsMiddlewareInput = CorsMiddlewareInput
>(callback: (
	req: R,
	origin: string,
	params: { data: D2 }
) => Promise<CorsMiddlewareCallbackResult>) {
	return function corsWrapper<T extends MatchResultAny, D extends D2 & {
		req: R
		res: {
			writableEnded: boolean
			setHeader:(name: string, value: string) => void
			statusCode: number
			end: () => void
		}
	}>(
		handler: Handler<T, D>): Handler<T, D> {
		return async function corsHandler(params) {
			const { req, res } = params.data
			// avoid "Cannot set headers after they are sent to the client"
			if (res.writableEnded) {
				// TODO: not sure if handler should be called
				return handler(params)
			}

			const origin = req.headers.origin ?? ''

			const config = await callback(req, origin, params)
			const allowCredentials = config.allowCredentials ?? true
			const allowMethods = config.allowMethods ?? DEFAULT_ALLOWED_METHODS
			const allowHeaders = config.allowHeaders ?? DEFAULT_ALLOWED_HEADERS
			const maxAge = config.maxAge ?? DEFAULT_MAX_AGE_SECONDS

			if (config.origins.includes(origin)) {
				res.setHeader('Access-Control-Allow-Origin', origin)
				res.setHeader('Vary', 'Origin')
				if (allowCredentials) {
					res.setHeader('Access-Control-Allow-Credentials', 'true')
				}
			}

			if (req.method === 'OPTIONS') {
				if (allowMethods.length) {
					res.setHeader('Access-Control-Allow-Methods', allowMethods.join(','))
				}
				if (allowHeaders.length) {
					res.setHeader('Access-Control-Allow-Headers', allowHeaders.join(','))
				}
				if (maxAge) {
					res.setHeader('Access-Control-Max-Age', String(maxAge))
				}
				// no further processing of preflight requests
				res.statusCode = 200
				res.end()
				// eslint-disable-next-line consistent-return
				return
			}

			const result = await handler(params)
			return result
		}
	}
}
