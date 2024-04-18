import {
	createRequest,
} from 'node-mocks-http'
import {
	method,
} from '../MethodMatcher.js'
import type {
	ServerRequest,
} from '../../node/ServerRequest.js'

it('not match', () => {
	const result = method(['POST'])
		.match({ req: createRequest<ServerRequest>() })
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('match GET', () => {
	const result = method(['GET'])
		.match({
			req: createRequest<ServerRequest>({
				url: '/test',
			}),
		})
	expect(result).toStrictEqual({
		matched: true,
		result: {
			method: 'GET',
		},
	})
})

it('match first', () => {
	const result = method(['POST', 'GET'])
		.match({
			req: createRequest<ServerRequest>({
				method: 'POST',
			}),
		})
	expect(result).toStrictEqual({
		matched: true,
		result: {
			method: 'POST',
		},
	})
})

it('match second', () => {
	const result = method(['POST', 'GET'])
		.match({
			req: createRequest<ServerRequest>({
				method: 'GET',
			}),
		})
	expect(result).toStrictEqual({
		matched: true,
		result: {
			method: 'GET',
		},
	})
})
