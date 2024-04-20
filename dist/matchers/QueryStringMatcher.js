import Url from 'urlite';
class QueryStringMatcher {
    constructor(config) {
        this.match = ({ req }) => {
            var _a;
            // original URL returns '' if search is empty
            const search = (_a = Url.parse(req.url).search) !== null && _a !== void 0 ? _a : '';
            const queryParams = new URLSearchParams(search);
            const queryResult = {};
            for (const [key, matcher] of this.listConfig) {
                const params = queryParams.has(key) ? queryParams.getAll(key) : null;
                const getter = matcher(params);
                if (getter === undefined) {
                    return {
                        matched: false,
                    };
                }
                // @ts-expect-error
                queryResult[key] = getter(params);
            }
            return {
                matched: true,
                result: {
                    query: queryResult,
                },
            };
        };
        this.listConfig = Object.entries(config);
    }
}
export function queryString(config) {
    return new QueryStringMatcher(config);
}
//# sourceMappingURL=QueryStringMatcher.js.map