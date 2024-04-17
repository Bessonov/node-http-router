import Url from 'urlite';
/**
 * Match query params
 *
 * key is a string and value:
 * true: must be present
 * false: must be absent
 * undefined: optional
 * 'some string': must be exact value
 */
export class ExactQueryMatcher {
    constructor(config) {
        this.match = this.match.bind(this);
        this.listConfig = Object.entries(config);
    }
    match({ req }) {
        var _a;
        // original URL returns '' if search is empty
        const search = (_a = Url.parse(req.url).search) !== null && _a !== void 0 ? _a : '';
        // parse query string into dict
        let params = {};
        if (search !== '') {
            params = search.substring(1).split(/&/).reduce((acc, parts) => {
                const part = parts.split(/=/);
                const [key, value] = part;
                // @ts-ignore
                acc[key] = value;
                return acc;
            }, params);
        }
        // validate query params
        for (const [key, value] of this.listConfig) {
            switch (value) {
                // key must be absent
                case false:
                    if (key in params) {
                        return {
                            matched: false,
                        };
                    }
                    break;
                // key must be present with any value
                case true:
                    if (key in params === false) {
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
                    const paramsValue = params[key];
                    if (!paramsValue || value.includes(paramsValue) === false) {
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
export function exactQuery(config) {
    return new ExactQueryMatcher(config);
}
//# sourceMappingURL=ExactQueryMatcher.js.map