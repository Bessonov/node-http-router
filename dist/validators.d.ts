type Getter<O> = (() => O) | undefined;
export interface Validator<I, O> {
    (value: I): Getter<O>;
}
export declare function trueVal<I>(): Validator<I[], NoInfer<I>[]>;
export declare function requiredVal<I>(): Validator<I | undefined | null | void, NonNullable<NoInfer<I>>>;
export declare function getNthVal<I>(num?: number): Validator<I[], NoInfer<I> | undefined>;
export declare function mapToNumVal<I extends string[]>(): Validator<I, number[]>;
export declare function oneOfVal<const I extends string | number | boolean>(values: I[]): Validator<I, I>;
export declare function atLeastOneVal<I extends string | number | boolean, const O extends I>(expectedValues: O[]): Validator<I[], NoInfer<O>[]>;
export declare function minCountVal<const I extends string | number | boolean>(min: number): Validator<I[], NoInfer<I>[]>;
export declare function toNumVal<I extends string>(): Validator<I, number>;
export declare function chain<I, O1, O2, O3, O4, O>(val1: Validator<I, O1>, val2: Validator<O1, O2>, val3: Validator<O2, O3>, val4: Validator<O3, O4>, val5: Validator<O4, O>): Validator<I, O>;
export declare function chain<I, O1, O2, O3, O>(val1: Validator<I, O1>, val2: Validator<O1, O2>, val3: Validator<O2, O3>, val4: Validator<O3, O>): Validator<I, O>;
export declare function chain<I, O1, O2, O>(val1: Validator<I, O1>, val2: Validator<O1, O2>, val3: Validator<O2, O>): Validator<I, O>;
export declare function chain<I, O1, O>(val1: Validator<I, O1>, val2: Validator<O1, O>): Validator<I, O>;
export declare function chain<I, O>(val1: Validator<I, O>): Validator<I, O>;
export {};
