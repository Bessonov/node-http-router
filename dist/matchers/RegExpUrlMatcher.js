/**
 * @deprecated
 */
export class RegExpUrlMatcher {
    constructor(urls) {
        this.urls = urls;
        this.match = this.match.bind(this);
    }
    match({ req }) {
        for (const url of this.urls) {
            const result = url.exec(req.url);
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
//# sourceMappingURL=RegExpUrlMatcher.js.map