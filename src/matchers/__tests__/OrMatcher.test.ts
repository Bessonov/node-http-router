import * as httpMocks from 'node-mocks-http'
import {
	ExactUrlPathnameMatcher, MethodMatcher, OrMatcher,
} from '..'

it('none match', () => {
	const result = new OrMatcher([
		new MethodMatcher(['DELETE']),
		new MethodMatcher(['POST']),
	])
		.match(httpMocks.createRequest(), httpMocks.createResponse())
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('first match, second not', () => {
	const result = new OrMatcher([
		new MethodMatcher(['DELETE']),
		new MethodMatcher(['POST']),
	]).match(httpMocks.createRequest({ method: 'DELETE' }), httpMocks.createResponse())
	expect(result).toStrictEqual({
		matched: true,
		or: [
			{
				matched: true,
				method: 'DELETE',
			},
			{
				matched: false,
			},
		],
	})
})

it('first not match, but second', () => {
	const request = httpMocks.createRequest({
		method: 'POST',
	})

	const result = new OrMatcher([
		new MethodMatcher(['DELETE']),
		new MethodMatcher(['POST']),
	]).match(request, httpMocks.createResponse())
	expect(result).toStrictEqual({
		matched: true,
		or: [
			{
				matched: false,
			},
			{
				matched: true,
				method: 'POST',
			},
		],
	})
})

it('both match', () => {
	const request = httpMocks.createRequest({
		url: '/test',
	})

	const result = new OrMatcher([
		new MethodMatcher(['GET']),
		new ExactUrlPathnameMatcher(['/test']),
	]).match(request, httpMocks.createResponse())
	expect(result).toStrictEqual({
		matched: true,
		or: [
			{
				matched: true,
				method: 'GET',
			},
			{
				matched: true,
				pathname: '/test',
			},
		],
	})
})
