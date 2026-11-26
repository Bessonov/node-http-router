import { and, method, queryString, regExpPathname, } from './index.js';
// https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
const escapeRegexRe = /[/\-\\^$*+?.()|[\]{}]/g;
function escapeRegex(string) {
    return string.replace(escapeRegexRe, '\\$&');
}
/**
 * higher order matcher which is combine matching of method
 * with regular expression
 */
export class EndpointMatcher {
    constructor(methods, urls, params) {
        this.match = this.match.bind(this);
        const regExpUrls = (Array.isArray(urls) ? urls : [urls])
            .map(url => {
            if (typeof url === 'string') {
                return new RegExp(`^${escapeRegex(url)}$`);
            }
            return url;
        });
        // @ts-expect-error
        this.matcher = and([
            method(Array.isArray(methods) ? methods : [methods]),
            regExpPathname(regExpUrls, params?.url),
            ...params?.query ? [queryString(params.query)] : [undefined],
        ]);
    }
    match(params) {
        // @ts-expect-error
        const result = this.matcher.match(params);
        if (result.matched) {
            const [methodResult, urlResult, queryResult] = result.result.and;
            return {
                matched: true,
                result: {
                    method: methodResult.result.method,
                    pathname: urlResult.result.pathname,
                    ...queryResult ? { query: queryResult.result.query } : {},
                },
            };
        }
        return {
            matched: false,
        };
    }
}
export function endpoint(...args) {
    return new EndpointMatcher(...args);
}
//# sourceMappingURL=EndpointMatcher.js.map