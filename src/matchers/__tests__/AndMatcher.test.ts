import {
	createRequest,
} from 'node-mocks-http'
import {
	AndMatcher,
	BooleanMatcher,
	ExactUrlPathnameMatcher,
	MethodMatcher,
} from '..'
import type {
	ServerRequest,
} from '../../node/ServerRequest'

it('none match', () => {
	const result = new AndMatcher([
		new MethodMatcher(['POST']),
		new ExactUrlPathnameMatcher(['/test']),
	]).match({ req: createRequest<ServerRequest>() })

	expect(result).toStrictEqual({
		matched: false,
	})
})

it('first match, second not', () => {
	const result = new AndMatcher([
		new MethodMatcher(['GET']),
		new ExactUrlPathnameMatcher(['/test']),
	]).match({ req: createRequest<ServerRequest>() })

	expect(result).toStrictEqual({
		matched: false,
	})
})

it('first not match, but second', () => {
	const req = createRequest<ServerRequest>({
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
	const req = createRequest<ServerRequest>({
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

it('three match', () => {
	const req = createRequest<ServerRequest>({
		url: '/test',
	})

	const result = new AndMatcher([
		new MethodMatcher(['GET']),
		new ExactUrlPathnameMatcher(['/test']),
		new BooleanMatcher(true),
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
				{
					matched: true,
					result: true,
				},
			],
		},
	})
})
