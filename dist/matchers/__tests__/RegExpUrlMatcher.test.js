import { createRequest, } from 'node-mocks-http';
import { regExpUrl, } from '..';
it('not match', () => {
    const result = regExpUrl([/^\/test$/])
        .match({ req: createRequest() });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('match', () => {
    const result = regExpUrl([/^\/test$/])
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
    const result = regExpUrl([/^\/test$/, /^\/test2$/])
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
    const result = regExpUrl([/^\/test$/, /^\/test2$/])
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
    const result = regExpUrl([/^\/group\/(?<groupId>[^/]+)$/])
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
it(`url is empty`, () => {
    const result = regExpUrl([/^\/$/])
        .match({
        req: createRequest({
            url: '',
        }),
    });
    expect(result.matched).toBe(true);
    if (result.matched) {
        expect(result.result.match.input).toBe('/');
    }
});
it(`query string isn't matched`, () => {
    const result = regExpUrl([/^\/test$/])
        .match({
        req: createRequest({
            url: '/test?query=not-matched',
        }),
    });
    expect(result.matched).toBe(true);
    if (result.matched) {
        expect(result.result.match.input).toBe('/test');
    }
});
//# sourceMappingURL=RegExpUrlMatcher.test.js.map