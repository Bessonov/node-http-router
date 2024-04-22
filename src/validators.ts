// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type Any = any

export type AnyValidator = Validator<string[] | undefined, Any>

export type Getter<O> = (() => O) | undefined

export type Undefined = undefined | null | void

export interface Validator<I, O> {
	(value: I): Getter<O>
}

function parseNumber(value: string): number {
	if (value.trim().length === 0) {
		return Number('nan')
	}
	return Number(value)
}

/**
 * It's a wildcard validator mainly used for optional parameters.
 * It does nothing and simply returns the value.
 */
// it is unclear, why `null` is needed and why `undefined` doesn't work
export function trueVal<I, O extends I | Undefined | I[]>(): Validator<O | null, NoInfer<O>> {
	return (value: O | null) => (() => value) as Getter<O>
}

/**
 * Validator to mark required parameters. It ensures, for example:
 * string[] | undefined -> string[]
 * number | undefined  -> number
 */
export function requiredVal<I>(): Validator<I | Undefined, NonNullable<NoInfer<I>>> {
	return (value: I | Undefined): Getter<NonNullable<I>> => {
		if (value === undefined || value === null) {
			return undefined
		}
		return () => value
	}
}

/**
 * Returns the n-th element of an array. A negative value returns
 * the element counting from the end of the array.
 */
export function getNthVal<I>(num: number = 0): Validator<I[] | Undefined, NoInfer<I> | undefined> {
	return (value: I[] | Undefined) => {
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

/**
 * Ensures that a string array can be converted to a number array.
 */
export function mapToNumVal<
	const I extends string[] | Undefined,
	const O extends I extends string[] ? number[] : undefined,
>(): Validator<I, NoInfer<O>> {
	return (values: string[] | Undefined): Getter<O> => {
		if (values === undefined || values === null) {
			return (() => undefined) as Getter<O>
		}
		const parsedValues: number[] = []
		for (const value of values) {
			const parsedValue = parseNumber(value)
			if (Number.isNaN(parsedValue)) {
				return undefined
			}
			parsedValues.push(parsedValue)
		}
		return (() => parsedValues) as Getter<O>
	}
}

/**
 * Ensures that a single value can be converted to a number.
 */
export function toNumVal<const I extends string | undefined, O extends Exclude<I, string> | number>(): Validator<
	I | void,
	NoInfer<O>
> {
	return (value: I | void): Getter<O> => {
		if (value === undefined) {
			return (() => undefined) as Getter<O>
		}
		const parsedValue = parseNumber(value)
		if (Number.isNaN(parsedValue)) {
			return undefined
		}
		return (() => parsedValue) as Getter<O>
	}
}

/**
 * Filters the passed values based on the listed options. If `undefined` is
 * included in the option list, it indicates that the passed value is optional.
 */
export function atLeastOneVal<I extends string | number | boolean, const O extends (I | undefined)[]>(
	expectedValues: O,
): Validator<I[] | Undefined, NoInfer<O>> {
	return (values: I[] | Undefined): Getter<O> => {
		if (values === undefined && expectedValues.includes(undefined)) {
			return (() => undefined) as unknown as Getter<O>
		}
		const newValues = (values ?? []).filter(value => expectedValues.includes(value)) as O
		if (newValues.length > 0) {
			return () => newValues
		}
		return undefined
	}
}

/**
 * Ensures that the passed value is one of the listed options.
 */
export function oneOfVal<I extends string | number | boolean, O extends I | undefined>(
	values: O[],
): Validator<I | Undefined, NoInfer<O>> {
	return (value: I | Undefined): Getter<O> => {
		if (values.includes(value as O)) {
			return () => value as O
		}
		return undefined
	}
}

/**
 * Ensures that the passed array has a minimal length.
 */
export function minCountVal<const I extends string | number | boolean>(
	min: number,
): Validator<I[] | Undefined, NoInfer<I>[]> {
	return (value: I[] | Undefined): Getter<I[]> => {
		if (value !== undefined && value !== null && value.length >= min) {
			return () => value
		}
		return undefined
	}
}

/**
 * Allows chaining validators while preserving the types.
 */
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
