import type {
	MatchResultAny,
} from '../matchers/index.js'
import type {
	Handler,
} from '../Router.js'

export interface CorsMiddlewareInput {
	headers: {
		origin?: string
		'access-control-request-method'?: string | string[]
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
	// allows credentials for explicitly listed origins (defaults to true)
	allowCredentials?: boolean
	// max age in seconds, or 0 to disable preflight caching
	maxAge?: number
}

interface CorsMiddlewareResponse {
	writableEnded: boolean
	headersSent?: boolean
	getHeader?: (name: string) => string | number | readonly string[] | undefined
	setHeader: (name: string, value: string) => void
	statusCode: number
	end: () => void
}

function hasStartedResponse(res: CorsMiddlewareResponse): boolean {
	return res.writableEnded || res.headersSent === true
}

export function CorsMiddleware<
	D2,
	R extends CorsMiddlewareInput = CorsMiddlewareInput,
>(
	callback: (
		req: R,
		origin: string,
		params: { data: D2 },
	) => Promise<CorsMiddlewareCallbackResult>,
) {
	return function corsWrapper<
		T extends MatchResultAny,
		D extends D2 & {
			req: R
			res: CorsMiddlewareResponse
		},
	>(
		handler: Handler<T, D>,
	): Handler<T, D> {
		return async function corsHandler(params) {
			const { req, res } = params.data
			if (hasStartedResponse(res)) {
				return undefined
			}

			const origin = req.headers.origin ?? ''
			const config = await callback(req, origin, params)
			if (hasStartedResponse(res)) {
				return undefined
			}

			const vary = res.getHeader?.('Vary')?.toString()
			const variesByOrigin = vary?.split(',').some(value => {
				const field = value.trim().toLowerCase()
				return field === '*' || field === 'origin'
			})
			if (!variesByOrigin) {
				res.setHeader('Vary', vary ? `${vary}, Origin` : 'Origin')
			}
			if (!origin) {
				return handler(params)
			}

			const allowedOrigin = config.origins.includes(origin) ? origin : config.origins.find(value => value === '*')
			if (allowedOrigin !== undefined) {
				res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
				if (allowedOrigin !== '*' && (config.allowCredentials ?? true)) {
					res.setHeader('Access-Control-Allow-Credentials', 'true')
				}
			}

			if (req.method !== 'OPTIONS' || req.headers['access-control-request-method'] === undefined) {
				return handler(params)
			}
			if (allowedOrigin === undefined) {
				res.statusCode = 403
				res.end()
				return undefined
			}

			const allowMethods = config.allowMethods ?? DEFAULT_ALLOWED_METHODS
			const allowHeaders = config.allowHeaders ?? DEFAULT_ALLOWED_HEADERS
			const maxAge = config.maxAge ?? DEFAULT_MAX_AGE_SECONDS
			if (allowMethods.length) {
				res.setHeader('Access-Control-Allow-Methods', allowMethods.join(','))
			}
			if (allowHeaders.length) {
				res.setHeader('Access-Control-Allow-Headers', allowHeaders.join(','))
			}
			if (Number.isSafeInteger(maxAge) && maxAge >= 0) {
				res.setHeader('Access-Control-Max-Age', String(maxAge))
			}
			res.statusCode = 200
			res.end()
			return undefined
		}
	}
}
