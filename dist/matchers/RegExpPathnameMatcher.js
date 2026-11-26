import { getRequestPathname, } from './parseRequestTarget.js';
class RegExpPathnameMatcher {
    constructor(urls, config) {
        this.match = this.match.bind(this);
        this.listConfig = Object.entries(config ?? {}).map(([key, validator]) => ({
            key,
            validator,
            index: /^(?:0|[1-9]\d*)$/.test(key) ? Number(key) : undefined,
        }));
        this.patterns = urls.map(function copyPattern(url) {
            const flags = url.sticky && !url.global ? `${url.flags}g` : url.flags;
            return new RegExp(url.source, flags);
        });
    }
    match({ req }) {
        const pathname = getRequestPathname(req.url);
        if (this.listConfig.length === 0) {
            for (const pattern of this.patterns) {
                pattern.lastIndex = 0;
                if (pattern.test(pathname)) {
                    return {
                        matched: true,
                        result: { pathname: { url: pathname } },
                    };
                }
            }
            return { matched: false };
        }
        urlLoop: for (const pattern of this.patterns) {
            // matchAll advances after zero-width matches. A stateless pattern only needs one exec.
            const matches = pattern.global ? pathname.matchAll(pattern) : [pattern.exec(pathname)];
            let extractedValues;
            for (const match of matches) {
                if (match === null) {
                    break;
                }
                extractedValues ??= Object.create(null);
                for (const { key, index } of this.listConfig) {
                    const value = index === undefined ? match.groups?.[key] : match.at(index);
                    if (value !== undefined) {
                        extractedValues[key] ??= [];
                        extractedValues[key].push(value);
                    }
                }
            }
            if (extractedValues === undefined) {
                continue;
            }
            const entries = [];
            for (const { key, validator } of this.listConfig) {
                const getter = validator(extractedValues[key]);
                if (getter === undefined) {
                    continue urlLoop;
                }
                entries.push([key, getter()]);
            }
            return {
                matched: true,
                result: {
                    pathname: {
                        url: pathname,
                        params: Object.fromEntries(entries),
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