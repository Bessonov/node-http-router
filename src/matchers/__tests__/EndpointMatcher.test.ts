import {
	createRequest,
} from 'node-mocks-http'
import {
	EndpointMatcher,
} from '..'
import type {
	ServerRequest,
} from '../../node/ServerRequest'

it('not match empty', () => {
	const result = new EndpointMatcher('GET', /\/test/)
		.match({ req: createRequest<ServerRequest>() })
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('usual usage', () => {
	const matcher = new EndpointMatcher(['GET', 'POST'], /\/test/)
	// https://github.com/facebook/jest/issues/8475#issuecomment-656629010
	expect(() => {
		expect(matcher.match({
			req: createRequest<ServerRequest>({
				url: '/test',
			}),
		})).toStrictEqual({
			matched: true,
			result: {
				method: 'GET',
				match: [
					'/test',
				],
			},
		})
	}).toThrow('serializes to the same string')

	expect(() => {
		expect(matcher.match({
			req: createRequest<ServerRequest>({
				method: 'POST',
				url: '/test?query=ignored',
			}),
		})).toStrictEqual({
			matched: true,
			result: {
				method: 'POST',
				match: [
					'/test',
				],
			},
		})
	}).toThrow('serializes to the same string')

	expect(matcher.match({
		req: createRequest<ServerRequest>({
			method: 'OPTIONS',
			url: '/test',
		}),
	})).toStrictEqual({
		matched: false,
	})
})
