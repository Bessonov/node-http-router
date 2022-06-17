import * as httpMocks from 'node-mocks-http'
import {
	EndpointMatcher,
} from '..'

it('not match empty', () => {
	const result = new EndpointMatcher('GET', /\/test/)
		.match({ req: httpMocks.createRequest() })
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('usual usage', () => {
	const matcher = new EndpointMatcher(['GET', 'POST'], /\/test/)
	// https://github.com/facebook/jest/issues/8475#issuecomment-656629010
	expect(() => {
		expect(matcher.match({
			req: httpMocks.createRequest({
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
			req: httpMocks.createRequest({
				method: 'POST',
				url: '/test',
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
		req: httpMocks.createRequest({
			method: 'OPTIONS',
			url: '/test',
		}),
	})).toStrictEqual({
		matched: false,
	})
})
