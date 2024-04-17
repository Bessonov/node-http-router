import { createRequest, } from 'node-mocks-http';
import { endpoint, } from '..';
it('not match empty', () => {
    const result = endpoint('GET', /\/test/)
        .match({ req: createRequest() });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('usual usage', () => {
    const matcher = endpoint(['GET', 'POST'], /\/test/);
    // https://github.com/facebook/jest/issues/8475#issuecomment-656629010
    expect(() => {
        expect(matcher.match({
            req: createRequest({
                url: '/test',
            }),
        })).toStrictEqual({
            matched: true,
            result: {
                method: 'GET',
                match: [
                    '/test',
                ],
            },
        });
    }).toThrow('serializes to the same string');
    expect(() => {
        expect(matcher.match({
            req: createRequest({
                method: 'POST',
                url: '/test?query=ignored',
            }),
        })).toStrictEqual({
            matched: true,
            result: {
                method: 'POST',
                match: [
                    '/test',
                ],
            },
        });
    }).toThrow('serializes to the same string');
    expect(matcher.match({
        req: createRequest({
            method: 'OPTIONS',
            url: '/test',
        }),
    })).toStrictEqual({
        matched: false,
    });
});
it('match path', () => {
    const matcher = endpoint('GET', /^\/api\/user\/(?<userId>[^/]+)$/);
    // https://github.com/facebook/jest/issues/8475#issuecomment-656629010
    expect(() => {
        const match = matcher.match({
            req: createRequest({
                url: '/api/user/5',
            }),
        });
        expect(match).toStrictEqual({
            matched: true,
            result: {
                method: 'GET',
                match: [
                    '/api/user/5',
                    '5',
                ],
            },
        });
    }).toThrow('serializes to the same string');
});
//# sourceMappingURL=EndpointMatcher.test.js.map