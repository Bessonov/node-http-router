import {
	MatchResult,
	Matched,
} from '../matchers/MatchResult'
import {
	Handler,
} from '../router'

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

interface CorsMiddlewareOptions {
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

export function CorsMiddleware({
	origins: originConfig,
	allowMethods = DEFAULT_ALLOWED_METHODS,
	allowHeaders = DEFAULT_ALLOWED_HEADERS,
	allowCredentials = true,
	maxAge = DEFAULT_MAX_AGE_SECONDS,
}: CorsMiddlewareOptions) {
	return function corsWrapper<T extends MatchResult, D extends Matched<T>>(
		handler: Handler<T, D>,
	): Handler<T, D> {
		return async function corsHandler(req, res, ...args) {
			// avoid "Cannot set headers after they are sent to the client"
			if (res.writableEnded) {
				// TODO: not sure if handler should be called
				return handler(req, res, ...args)
			}

			const origin = req.headers.origin ?? ''
			if (originConfig.includes(origin) || originConfig.includes('*')) {
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

			const result = await handler(req, res, ...args)
			return result
		}
	}
}
