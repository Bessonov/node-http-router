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
it('collects matches after an empty match without sharing regex state', () => {
    const expression = /^|(?<word>[a-z]+)/g;
    expression.lastIndex = 3;
    const matcher = regExpPathname([expression], { 0: requiredVal(), word: requiredVal() });
    const data = { req: { url: '/books/fiction' } };
    const expected = {
        matched: true,
        result: {
            pathname: {
                url: '/books/fiction',
                params: { 0: ['', 'books', 'fiction'], word: ['books', 'fiction'] },
            },
        },
    };
    expect(matcher.match(data)).toStrictEqual(expected);
    expect(matcher.match(data)).toStrictEqual(expected);
    expect(expression.lastIndex).toBe(3);
});
it('collects later ordinal and named groups when an optional group is absent', () => {
    const matcher = regExpPathname([/^\/(draft-)?(?<title>[a-z]+)$/], {
        2: requiredVal(),
        title: requiredVal(),
    });
    expect(matcher.match({ req: { url: '/books' } })).toStrictEqual({
        matched: true,
        result: { pathname: { url: '/books', params: { 2: ['books'], title: ['books'] } } },
    });
});
it('treats an unmatched named group as absent for validation', () => {
    const matcher = regExpPathname([/^\/(books)(?:\/(?<edition>[a-z]+))?$/], {
        edition: requiredVal(),
    });
    expect(matcher.match({ req: { url: '/books' } })).toStrictEqual({ matched: false });
});
it('tries the next regex when a pattern with validators does not match', () => {
    const matcher = regExpPathname([/^\/magazines\/(?<title>[^/]+)$/, /^\/books\/(?<title>[^/]+)$/], {
        title: requiredVal(),
    });
    expect(matcher.match({ req: { url: '/books/fiction' } })).toStrictEqual({
        matched: true,
        result: { pathname: { url: '/books/fiction', params: { title: ['fiction'] } } },
    });
});
it.each(['g', 'y'])('starts each match without validators at the beginning with the %s flag', flag => {
    const expression = new RegExp('^/books', flag);
    expression.lastIndex = 3;
    const matcher = regExpPathname([expression]);
    const data = { req: { url: '/books' } };
    expect(matcher.match(data).matched).toBe(true);
    expect(matcher.match(data).matched).toBe(true);
    expect(expression.lastIndex).toBe(3);
});
//# sourceMappingURL=RegExpPathnameMatcher.test.js.map