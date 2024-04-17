import {
	createRequest,
} from 'node-mocks-http'
import {
	exactUrlPathname,
} from '..'
import type {
	ServerRequest,
} from '../../node/ServerRequest'

it('not match empty', () => {
	const result = exactUrlPathname(['/test'])
		.match({ req: createRequest<ServerRequest>() })
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('not match with postfix', () => {
	const result = exactUrlPathname(['/test'])
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
	const result = exactUrlPathname(['/test'])
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
	const result = exactUrlPathname(['/test'])
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
	const result = exactUrlPathname(['/test', '/foo'])
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
	const result = exactUrlPathname(['/test', '/foo'])
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
