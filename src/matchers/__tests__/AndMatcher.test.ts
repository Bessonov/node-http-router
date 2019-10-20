import * as httpMocks from 'node-mocks-http'
import {
	AndMatcher, ExactUrlPathnameMatcher, MethodMatcher,
} from '..'


it('none match', () => {
	const result = new AndMatcher([
		new MethodMatcher(['POST']),
		new ExactUrlPathnameMatcher(['/test']),
	]).match(httpMocks.createRequest(), httpMocks.createResponse())

	expect(result).toStrictEqual({
		matched: false,
	})
})

it('first match, second not', () => {
	const result = new AndMatcher([
		new MethodMatcher(['GET']),
		new ExactUrlPathnameMatcher(['/test']),
	]).match(httpMocks.createRequest(), httpMocks.createResponse())

	expect(result).toStrictEqual({
		matched: false,
	})
})

it('first not match, but second', () => {
	const request = httpMocks.createRequest({
		method: 'POST',
		url: '/test',
	})

	const result = new AndMatcher([
		new MethodMatcher(['GET']),
		new ExactUrlPathnameMatcher(['/test']),
	]).match(request, httpMocks.createResponse())

	expect(result).toStrictEqual({
		matched: false,
	})
})

it('both match', () => {
	const request = httpMocks.createRequest({
		url: '/test',
	})

	const result = new AndMatcher([
		new MethodMatcher(['GET']),
		new ExactUrlPathnameMatcher(['/test']),
	]).match(request, httpMocks.createResponse())

	expect(result).toStrictEqual({
		matched: true,
		and: [
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
