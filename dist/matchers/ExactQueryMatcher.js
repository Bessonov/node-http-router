import { getRequestSearch, } from './parseRequestTarget.js';
/**
 * Match query params
 *
 * key is a string and value:
 * true: must be present
 * false: must be absent
 * undefined: optional
 * string[]: must be one of these exact values
 * @deprecated Use `queryString` with validators to match query parameters.
 */
export class ExactQueryMatcher {
    constructor(config) {
        this.match = this.match.bind(this);
        this.listConfig = Object.entries(config);
    }
    match({ req }) {
        const search = getRequestSearch(req.url);
        const entries = [];
        for (const part of search.slice(1).split('&')) {
            if (part === '') {
                continue;
            }
            const separator = part.indexOf('=');
            if (separator === -1) {
                entries.push([part, '']);
            }
            else {
                entries.push([part.slice(0, separator), part.slice(separator + 1)]);
            }
        }
        const params = Object.fromEntries(entries);
        // validate query params
        for (const [key, value] of this.listConfig) {
            switch (value) {
                // key must be absent
                case false:
                    if (Object.hasOwn(params, key)) {
                        return {
                            matched: false,
                        };
                    }
                    break;
                // key must be present with any value
                case true:
                    if (!Object.hasOwn(params, key)) {
                        return {
                            matched: false,
                        };
                    }
                    break;
                // don't care about optional keys
                case undefined:
                    break;
                // assume string[] and therefore exact key and value
                default: {
                    const paramsValue = Object.hasOwn(params, key) ? params[key] : undefined;
                    if (paramsValue === undefined || !value.includes(paramsValue)) {
                        return {
                            matched: false,
                        };
                    }
                }
            }
        }
        // everything is fine
        return {
            matched: true,
            result: {
                query: params,
            },
        };
    }
}
/**
 * @deprecated Use `queryString` with validators to match query parameters.
 */
export function exactQuery(config) {
    return new ExactQueryMatcher(config);
}
//# sourceMappingURL=ExactQueryMatcher.js.map