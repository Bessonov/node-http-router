type Any = any;
export type AnyValidator = Validator<string[] | undefined, Any>;
export type Getter<O> = (() => O) | undefined;
export type Undefined = undefined | null | void;
export interface Validator<I, O> {
    (value: I): Getter<O>;
}
/**
 * It's a wildcard validator mainly used for optional parameters.
 * It does nothing and simply returns the value.
 */
export declare function trueVal<I, O extends I | Undefined | I[]>(): Validator<O | null, NoInfer<O>>;
/**
 * Validator to mark required parameters. It ensures, for example:
 * string[] | undefined -> string[]
 * number | undefined  -> number
 */
export declare function requiredVal<I>(): Validator<I | Undefined, NonNullable<NoInfer<I>>>;
/**
 * Returns the n-th element of an array. A negative value returns
 * the element counting from the end of the array.
 */
export declare function getNthVal<I>(num?: number): Validator<I[] | Undefined, NoInfer<I> | undefined>;
/**
 * Ensures that a string array can be converted to a number array.
 */
export declare function mapToNumVal<I extends string[]>(): Validator<I | Undefined, number[]>;
/**
 * Ensures that a single value can be converted to a number.
 */
export declare function toNumVal<I extends string>(): Validator<I, number>;
/**
 * Filters the passed values based on the listed options. If `undefined` is
 * included in the option list, it indicates that the passed value is optional.
 */
export declare function atLeastOneVal<I extends string | number | boolean, const O extends (I | undefined)[]>(expectedValues: O): Validator<I[] | Undefined, NoInfer<O>>;
/**
 * Ensures that the passed value is one of the listed options.
 */
export declare function oneOfVal<I extends string | number | boolean, const O extends I>(values: O[]): Validator<I | Undefined, NoInfer<O>>;
/**
 * Ensures that the passed array has a minimal length.
 */
export declare function minCountVal<const I extends string | number | boolean>(min: number): Validator<I[] | Undefined, NoInfer<I>[]>;
/**
 * Allows chaining validators while preserving the types.
 */
export declare function chain<I, O1, O2, O3, O4, O>(val1: Validator<I, O1>, val2: Validator<O1, O2>, val3: Validator<O2, O3>, val4: Validator<O3, O4>, val5: Validator<O4, O>): Validator<I, O>;
export declare function chain<I, O1, O2, O3, O>(val1: Validator<I, O1>, val2: Validator<O1, O2>, val3: Validator<O2, O3>, val4: Validator<O3, O>): Validator<I, O>;
export declare function chain<I, O1, O2, O>(val1: Validator<I, O1>, val2: Validator<O1, O2>, val3: Validator<O2, O>): Validator<I, O>;
export declare function chain<I, O1, O>(val1: Validator<I, O1>, val2: Validator<O1, O>): Validator<I, O>;
export declare function chain<I, O>(val1: Validator<I, O>): Validator<I, O>;
export {};
