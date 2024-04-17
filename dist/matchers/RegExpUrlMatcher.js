import Url from 'urlite';
export class RegExpUrlMatcher {
    constructor(urls) {
        this.urls = urls;
        this.match = this.match.bind(this);
    }
    match({ req }) {
        var _a;
        // original URL returns '/' if pathname is empty
        const pathname = (_a = Url.parse(req.url).pathname) !== null && _a !== void 0 ? _a : '/';
        for (const url of this.urls) {
            const result = url.exec(pathname);
            if (result !== null) {
                return {
                    matched: true,
                    result: {
                        match: result,
                    },
                };
            }
        }
        return {
            matched: false,
        };
    }
}
export function regExpUrl(urls) {
    return new RegExpUrlMatcher(urls);
}
//# sourceMappingURL=RegExpUrlMatcher.js.map