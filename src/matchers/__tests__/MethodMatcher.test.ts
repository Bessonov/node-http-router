import {
	createRequest,
} from 'node-mocks-http'
import {
	MethodMatcher,
} from '../MethodMatcher'
import type {
	ServerRequest,
} from '../../node/ServerRequest'

it('not match', () => {
	const result = new MethodMatcher(['POST'])
		.match({ req: createRequest<ServerRequest>() })
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('match GET', () => {
	const result = new MethodMatcher(['GET'])
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
	const result = new MethodMatcher(['POST', 'GET'])
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
	const result = new MethodMatcher(['POST', 'GET'])
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
