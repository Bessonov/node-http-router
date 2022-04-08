import * as httpMocks from 'node-mocks-http'
import {
	ExactUrlPathnameMatcher,
} from '..'

it('not match empty', () => {
	const result = new ExactUrlPathnameMatcher(['/test'])
		.match(httpMocks.createRequest())
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('not match with postfix', () => {
	const result = new ExactUrlPathnameMatcher(['/test'])
		.match(httpMocks.createRequest({
			url: '/test2',
		}))
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('not match prefix', () => {
	const result = new ExactUrlPathnameMatcher(['/test'])
		.match(httpMocks.createRequest({
			url: '/tes',
		}))
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('match', () => {
	const result = new ExactUrlPathnameMatcher(['/test'])
		.match(httpMocks.createRequest({
			url: '/test?foo=bar',
		}))
	expect(result).toStrictEqual({
		matched: true,
		pathname: '/test',
	})
})

it('match first', () => {
	const result = new ExactUrlPathnameMatcher(['/test', '/foo'])
		.match(httpMocks.createRequest({
			url: '/test',
		}))
	expect(result).toStrictEqual({
		matched: true,
		pathname: '/test',
	})
})

it('match second', () => {
	const result = new ExactUrlPathnameMatcher(['/test', '/foo'])
		.match(httpMocks.createRequest({
			url: '/foo',
		}))
	expect(result).toStrictEqual({
		matched: true,
		pathname: '/foo',
	})
})
