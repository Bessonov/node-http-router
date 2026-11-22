import {
	createRequest,
} from 'node-mocks-http'
import type {
	ServerRequest,
} from '../../node/ServerRequest.js'
import {
	RegExpUrlMatcher,
} from '../RegExpUrlMatcher.js'

it('not match', () => {
	const result = new RegExpUrlMatcher([/^\/test$/])
		.match({ req: createRequest<ServerRequest>() })
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('match', () => {
	const result = new RegExpUrlMatcher([/^\/test$/])
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
	const result = new RegExpUrlMatcher([/^\/test$/, /^\/test2$/])
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
	const result = new RegExpUrlMatcher([/^\/test$/, /^\/test2$/])
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
	const result = new RegExpUrlMatcher<{ groupId: string }>([/^\/group\/(?<groupId>[^/]+)$/])
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

it.each([/^\/test/g, /^\/test/y])('matches every request independently with %s', expression => {
	const matcher = new RegExpUrlMatcher([expression])
	const data = { req: { url: '/test' } }
	expect(matcher.match(data).matched).toBe(true)
	expect(matcher.match(data).matched).toBe(true)
	expect(expression.lastIndex).toBe(0)
})
