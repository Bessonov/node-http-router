import * as httpMocks from 'node-mocks-http'
import { MethodMatcher } from '..'

it('not match', () => {
	const result = new MethodMatcher(['POST'])
		.match(httpMocks.createRequest())
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('match GET', () => {
	const result = new MethodMatcher(['GET'])
		.match(httpMocks.createRequest({
			url: '/test',
		}))
	expect(result).toStrictEqual({
		matched: true,
		method: 'GET',
	})
})

it('match first', () => {
	const result = new MethodMatcher(['POST', 'GET'])
		.match(httpMocks.createRequest({
			method: 'POST',
		}))
	expect(result).toStrictEqual({
		matched: true,
		method: 'POST',
	})
})

it('match second', () => {
	const result = new MethodMatcher(['POST', 'GET'])
		.match(httpMocks.createRequest({
			method: 'GET',
		}))
	expect(result).toStrictEqual({
		matched: true,
		method: 'GET',
	})
})
