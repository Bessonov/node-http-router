import {
	createRequest,
} from 'node-mocks-http'
import {
	ExactUrlPathnameMatcher,
	MethodMatcher,
	OrMatcher,
} from '..'
import type {
	ServerRequest,
} from '../../node/ServerRequest'

it('none match', () => {
	const result = new OrMatcher([
		new MethodMatcher(['DELETE']),
		new MethodMatcher(['POST']),
	])
		.match({ req: createRequest<ServerRequest>() })
	expect(result).toStrictEqual({
		matched: false,
	})
})

it('first match, second not', () => {
	const result = new OrMatcher([
		new MethodMatcher(['DELETE']),
		new MethodMatcher(['POST']),
	]).match({ req: createRequest<ServerRequest>({ method: 'DELETE' }) })
	expect(result).toStrictEqual({
		matched: true,
		result: {
			or: [
				{
					matched: true,
					result: {
						method: 'DELETE',
					},
				},
				{
					matched: false,
				},
			],
		},
	})
})

it('first not match, but second', () => {
	const req = createRequest<ServerRequest>({
		method: 'POST',
	})

	const result = new OrMatcher([
		new MethodMatcher(['DELETE']),
		new MethodMatcher(['POST']),
	]).match({ req })
	expect(result).toStrictEqual({
		matched: true,
		result: {
			or: [
				{
					matched: false,
				},
				{
					matched: true,
					result: {
						method: 'POST',
					},
				},
			],
		},
	})
})

it('both match', () => {
	const req = createRequest<ServerRequest>({
		url: '/test',
	})

	const result = new OrMatcher([
		new MethodMatcher(['GET']),
		new ExactUrlPathnameMatcher(['/test']),
	]).match({ req })
	expect(result).toStrictEqual({
		matched: true,
		result: {
			or: [
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
