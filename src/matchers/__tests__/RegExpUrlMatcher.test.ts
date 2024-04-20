import {
	createRequest,
} from 'node-mocks-http'
import type {
	ServerRequest,
} from '../../node/ServerRequest.js'
import {
	regExpUrl,
} from '../index.js'

it('not match', () => {
	const result = regExpUrl([/^\/test$/])
		.match({ req: createRequest<ServerRequest>() })
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('match', () => {
	const result = regExpUrl([/^\/test$/])
		.match({
			req: createRequest<ServerRequest>({
				url: '/test',
			}),
		})
	expect(result.matched).toBe(true)
	if (result.matched) {
		expect(result.result.match.input).toBe('/test')
	}
})

it('match first', () => {
	const result = regExpUrl([/^\/test$/, /^\/test2$/])
		.match({
			req: createRequest<ServerRequest>({
				url: '/test',
			}),
		})
	expect(result.matched).toBe(true)
	if (result.matched) {
		expect(result.result.match.input).toBe('/test')
	}
})

it('match second', () => {
	const result = regExpUrl([/^\/test$/, /^\/test2$/])
		.match({
			req: createRequest<ServerRequest>({
				url: '/test2',
			}),
		})
	expect(result.matched).toBe(true)
	if (result.matched) {
		expect(result.result.match.input).toBe('/test2')
	}
})

it('match group', () => {
	const result = regExpUrl<{ groupId: string }>([/^\/group\/(?<groupId>[^/]+)$/])
		.match({
			req: createRequest<ServerRequest>({
				url: '/group/123',
			}),
		})
	expect(result.matched).toBe(true)
	if (result.matched) {
		expect(result.result.match.input).toBe('/group/123')
		expect(result.result.match.groups.groupId).toBe('123')
	}
})

it(`url is empty`, () => {
	const result = regExpUrl([/^\/$/])
		.match({
			req: createRequest<ServerRequest>({
				url: '',
			}),
		})
	expect(result.matched).toBe(true)
	if (result.matched) {
		expect(result.result.match.input).toBe('/')
	}
})

it(`query string isn't matched`, () => {
	const result = regExpUrl([/^\/test$/])
		.match({
			req: createRequest<ServerRequest>({
				url: '/test?query=not-matched',
			}),
		})
	expect(result.matched).toBe(true)
	if (result.matched) {
		expect(result.result.match.input).toBe('/test')
	}
})
