// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type Any = any

export interface Validator<I, O> {
	(): {
		// should return the parse function instead of boolean?
		match(value: I): boolean
		// rename to getValue and remove args?
		parse(value: I): O
	}
}

function parseNumber(value: string): number {
	if (value.trim().length === 0) {
		return Number('nan')
	}
	return Number(value)
}

export function trueVal<I>(): Validator<I[], NoInfer<I>[]> {
	return () => ({
		match: (): boolean => true,
		parse: (value: I[]): I[] => value,
	})
}

export function requiredVal<I>(): Validator<I | void | undefined | null, NonNullable<NoInfer<I>>> {
	return () => ({
		match(value: I | undefined | null): boolean {
			return value !== undefined && value !== null
		},
		parse(value: I | undefined | null) {
			return value as NonNullable<I>
		},
	})
}

export function getNthVal<I>(num: number = 0): Validator<I[], NoInfer<I> | undefined> {
	return () => ({
		match(value): boolean {
			return Array.isArray(value)
		},
		parse(value) {
			if (num >= 0) {
				return value[num]
			}
			const newNum = value.length + num
			return value[newNum]
		},
	})
}

export function mapToNumVal<I extends string[]>(): Validator<I, number[]> {
	return () => {
		const parsedValues: number[] = []
		return {
			match(values: string[]): boolean {
				for (const value of values) {
					const parsedValue = parseNumber(value)
					if (Number.isNaN(parsedValue)) {
						return false
					}
					parsedValues.push(parsedValue)
				}
				return true
			},
			parse(): number[] {
				return parsedValues
			},
		}
	}
}

export function oneOfVal<const I extends string | number | boolean>(values: I[]): Validator<I, I> {
	return () => ({
		match: value => values.includes(value),
		parse: (value: I): I => value,
	})
}

export function atLeastOneVal<const I extends string | number | boolean>(
	expectedValues: I[],
): Validator<I[], I[]> {
	return () => {
		let newValues: I[]
		return {
			match(values: I[]): boolean {
				newValues = values.filter(value => expectedValues.includes(value))
				return newValues.length > 0
			},
			parse(): I[] {
				return newValues
			},
		}
	}
}

export function minCountVal<const I extends string | number | boolean>(
	min: number,
): Validator<I[], NoInfer<I>[]> {
	return () => ({
		match(value: I[]): boolean {
			return value.length >= min
		},
		parse(value: I[]): I[] {
			return value
		},
	})
}

export function toNumVal<I extends string>(): Validator<I, number> {
	return () => {
		let parsedValue: number
		return {
			match(value: I) {
				parsedValue = parseNumber(value)
				return Number.isNaN(parsedValue) === false
			},
			parse() {
				return parsedValue
			},
		}
	}
}

export function chain<I, O1, O2, O3, O>(
	val1: Validator<I, O1>,
	val2: Validator<O1, O2>,
	val3: Validator<O2, O3>,
	val4: Validator<O3, O>,
): Validator<I, O>
export function chain<I, O1, O2, O>(
	val1: Validator<I, O1>,
	val2: Validator<O1, O2>,
	val3: Validator<O2, O>,
): Validator<I, O>
export function chain<I, O1, O>(
	val1: Validator<I, O1>,
	val2: Validator<O1, O>,
): Validator<I, O>
export function chain<I, O>(
	val1: Validator<I, O>,
): Validator<I, O>
export function chain(...validators: Validator<Any, Any>[]): Validator<Any, Any> {
	return () => {
		let lastValidatorValue: Any
		return {
			match(value) {
				lastValidatorValue = value
				for (const validatorFactory of validators) {
					const validator = validatorFactory()
					const match = validator.match(lastValidatorValue)
					if (!match) {
						return false
					}
					lastValidatorValue = validator.parse(lastValidatorValue)
				}
				return true
			},
			parse() {
				return lastValidatorValue
			},
		}
	}
}
