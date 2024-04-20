export interface Validator<I, O> {
    (): {
        match(value: I): boolean;
        parse(value: I): O;
    };
}
export declare function trueVal<I>(): Validator<I[], NoInfer<I>[]>;
export declare function requiredVal<I>(): Validator<I | void | undefined | null, NonNullable<NoInfer<I>>>;
export declare function getNthVal<I>(num?: number): Validator<I[], NoInfer<I> | undefined>;
export declare function mapToNumVal<I extends string[]>(): Validator<I, number[]>;
export declare function oneOfVal<const I extends string | number | boolean>(values: I[]): Validator<I, I>;
export declare function atLeastOneVal<const I extends string | number | boolean>(expectedValues: I[]): Validator<I[], I[]>;
export declare function minCountVal<const I extends string | number | boolean>(min: number): Validator<I[], NoInfer<I>[]>;
export declare function toNumVal<I extends string>(): Validator<I, number>;
export declare function chain<I, O1, O2, O3, O>(val1: Validator<I, O1>, val2: Validator<O1, O2>, val3: Validator<O2, O3>, val4: Validator<O3, O>): Validator<I, O>;
export declare function chain<I, O1, O2, O>(val1: Validator<I, O1>, val2: Validator<O1, O2>, val3: Validator<O2, O>): Validator<I, O>;
export declare function chain<I, O1, O>(val1: Validator<I, O1>, val2: Validator<O1, O>): Validator<I, O>;
export declare function chain<I, O>(val1: Validator<I, O>): Validator<I, O>;
