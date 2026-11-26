import { getRequestSearch, } from './parseRequestTarget.js';
class QueryStringMatcher {
    constructor(config) {
        this.match = this.match.bind(this);
        this.listConfig = Object.entries(config);
    }
    match({ req }) {
        const search = getRequestSearch(req.url);
        const queryParams = search === '' ? undefined : new URLSearchParams(search);
        const entries = [];
        for (const [key, matcher] of this.listConfig) {
            const values = queryParams?.getAll(key);
            const params = values?.length ? values : undefined;
            const getter = matcher(params);
            if (getter === undefined) {
                return {
                    matched: false,
                };
            }
            const getValue = getter;
            entries.push([key, getValue(params)]);
        }
        return {
            matched: true,
            result: {
                query: Object.fromEntries(entries),
            },
        };
    }
}
export function queryString(config) {
    return new QueryStringMatcher(config);
}
//# sourceMappingURL=QueryStringMatcher.js.map