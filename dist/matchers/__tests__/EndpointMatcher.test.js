import { createRequest, } from 'node-mocks-http';
import { atLeastOneVal, chain, getNthVal, requiredVal, toNumVal, } from '../../validators.js';
import { endpoint, } from '../index.js';
it('not match empty', () => {
    const result = endpoint('GET', /^\/test$/)
        .match({ req: createRequest() });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('usual usage', () => {
    const matcher = endpoint(['GET', 'POST'], [/^\/test$/, '/api']);
    // https://github.com/facebook/jest/issues/8475#issuecomment-656629010
    expect(matcher.match({
        req: createRequest({
            url: '/test',
        }),
    })).toStrictEqual({
        matched: true,
        result: {
            method: 'GET',
            pathname: {
                url: '/test',
            },
        },
    });
    expect(matcher.match({
        req: createRequest({
            method: 'POST',
            url: '/test?query=ignored',
        }),
    })).toStrictEqual({
        matched: true,
        result: {
            method: 'POST',
            pathname: {
                url: '/test',
            },
        },
    });
    expect(matcher.match({
        req: createRequest({
            url: '/api',
        }),
    })).toStrictEqual({
        matched: true,
        result: {
            method: 'GET',
            pathname: {
                url: '/api',
            },
        },
    });
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
    const matcher = endpoint('GET', /^\/api\/user\/(?<userId>[^/]+)$/, {
        url: {
            userId: chain(getNthVal(), requiredVal(), toNumVal()),
        },
    });
    const match = matcher.match({
        req: createRequest({
            url: '/api/user/5',
        }),
    });
    expect(match).toStrictEqual({
        matched: true,
        result: {
            method: 'GET',
            pathname: {
                url: '/api/user/5',
                params: {
                    userId: 5,
                },
            },
        },
    });
});
it('usage with QueryStringMatcher', () => {
    const matcher = endpoint('GET', /^\/api\/user\/(?<userId>[^/]+)$/, {
        url: {
            userId: chain(getNthVal(), requiredVal(), toNumVal()),
        },
        query: {
            // profile is optional
            profile: chain(atLeastOneVal([undefined, 'short', 'full']), getNthVal()),
        },
    });
    expect(matcher.match({
        req: createRequest({
            url: '/api/user/5?profile=full',
        }),
    })).toStrictEqual({
        matched: true,
        result: {
            method: 'GET',
            pathname: {
                url: '/api/user/5',
                params: {
                    userId: 5,
                },
            },
            query: {
                profile: 'full',
            },
        },
    });
    expect(matcher.match({
        req: createRequest({
            url: '/api/user/5',
        }),
    })).toStrictEqual({
        matched: true,
        result: {
            method: 'GET',
            pathname: {
                url: '/api/user/5',
                params: {
                    userId: 5,
                },
            },
            query: {
                profile: undefined,
            },
        },
    });
});
//# sourceMappingURL=EndpointMatcher.test.js.map