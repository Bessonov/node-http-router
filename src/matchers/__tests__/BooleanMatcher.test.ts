import {
	BooleanMatcher,
} from '..'

it('match', () => {
	const result = new BooleanMatcher(true)
		.match()
	expect(result).toStrictEqual({
		matched: true,
		result: true,
	})
})

it('not match', () => {
	const result = new BooleanMatcher(false)
		.match()
	expect(result).toStrictEqual({
		matched: false,
	})
})
