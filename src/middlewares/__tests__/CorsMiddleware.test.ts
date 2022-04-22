import {
	createRequest,
	createResponse,
} from 'node-mocks-http'
import {
	CorsMiddleware,
} from '../CorsMiddleware'

describe('simple configuration', () => {
	beforeEach(() => {
		jest.resetAllMocks()
	})

	const innerHandler = jest.fn()
	const handler = CorsMiddleware({
		origins: ['http://0.0.0.0:8000'],
	})(innerHandler)

	it('no action', async () => {
		const req = createRequest({
			method: 'GET',
			headers: {
				origin: 'http://0.0.0.0:8000',
			},
		})
		const res = createResponse()
		await handler(req, res, { matched: true })
		expect(innerHandler).toBeCalledTimes(1)
		expect(res.getHeader('Access-Control-Allow-Methods')).toBeUndefined()
		expect(res.getHeader('Access-Control-Allow-Origin')).toBe('http://0.0.0.0:8000')
	})

	it('cors request', async () => {
		const req = createRequest({
			method: 'OPTIONS',
			headers: {
				origin: 'http://0.0.0.0:8000',
			},
		})
		const res = createResponse()
		await handler(req, res, { matched: true })
		expect(innerHandler).toBeCalledTimes(0)
		expect(res.getHeader('Access-Control-Allow-Methods')).toBe('POST,GET,PUT,PATCH,DELETE,OPTIONS')
		expect(res.getHeader('Access-Control-Allow-Origin')).toBe('http://0.0.0.0:8000')
		expect(res.getHeader('Access-Control-Allow-Credentials')).toBe('true')
	})

	it('without origin', async () => {
		const req = createRequest({
			method: 'OPTIONS',
		})
		const res = createResponse()
		await handler(req, res, { matched: true })
		expect(innerHandler).toBeCalledTimes(0)
		expect(res.getHeader('Access-Control-Allow-Methods')).toBe('POST,GET,PUT,PATCH,DELETE,OPTIONS')
		expect(res.getHeader('Access-Control-Allow-Origin')).toBeUndefined()
	})

	it('request was ended before', async () => {
		const req = createRequest({
			method: 'GET',
		})
		const res = createResponse()
		res.end()
		await handler(req, res, { matched: true })
		expect(innerHandler).toBeCalledTimes(1)
		expect(res.getHeader('Access-Control-Allow-Methods')).toBeUndefined()
		expect(res.getHeader('Access-Control-Allow-Origin')).toBeUndefined()
	})
})

describe('changed defaults', () => {
	beforeEach(() => {
		jest.resetAllMocks()
	})

	const innerHandler = jest.fn()
	const handler = CorsMiddleware({
		origins: ['*'],
		allowMethods: ['POST', 'DELETE'],
		allowHeaders: ['Authorization'],
		allowCredentials: false,
		maxAge: 360,
	})(innerHandler)

	it('no action', async () => {
		const req = createRequest({
			method: 'OPTIONS',
			headers: {
				origin: 'http:/idontcare:80',
			},
		})
		const res = createResponse()
		await handler(req, res, { matched: true })
		expect(innerHandler).toBeCalledTimes(0)
		expect(res.getHeader('Access-Control-Allow-Methods')).toBe('POST,DELETE')
		expect(res.getHeader('Access-Control-Allow-Origin')).toBe('http:/idontcare:80')
		expect(res.getHeader('Access-Control-Max-Age')).toBe('360')
		expect(res.getHeader('Access-Control-Allow-Credentials')).toBeUndefined()
	})
})
