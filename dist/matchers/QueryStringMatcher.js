import Url from 'urlite';
class QueryStringMatcher {
    constructor(config) {
        this.match = ({ req }) => {
            var _a;
            // original URL returns '' if search is empty
            const search = (_a = Url.parse(req.url).search) !== null && _a !== void 0 ? _a : '';
            const queryParams = new URLSearchParams(search);
            const queryResult = {};
            for (const [key, validatorFactory] of this.listConfig) {
                const validator = validatorFactory();
                const params = queryParams.getAll(key);
                if (validator.match(params) === false) {
                    return {
                        matched: false,
                    };
                }
                // @ts-ignore
                queryResult[key] = validator.parse(params);
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