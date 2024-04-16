import {
	createRequest,
} from 'node-mocks-http'
import {
	ExactUrlPathnameMatcher,
} from '..'
import type {
	ServerRequest,
} from '../../node/ServerRequest'

it('not match empty', () => {
	const result = new ExactUrlPathnameMatcher(['/test'])
		.match({ req: createRequest<ServerRequest>() })
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('not match with postfix', () => {
	const result = new ExactUrlPathnameMatcher(['/test'])
		.match({
			req: createRequest<ServerRequest>({
				url: '/test2',
			}),
		})
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('not match prefix', () => {
	const result = new ExactUrlPathnameMatcher(['/test'])
		.match({
			req: createRequest<ServerRequest>({
				url: '/tes',
			}),
		})
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('match', () => {
	const result = new ExactUrlPathnameMatcher(['/test'])
		.match({
			req: createRequest<ServerRequest>({
				url: '/test?foo=bar',
			}),
		})
	expect(result).toStrictEqual({
		matched: true,
		result: {
			pathname: '/test',
		},
	})
})

it('match first', () => {
	const result = new ExactUrlPathnameMatcher(['/test', '/foo'])
		.match({
			req: createRequest<ServerRequest>({
				url: '/test',
			}),
		})
	expect(result).toStrictEqual({
		matched: true,
		result: {
			pathname: '/test',
		},
	})
})

it('match second', () => {
	const result = new ExactUrlPathnameMatcher(['/test', '/foo'])
		.match({
			req: createRequest<ServerRequest>({
				url: '/foo',
			}),
		})
	expect(result).toStrictEqual({
		matched: true,
		result: {
			pathname: '/foo',
		},
	})
})
