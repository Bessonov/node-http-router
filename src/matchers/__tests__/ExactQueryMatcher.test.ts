import {
	createRequest,
} from 'node-mocks-http'
import type {
	ServerRequest,
} from '../../node/ServerRequest.js'
import {
	exactQuery,
} from '../index.js'

const matcher = exactQuery({
	mustPresent: true,
	mustAbsent: false,
	isOptional: undefined,
	mustExact: ['exactValue1', 'exactValue2'] as const,
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
				mustExact: 'exactValue1',
				mustPresent: 'foo',
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

it('not match because of forbidden param', () => {
	const result = matcher.match({
		req: createRequest<ServerRequest>({
			url: '/test?mustExact=exactValue1&mustPresent=foo&mustAbsent=foo',
		}),
	})
	expect(result).toStrictEqual({
		matched: false,
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
				mustExact: 'exactValue1',
				mustPresent: 'foo',
				additional: 'bar',
			},
		},
	})
	if (result.matched) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const checkType: 'exactValue1' | 'exactValue2' = result.result.query.mustExact
	}
})

it('no decoding', () => {
	const result = matcher.match({
		req: createRequest<ServerRequest>({
			url: '/auth?mustPresent=https%3A%2F%2Fmyhost%3A4520%2Fonboarding&mustExact=exactValue1',
		}),
	})
	expect(result).toStrictEqual({
		matched: true,
		result: {
			query: {
				mustExact: 'exactValue1',
				mustPresent: 'https%3A%2F%2Fmyhost%3A4520%2Fonboarding',
			},
		},
	})
})

it('only recognizes explicitly present query names', () => {
	const ownKeyMatcher = exactQuery({ toString: true })
	expect(ownKeyMatcher.match({ req: { url: '/test' } })).toStrictEqual({ matched: false })
	expect(ownKeyMatcher.match({ req: { url: '/test?toString=label' } })).toStrictEqual({
		matched: true,
		result: { query: { toString: 'label' } },
	})
})

it('preserves empty values and the full last value for repeated keys', () => {
	const rawMatcher = exactQuery({ preview: [''], token: ['YQ=='] })
	expect(rawMatcher.match({ req: { url: '/test?preview&token=Yg==&token=YQ==' } })).toStrictEqual({
		matched: true,
		result: { query: { preview: '', token: 'YQ==' } },
	})
})
