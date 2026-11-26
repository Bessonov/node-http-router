import { createRequest, } from 'node-mocks-http';
import { atLeastOneVal, chain, getNthVal, mapToNumVal, minCountVal, requiredVal, } from '../../validators.js';
import { queryString, } from '../index.js';
const matcher = queryString({
    mustPresent: chain(getNthVal(), requiredVal()),
    isOptional: getNthVal(),
    mustExact: chain(atLeastOneVal(['exactValue1', 'exactValue2']), getNthVal(), requiredVal()),
});
it('not match (mustPresent and mustExact are missing)', () => {
    const result = matcher.match({ req: createRequest() });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('not match (mustPresent is missing)', () => {
    const result = matcher.match({
        req: createRequest({
            url: '/test?mustExact=exactValue1',
        }),
    });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('not match (mustExact is missing)', () => {
    const result = matcher.match({
        req: createRequest({
            url: '/test?mustPresent=foo',
        }),
    });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('match', () => {
    const result = matcher.match({
        req: createRequest({
            url: '/test?mustExact=exactValue1&mustPresent=foo',
        }),
    });
    expect(result).toStrictEqual({
        matched: true,
        result: {
            query: {
                mustPresent: 'foo',
                isOptional: undefined,
                mustExact: 'exactValue1',
            },
        },
    });
});
it('match with optional param', () => {
    const result = matcher.match({
        req: createRequest({
            url: '/test?mustExact=exactValue1&mustPresent=foo&isOptional=bar',
        }),
    });
    expect(result).toStrictEqual({
        matched: true,
        result: {
            query: {
                mustExact: 'exactValue1',
                mustPresent: 'foo',
                isOptional: 'bar',
            },
        },
    });
});
it('match with additional param', () => {
    const result = matcher.match({
        req: createRequest({
            url: '/test?mustExact=exactValue1&mustPresent=foo&additional=bar',
        }),
    });
    expect(result).toStrictEqual({
        matched: true,
        result: {
            query: {
                mustPresent: 'foo',
                isOptional: undefined,
                mustExact: 'exactValue1',
            },
        },
    });
    if (result.matched) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const checkType = result.result.query;
    }
});
it('decoding', () => {
    const result = matcher.match({
        req: createRequest({
            url: '/auth?mustPresent=https%3A%2F%2Fmyhost%3A4520%2Fonboarding&mustExact=exactValue1',
        }),
    });
    expect(result).toStrictEqual({
        matched: true,
        result: {
            query: {
                isOptional: undefined,
                mustExact: 'exactValue1',
                mustPresent: 'https://myhost:4520/onboarding',
            },
        },
    });
});
describe('PHP-style multi-querystring', () => {
    const multiMatcher = queryString({
        'userIds[]': chain(minCountVal(2), mapToNumVal()),
    });
    it(`don't match if absent`, () => {
        const result = multiMatcher.match({
            req: createRequest({
                url: '/test',
            }),
        });
        expect(result).toStrictEqual({
            matched: false,
        });
    });
    it(`don't match if count is less than desired`, () => {
        const result = multiMatcher.match({
            req: createRequest({
                url: '/test?userIds[]=1',
            }),
        });
        expect(result).toStrictEqual({
            matched: false,
        });
    });
    it(`match`, () => {
        const result = multiMatcher.match({
            req: createRequest({
                url: '/test?userIds[]=1&userIds[]=3',
            }),
        });
        expect(result).toStrictEqual({
            matched: true,
            result: {
                query: {
                    'userIds[]': [1, 3],
                },
            },
        });
    });
});
it('ignores query-like text inside a fragment', () => {
    const viewMatcher = queryString({ view: requiredVal() });
    expect(viewMatcher.match({ req: { url: '/books#chapter?view=summary' } })).toStrictEqual({ matched: false });
});
//# sourceMappingURL=QueryStringMatcher.test.js.map