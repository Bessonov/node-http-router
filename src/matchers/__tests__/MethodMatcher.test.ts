import * as httpMocks from 'node-mocks-http'
import {
	MethodMatcher,
} from '../MethodMatcher'

it('not match', () => {
	const result = new MethodMatcher(['POST'])
		.match({ req: httpMocks.createRequest() })
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('match GET', () => {
	const result = new MethodMatcher(['GET'])
		.match({
			req: httpMocks.createRequest({
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
			req: httpMocks.createRequest({
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
			req: httpMocks.createRequest({
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
