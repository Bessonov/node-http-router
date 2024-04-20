import Url from 'urlite';
// https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
const escapeRegexRe = /[/\-\\^$*+?.()|[\]{}]/g;
function escapeRegex(string) {
    return string.replace(escapeRegexRe, '\\$&');
}
export class RegExpUrlMatcher {
    constructor(urls) {
        this.urls = urls;
        this.match = this.match.bind(this);
        this.regExps = urls.map(url => {
            if (typeof url === 'string') {
                return new RegExp(escapeRegex(url));
            }
            return url;
        });
    }
    match({ req }) {
        var _a;
        // original URL returns '/' if pathname is empty
        const pathname = (_a = Url.parse(req.url).pathname) !== null && _a !== void 0 ? _a : '/';
        for (const url of this.regExps) {
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