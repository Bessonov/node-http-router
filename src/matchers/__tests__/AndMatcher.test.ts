import * as httpMocks from 'node-mocks-http'
import {
	AndMatcher,
	ExactUrlPathnameMatcher,
	MethodMatcher,
} from '..'

it('none match', () => {
	const result = new AndMatcher([
		new MethodMatcher(['POST']),
		new ExactUrlPathnameMatcher(['/test']),
	]).match({ req: httpMocks.createRequest() })

	expect(result).toStrictEqual({
		matched: false,
	})
})

it('first match, second not', () => {
	const result = new AndMatcher([
		new MethodMatcher(['GET']),
		new ExactUrlPathnameMatcher(['/test']),
	]).match({ req: httpMocks.createRequest() })

	expect(result).toStrictEqual({
		matched: false,
	})
})

it('first not match, but second', () => {
	const req = httpMocks.createRequest({
		method: 'POST',
		url: '/test',
	})

	const result = new AndMatcher([
		new MethodMatcher(['GET']),
		new ExactUrlPathnameMatcher(['/test']),
	]).match({ req })

	expect(result).toStrictEqual({
		matched: false,
	})
})

it('both match', () => {
	const req = httpMocks.createRequest({
		url: '/test',
	})

	const result = new AndMatcher([
		new MethodMatcher(['GET']),
		new ExactUrlPathnameMatcher(['/test']),
	]).match({ req })

	expect(result).toStrictEqual({
		matched: true,
		result: {
			and: [
				{
					matched: true,
					result: {
						method: 'GET',
					},
				},
				{
					matched: true,
					result: {
						pathname: '/test',
					},
				},
			],
		},
	})
})
