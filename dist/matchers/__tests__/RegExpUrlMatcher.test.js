import { createRequest, } from 'node-mocks-http';
import { RegExpUrlMatcher, } from '../RegExpUrlMatcher.js';
it('not match', () => {
    const result = new RegExpUrlMatcher([/^\/test$/])
        .match({ req: createRequest() });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('match', () => {
    const result = new RegExpUrlMatcher([/^\/test$/])
        .match({
        req: createRequest({
            url: '/test',
        }),
    });
    expect(result.matched).toBe(true);
    if (result.matched) {
        expect(result.result.match.input).toBe('/test');
    }
});
it('match first', () => {
    const result = new RegExpUrlMatcher([/^\/test$/, /^\/test2$/])
        .match({
        req: createRequest({
            url: '/test',
        }),
    });
    expect(result.matched).toBe(true);
    if (result.matched) {
        expect(result.result.match.input).toBe('/test');
    }
});
it('match second', () => {
    const result = new RegExpUrlMatcher([/^\/test$/, /^\/test2$/])
        .match({
        req: createRequest({
            url: '/test2',
        }),
    });
    expect(result.matched).toBe(true);
    if (result.matched) {
        expect(result.result.match.input).toBe('/test2');
    }
});
it('match group', () => {
    const result = new RegExpUrlMatcher([/^\/group\/(?<groupId>[^/]+)$/])
        .match({
        req: createRequest({
            url: '/group/123',
        }),
    });
    expect(result.matched).toBe(true);
    if (result.matched) {
        expect(result.result.match.input).toBe('/group/123');
        expect(result.result.match.groups.groupId).toBe('123');
    }
});
//# sourceMappingURL=RegExpUrlMatcher.test.js.map