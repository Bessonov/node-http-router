import { isMatched, } from './MatchResult.js';
/**
 * Match if at least one matcher matches.
 * For completeness both matcher are executed.
 */
export class OrMatcher {
    constructor(matchers) {
        this.matchers = matchers;
        this.match = this.match.bind(this);
    }
    match(params) {
        const results = this.matchers.map(matcher => matcher === null || matcher === void 0 ? void 0 : matcher.match(params));
        if (results.find(result => result && isMatched(result))) {
            return {
                matched: true,
                result: {
                    // @ts-expect-error
                    or: results,
                },
            };
        }
        return {
            matched: false,
        };
    }
}
export function or(matchers) {
    return new OrMatcher(matchers);
}
//# sourceMappingURL=OrMatcher.js.map