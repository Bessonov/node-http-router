import { createRequest, } from 'node-mocks-http';
import { exactUrlPathname, } from '../index.js';
it('not match empty', () => {
    const result = exactUrlPathname(['/test'])
        .match({ req: createRequest() });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('not match with postfix', () => {
    const result = exactUrlPathname(['/test'])
        .match({
        req: createRequest({
            url: '/test2',
        }),
    });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('not match prefix', () => {
    const result = exactUrlPathname(['/test'])
        .match({
        req: createRequest({
            url: '/tes',
        }),
    });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('match', () => {
    const result = exactUrlPathname(['/test'])
        .match({
        req: createRequest({
            url: '/test?foo=bar',
        }),
    });
    expect(result).toStrictEqual({
        matched: true,
        result: {
            pathname: '/test',
        },
    });
});
it('match first', () => {
    const result = exactUrlPathname(['/test', '/foo'])
        .match({
        req: createRequest({
            url: '/test',
        }),
    });
    expect(result).toStrictEqual({
        matched: true,
        result: {
            pathname: '/test',
        },
    });
});
it('match second', () => {
    const result = exactUrlPathname(['/test', '/foo'])
        .match({
        req: createRequest({
            url: '/foo',
        }),
    });
    expect(result).toStrictEqual({
        matched: true,
        result: {
            pathname: '/foo',
        },
    });
});
it.each([
    ['https://catalog.example:8443/books?sort=title#results', '/books'],
    ['https://catalog.example', '/'],
    ['https://catalog.example?next=/books', '/'],
    ['//catalog/books?sort=title', '//catalog/books'],
    ['/books/./part%2Fone', '/books/./part%2Fone'],
    ['/books#summary?sort=title', '/books'],
    ['*', '*'],
])('matches the original pathname of %s', (url, pathname) => {
    expect(exactUrlPathname([pathname]).match({ req: { url } })).toStrictEqual({
        matched: true,
        result: { pathname },
    });
});
//# sourceMappingURL=ExactUrlPathnameMatcher.test.js.map