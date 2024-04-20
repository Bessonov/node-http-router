import { and, method, RegExpUrlMatcher, } from './index.js';
/**
 * higher order matcher which is combine matching of method
 * with regular expression
 */
export class EndpointMatcher {
    constructor(methods, url) {
        this.match = this.match.bind(this);
        this.matcher = and([
            method(Array.isArray(methods) ? methods : [methods]),
            new RegExpUrlMatcher([url]),
        ]);
    }
    match(params) {
        // @ts-expect-error
        const result = this.matcher.match(params);
        if (result.matched) {
            const [methodResult, urlResult] = result.result.and;
            return {
                matched: true,
                result: {
                    method: methodResult.result.method,
                    match: urlResult.result.match,
                },
            };
        }
        return {
            matched: false,
        };
    }
}
export function endpoint(methods, url) {
    return new EndpointMatcher(methods, url);
}
//# sourceMappingURL=EndpointMatcher.js.map