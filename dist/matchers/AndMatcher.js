import { isMatched, } from './MatchResult.js';
/**
 * Match if every matcher matches
 */
export class AndMatcher {
    constructor(matchers) {
        this.matchers = matchers;
        this.match = this.match.bind(this);
    }
    match(params) {
        const results = [];
        for (const matcher of this.matchers) {
            let result;
            if (matcher) {
                result = matcher.match(params);
                if (isMatched(result) === false) {
                    return {
                        matched: false,
                    };
                }
            }
            results.push(result);
        }
        return {
            matched: true,
            result: {
                // @ts-expect-error
                and: results,
            },
        };
    }
}
export function and(matchers) {
    return new AndMatcher(matchers);
}
//# sourceMappingURL=AndMatcher.js.map