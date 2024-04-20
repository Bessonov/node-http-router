// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type Any = any

type Getter<O> = (() => O) | undefined

type Unrequired = undefined | null | void

export interface Validator<I, O> {
	(value: I): Getter<O>
}

function parseNumber(value: string): number {
	if (value.trim().length === 0) {
		return Number('nan')
	}
	return Number(value)
}

export function trueVal<I>(): Validator<I[], NoInfer<I>[]> {
	return (value: I[]) => () => value
}

export function requiredVal<I>(): Validator<I | Unrequired, NonNullable<NoInfer<I>>> {
	return (value: I | Unrequired): Getter<NonNullable<I>> => {
		if (value === undefined || value === null) {
			return undefined
		}
		return () => value
	}
}

export function getNthVal<I>(num: number = 0): Validator<I[] | Unrequired, NoInfer<I> | undefined> {
	return (value: I[] | Unrequired) => {
		if (value === undefined || value === null) {
			return () => undefined
		}
		if (Array.isArray(value)) {
			return () => {
				if (num >= 0) {
					return value[num]
				}
				const newNum = value.length + num
				return value[newNum]
			}
		}
		return undefined
	}
}

export function mapToNumVal<I extends string[]>(): Validator<I | Unrequired, number[]> {
	return (values: string[] | Unrequired) => {
		if (values === undefined || values === null) {
			return undefined
		}
		const parsedValues: number[] = []
		for (const value of values) {
			const parsedValue = parseNumber(value)
			if (Number.isNaN(parsedValue)) {
				return undefined
			}
			parsedValues.push(parsedValue)
		}
		return () => parsedValues
	}
}

export function oneOfVal<const I extends string | number | boolean | Unrequired>(values: I[]): Validator<I, I> {
	return (value: I): Getter<I> => {
		if (values.includes(value)) {
			return () => value
		}
		return undefined
	}
}

export function atLeastOneVal<I extends string | number | boolean, const O extends I>(
	expectedValues: O[],
): Validator<I[] | Unrequired, NoInfer<O>[]> {
	return (values: I[] | Unrequired): Getter<O[]> => {
		const newValues = ((values ?? []) as O[]).filter(value => expectedValues.includes(value))
		if (newValues.length > 0) {
			return () => newValues
		}
		return undefined
	}
}

export function minCountVal<const I extends string | number | boolean>(
	min: number,
): Validator<I[] | Unrequired, NoInfer<I>[]> {
	return (value: I[] | Unrequired): Getter<I[]> => {
		if (value !== undefined && value !== null && value.length >= min) {
			return () => value
		}
		return undefined
	}
}

export function toNumVal<I extends string>(): Validator<I, number> {
	return (value: I): Getter<number> => {
		const parsedValue = parseNumber(value)
		if (Number.isNaN(parsedValue)) {
			return undefined
		}
		return () => parsedValue
	}
}

export function chain<I, O1, O2, O3, O4, O>(
	val1: Validator<I, O1>,
	val2: Validator<O1, O2>,
	val3: Validator<O2, O3>,
	val4: Validator<O3, O4>,
	val5: Validator<O4, O>,
): Validator<I, O>
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
	return value => {
		let lastValidatorValue = value
		for (const matcher of validators) {
			const getter = matcher(lastValidatorValue)
			if (getter === undefined) {
				return undefined
			}
			lastValidatorValue = getter()
		}
		return () => lastValidatorValue
	}
}
