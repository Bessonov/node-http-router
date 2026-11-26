export type MatchedResult<M> = {
    matched: true;
    result: M;
};
export type UnmatchedResult = {
    matched: false;
};
export type MatchResult<R> = UnmatchedResult | MatchedResult<R>;
export type MatchResultAny = MatchResult<any>;
/**
 * reperesent matcher result which is matched
 */
export type Matched<MR extends MatchResultAny> = Extract<MR, MatchedResult<any>>;
/**
 * check for matched result
 */
export declare function isMatched<MR extends MatchResultAny>(matchResult: MR): matchResult is Matched<MR>;
