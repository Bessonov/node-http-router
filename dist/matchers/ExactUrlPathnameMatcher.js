import Url from 'urlite';
/**
 * Match exact urls
 */
export class ExactUrlPathnameMatcher {
    constructor(urls) {
        this.urls = urls;
        this.match = this.match.bind(this);
    }
    match({ req }) {
        var _a;
        /* istanbul ignore else */
        // original URL returns '/' if pathname is empty
        const pathname = (_a = Url.parse(req.url).pathname) !== null && _a !== void 0 ? _a : '/';
        if (this.urls.indexOf(pathname) >= 0) {
            return {
                matched: true,
                result: {
                    pathname,
                },
            };
        }
        return {
            matched: false,
        };
    }
}
export function exactUrlPathname(urls) {
    return new ExactUrlPathnameMatcher(urls);
}
//# sourceMappingURL=ExactUrlPathnameMatcher.js.map