import Url from 'urlite';
class RegExpPathnameMatcher {
    constructor(urls, config) {
        this.urls = urls;
        this.match = this.match.bind(this);
        this.listConfig = Object.entries(config !== null && config !== void 0 ? config : {});
    }
    match({ req }) {
        var _a, _b, _c, _d, _e;
        // original URL returns '/' if pathname is empty
        const pathname = (_a = Url.parse(req.url).pathname) !== null && _a !== void 0 ? _a : '/';
        urlLoop: for (const url of this.urls) {
            const extractedValues = {};
            let m;
            let matchedUrl;
            let lastIndex = 0;
            // eslint-disable-next-line no-cond-assign
            while ((m = url.exec(pathname)) !== null) {
                matchedUrl = m.input;
                const [wholeMatch, matched] = m;
                extractedValues[0] = ((_b = extractedValues[0]) !== null && _b !== void 0 ? _b : []).concat(wholeMatch);
                if (matched !== undefined) {
                    extractedValues[1] = ((_c = extractedValues[1]) !== null && _c !== void 0 ? _c : []).concat(matched);
                    for (const [key, value] of Object.entries((_d = m.groups) !== null && _d !== void 0 ? _d : {})) {
                        extractedValues[key] = ((_e = extractedValues[key]) !== null && _e !== void 0 ? _e : []).concat(value);
                    }
                }
                /* istanbul ignore else */
                if (url.flags.includes('g') === false && url.flags.includes('y') === false) {
                    // the RegExp is stateless without global and sticky flag.
                    // Therefore, we stop the loop to avoid infinity loop
                    break;
                }
                else if (lastIndex === url.lastIndex) {
                    // avoid inifinity loop with empty match. See the warning in:
                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
                    url.lastIndex = +1;
                }
                lastIndex = url.lastIndex;
            }
            if (matchedUrl === undefined) {
                continue;
            }
            if (this.listConfig.length === 0) {
                return {
                    matched: true,
                    result: {
                        pathname: {
                            url: matchedUrl,
                        },
                    },
                };
            }
            const matchResult = {};
            for (const [key, matcher] of this.listConfig) {
                const params = extractedValues[key];
                const getter = matcher(params);
                if (getter === undefined) {
                    continue urlLoop;
                }
                // @ts-expect-error
                matchResult[key] = getter();
            }
            return {
                matched: true,
                result: {
                    pathname: {
                        url: matchedUrl,
                        params: matchResult,
                    },
                },
            };
        }
        return {
            matched: false,
        };
    }
}
export function regExpPathname(urls, config) {
    return new RegExpPathnameMatcher(urls, config);
}
//# sourceMappingURL=RegExpPathnameMatcher.js.map