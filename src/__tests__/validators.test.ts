import {
	atLeastOneVal,
	getNthVal,
	mapToNumVal,
	minCountVal,
	oneOfVal,
	requiredVal,
	toNumVal,
	trueVal,
} from '../validators.js'

describe(trueVal.name, () => {
	it('matches always', () => {
		const validator = trueVal<string>()
		const input = ['any']
		expect(validator(input)).toBeDefined()
		expect(validator(input)?.()).toBe(input)
	})
})

describe(requiredVal.name, () => {
	const validator = requiredVal<string>()
	it(`don't match undefined and null`, () => {
		expect(validator()).toBeUndefined()
		expect(validator(undefined)).toBeUndefined()
		expect(validator(null)).toBeUndefined()
	})

	it('match defined values', () => {
		const value = 'test'
		expect(validator(value)).toBeInstanceOf(Function)
		expect(validator(value)?.()).toBe(value)
	})
})

describe(getNthVal.name, () => {
	const validator = getNthVal<string>()
	it(`don't match non-arrays`, () => {
		expect(validator({} as unknown as string[])).toBeUndefined()
	})

	it('match defined values and return the first value', () => {
		expect(validator()).toBeInstanceOf(Function)
		expect(validator()?.()).toBe(undefined)
		expect(validator(null)).toBeInstanceOf(Function)
		expect(validator(null)?.()).toBe(undefined)
		expect(validator(['value1', 'value2', 'value3'])).toBeInstanceOf(Function)
		expect(validator(['value1', 'value2', 'value3'])?.()).toBe('value1')
	})

	it('match defined values and return the last value', () => {
		const validatorLast = getNthVal<string>(-1)
		expect(validatorLast(['value1', 'value2', 'value3'])).toBeInstanceOf(Function)
		expect(validatorLast(['value1', 'value2', 'value3'])?.()).toBe('value3')
	})
})

describe(mapToNumVal.name, () => {
	const validator = mapToNumVal()
	it(`don't match uncconvertible arrays`, () => {
		expect(validator()).toBeUndefined()
		expect(validator(null)).toBeUndefined()
		expect(validator(['1', ' '])).toBeUndefined()
		expect(validator(['1', 'a'])).toBeUndefined()
		expect(validator(['1_000'])).toBeUndefined()
	})

	it(`convert a string array to a number array`, () => {
		expect(validator([])).toBeDefined()
		expect(validator([])?.()).toStrictEqual([])

		expect(validator(['1', '-1', '1000'])).toBeDefined()
		expect(validator(['1', '-1', '1000'])?.()).toStrictEqual([1, -1, 1_000])

		expect(validator([' 1 '])).toBeDefined()
		expect(validator([' 1 '])?.()).toStrictEqual([1])
	})
})

describe(oneOfVal.name, () => {
	const validator = oneOfVal(['a', 'b', 'c'])

	it(`don't match if not in list`, () => {
		expect(validator('1' as 'a')).toBeUndefined()
	})

	it(`match one of the list`, () => {
		expect(validator('b' as 'a')).toBeDefined()
		expect(validator('b' as 'a')?.()).toStrictEqual('b')
	})
})

describe(atLeastOneVal.name, () => {
	const validator = atLeastOneVal(['a', 'b', 'c'])

	it(`don't match if not in list`, () => {
		expect(validator()).toBeUndefined()
		expect(validator(null)).toBeUndefined()
		expect(validator(['1'])).toBeUndefined()
	})

	it(`match one of the list`, () => {
		expect(validator(['b', 'c', 'd'])).toBeDefined()
		expect(validator(['b', 'c', 'd'])?.()).toStrictEqual(['b', 'c'])
	})
})

describe(minCountVal.name, () => {
	const validator = minCountVal(2)

	it(`don't match if not enough elements`, () => {
		expect(validator()).toBeUndefined()
		expect(validator(null)).toBeUndefined()
		expect(validator([])).toBeUndefined()
		expect(validator(['1'])).toBeUndefined()
	})

	it(`match if enough elements`, () => {
		expect(validator(['1', '2'])).toBeDefined()
		expect(validator(['1', '2'])?.()).toStrictEqual(['1', '2'])
	})
})

describe(toNumVal.name, () => {
	const validator = toNumVal()

	it(`don't match if not convertible to a number`, () => {
		expect(validator('')).toBeUndefined()
		expect(validator(' ')).toBeUndefined()
		expect(validator('a')).toBeUndefined()
	})

	it(`match if convertible to a number`, () => {
		expect(validator('1')).toBeDefined()
		expect(validator('1')?.()).toStrictEqual(1)
	})
})
