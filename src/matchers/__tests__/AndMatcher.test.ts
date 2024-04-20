import {
	createRequest,
} from 'node-mocks-http'
import type {
	ServerRequest,
} from '../../node/ServerRequest.js'
import {
	and,
	bool,
	exactUrlPathname,
	method,
} from '../index.js'

it('none match', () => {
	const result = and([
		method(['POST']),
		exactUrlPathname(['/test']),
	]).match({ req: createRequest<ServerRequest>() })

	expect(result).toStrictEqual({
		matched: false,
	})
})

it('first match, second not', () => {
	const result = and([
		method(['GET']),
		exactUrlPathname(['/test']),
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

	const result = and([
		method(['GET']),
		exactUrlPathname(['/test']),
	]).match({ req })

	expect(result).toStrictEqual({
		matched: false,
	})
})

it('both match', () => {
	const req = createRequest<ServerRequest>({
		url: '/test',
	})

	const result = and([
		method(['GET']),
		exactUrlPathname(['/test']),
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

it('three not a match', () => {
	const req = createRequest<ServerRequest>({
		url: '/test',
	})

	const result = and([
		method(['GET']),
		exactUrlPathname(['/test']),
		bool(false),
	]).match({ req })

	expect(result).toStrictEqual({
		matched: false,
	})
})

it('three match', () => {
	const req = createRequest<ServerRequest>({
		url: '/test',
	})

	const result = and([
		method(['GET']),
		exactUrlPathname(['/test']),
		bool(true),
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
