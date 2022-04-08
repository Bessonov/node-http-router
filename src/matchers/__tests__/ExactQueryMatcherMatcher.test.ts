import * as httpMocks from 'node-mocks-http'
import {
	ExactQueryMatcher,
} from '..'

const matcher = new ExactQueryMatcher({
	mustPresent: true,
	mustAbsent: false,
	isOptional: undefined,
	mustExact: 'exactValue',
})

it('not match (mustPresent and mustExact are missing)', () => {
	const result = matcher.match(httpMocks.createRequest())
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('not match (mustPresent is missing)', () => {
	const result = matcher.match(httpMocks.createRequest({
		url: '/test?mustExact=exactValue',
	}))
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('not match (mustExact is missing)', () => {
	const result = matcher.match(httpMocks.createRequest({
		url: '/test?mustPresent=foo',
	}))
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('match', () => {
	const result = matcher.match(httpMocks.createRequest({
		url: '/test?mustExact=exactValue&mustPresent=foo',
	}))
	expect(result).toStrictEqual({
		matched: true,
		query: {
			mustExact: 'exactValue',
			mustPresent: 'foo',
		},
	})
})

it('match with optional param', () => {
	const result = matcher.match(httpMocks.createRequest({
		url: '/test?mustExact=exactValue&mustPresent=foo&isOptional=bar',
	}))
	expect(result).toStrictEqual({
		matched: true,
		query: {
			mustExact: 'exactValue',
			mustPresent: 'foo',
			isOptional: 'bar',
		},
	})
})

it('not match because of forbidden param', () => {
	const result = matcher.match(httpMocks.createRequest({
		url: '/test?mustExact=exactValue&mustPresent=foo&mustAbsent=foo',
	}))
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('match with additional param', () => {
	const result = matcher.match(httpMocks.createRequest({
		url: '/test?mustExact=exactValue&mustPresent=foo&additional=bar',
	}))
	expect(result).toStrictEqual({
		matched: true,
		query: {
			mustExact: 'exactValue',
			mustPresent: 'foo',
			additional: 'bar',
		},
	})
})
