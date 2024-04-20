import {
	createRequest,
} from 'node-mocks-http'
import type {
	ServerRequest,
} from '../../node/ServerRequest.js'
import {
	atLeastOneVal,
	chain,
	getNthVal,
	mapToNumVal,
	minCountVal,
	requiredVal,
} from '../../validators.js'
import {
	queryString,
} from '../index.js'

const matcher = queryString({
	mustPresent: chain(getNthVal(), requiredVal()),
	isOptional: getNthVal(),
	mustExact: chain(atLeastOneVal(['exactValue1', 'exactValue2']), getNthVal(), requiredVal()),
})

it('not match (mustPresent and mustExact are missing)', () => {
	const result = matcher.match({ req: createRequest<ServerRequest>() })
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('not match (mustPresent is missing)', () => {
	const result = matcher.match({
		req: createRequest<ServerRequest>({
			url: '/test?mustExact=exactValue1',
		}),
	})
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('not match (mustExact is missing)', () => {
	const result = matcher.match({
		req: createRequest<ServerRequest>({
			url: '/test?mustPresent=foo',
		}),
	})
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('match', () => {
	const result = matcher.match({
		req: createRequest<ServerRequest>({
			url: '/test?mustExact=exactValue1&mustPresent=foo',
		}),
	})
	expect(result).toStrictEqual({
		matched: true,
		result: {
			query: {
				mustPresent: 'foo',
				isOptional: undefined,
				mustExact: 'exactValue1',
			},
		},
	})
})

it('match with optional param', () => {
	const result = matcher.match({
		req: createRequest<ServerRequest>({
			url: '/test?mustExact=exactValue1&mustPresent=foo&isOptional=bar',
		}),
	})
	expect(result).toStrictEqual({
		matched: true,
		result: {
			query: {
				mustExact: 'exactValue1',
				mustPresent: 'foo',
				isOptional: 'bar',
			},
		},
	})
})

it('match with additional param', () => {
	const result = matcher.match({
		req: createRequest<ServerRequest>({
			url: '/test?mustExact=exactValue1&mustPresent=foo&additional=bar',
		}),
	})
	expect(result).toStrictEqual({
		matched: true,
		result: {
			query: {
				mustPresent: 'foo',
				isOptional: undefined,
				mustExact: 'exactValue1',
			},
		},
	})

	if (result.matched) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const checkType: {
			mustPresent: string
			isOptional: string | undefined
			mustExact: 'exactValue1' | 'exactValue2'
		} = result.result.query
	}
})

describe('PHP-style multi-querystring', () => {
	const multiMatcher = queryString({
		'userIds[]': chain(minCountVal(2), mapToNumVal()),
	})

	it(`don't match if absent`, () => {
		const result = multiMatcher.match({
			req: createRequest<ServerRequest>({
				url: '/test',
			}),
		})
		expect(result).toStrictEqual({
			matched: false,
		})
	})

	it(`don't match if count is less than desired`, () => {
		const result = multiMatcher.match({
			req: createRequest<ServerRequest>({
				url: '/test?userIds[]=1',
			}),
		})
		expect(result).toStrictEqual({
			matched: false,
		})
	})

	it(`match`, () => {
		const result = multiMatcher.match({
			req: createRequest<ServerRequest>({
				url: '/test?userIds[]=1&userIds[]=3',
			}),
		})
		expect(result).toStrictEqual({
			matched: true,
			result: {
				query: {
					'userIds[]': [1, 3],
				},
			},
		})
	})
})
