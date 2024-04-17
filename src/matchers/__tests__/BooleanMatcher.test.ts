import {
	bool,
} from '..'

it('match', () => {
	const result = bool(true)
		.match()
	expect(result).toStrictEqual({
		matched: true,
		result: true,
	})
})

it('not match', () => {
	const result = bool(false)
		.match()
	expect(result).toStrictEqual({
		matched: false,
	})
})
