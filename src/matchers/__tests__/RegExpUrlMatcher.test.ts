import * as httpMocks from 'node-mocks-http'
import {
	RegExpUrlMatcher,
} from '..'

it('not match', () => {
	const result = new RegExpUrlMatcher([/^\/test$/])
		.match({ req: httpMocks.createRequest() })
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('match', () => {
	const result = new RegExpUrlMatcher([/^\/test$/])
		.match({
			req: httpMocks.createRequest({
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
			req: httpMocks.createRequest({
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
			req: httpMocks.createRequest({
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
			req: httpMocks.createRequest({
				url: '/group/123',
			}),
		})
	expect(result.matched).toBe(true)
	if (result.matched) {
		expect(result.result.match.input).toBe('/group/123')
		expect(result.result.match.groups.groupId).toBe('123')
	}
})
