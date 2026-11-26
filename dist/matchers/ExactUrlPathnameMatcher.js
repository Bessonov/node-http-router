import { getRequestPathname, } from './parseRequestTarget.js';
/**
 * Match exact urls
 */
export class ExactUrlPathnameMatcher {
    constructor(urls) {
        this.urls = urls;
        this.match = this.match.bind(this);
    }
    match({ req }) {
        const pathname = getRequestPathname(req.url);
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