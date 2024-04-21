import { createRequest, } from 'node-mocks-http';
import { chain, getNthVal, requiredVal, toNumVal, } from '../../validators.js';
import { regExpPathname, } from '../index.js';
it('not match', () => {
    const result = regExpPathname([/^\/test$/])
        .match({ req: createRequest() });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('match', () => {
    const result = regExpPathname([/^\/test$/])
        .match({
        req: createRequest({
            url: '/test',
        }),
    });
    expect(result.matched).toBe(true);
    if (result.matched) {
        expect(result.result.pathname.url).toBe('/test');
    }
});
it('match first', () => {
    const result = regExpPathname([/^\/test$/, /^\/test2$/])
        .match({
        req: createRequest({
            url: '/test',
        }),
    });
    expect(result.matched).toBe(true);
    if (result.matched) {
        expect(result.result.pathname.url).toBe('/test');
    }
});
it('match second', () => {
    const result = regExpPathname([/^\/test$/, /^\/test2$/])
        .match({
        req: createRequest({
            url: '/test2',
        }),
    });
    expect(result.matched).toBe(true);
    if (result.matched) {
        expect(result.result.pathname.url).toBe('/test2');
    }
});
it('match group', () => {
    const result = regExpPathname([/^\/group\/(?<groupId>[^/]+)$/], {
        groupId: chain(getNthVal(), requiredVal(), toNumVal()),
    })
        .match({
        req: createRequest({
            url: '/group/123',
        }),
    });
    expect(result.matched).toBe(true);
    if (result.matched) {
        expect(result.result.pathname.url).toBe('/group/123');
        expect(result.result.pathname.params.groupId).toBe(123);
    }
});
it(`url is empty`, () => {
    const result = regExpPathname([/^\/$/])
        .match({
        req: createRequest({
            url: '',
        }),
    });
    expect(result.matched).toBe(true);
    if (result.matched) {
        expect(result.result.pathname.url).toBe('/');
    }
});
it(`query string isn't matched`, () => {
    const result = regExpPathname([/^\/test$/])
        .match({
        req: createRequest({
            url: '/test?query=not-matched',
        }),
    });
    expect(result.matched).toBe(true);
    if (result.matched) {
        expect(result.result.pathname.url).toBe('/test');
    }
});
it(`multiple path parts`, () => {
    const matcher = regExpPathname([/(?:\/shop\/)?(?:(?<category>[^/]+)\/?)+?/y], {
        category: requiredVal(),
    });
    const result = matcher.match({
        req: createRequest({
            url: '/shop/clothes/tops/t-shirts',
        }),
    });
    expect(result.matched).toBe(true);
    if (result.matched) {
        expect(result.result).toStrictEqual({
            pathname: {
                url: '/shop/clothes/tops/t-shirts',
                params: {
                    category: ['clothes', 'tops', 't-shirts'],
                },
            },
        });
    }
});
it(`matched url, but not parameter`, () => {
    expect(regExpPathname([/^\/group\/(?<groupId>[^/]+)?$/], {
        groupId: requiredVal(),
    }).match({
        req: createRequest({
            url: '/group/',
        }),
    }).matched).toBe(false);
});
//# sourceMappingURL=RegExpPathnameMatcher.test.js.map