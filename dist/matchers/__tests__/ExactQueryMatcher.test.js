import { createRequest, } from 'node-mocks-http';
import { exactQuery, } from '..';
const matcher = exactQuery({
    mustPresent: true,
    mustAbsent: false,
    isOptional: undefined,
    mustExact: ['exactValue1', 'exactValue2'],
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
                mustExact: 'exactValue1',
                mustPresent: 'foo',
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
it('not match because of forbidden param', () => {
    const result = matcher.match({
        req: createRequest({
            url: '/test?mustExact=exactValue1&mustPresent=foo&mustAbsent=foo',
        }),
    });
    expect(result).toStrictEqual({
        matched: false,
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
                mustExact: 'exactValue1',
                mustPresent: 'foo',
                additional: 'bar',
            },
        },
    });
    if (result.matched) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const checkType = result.result.query.mustExact;
    }
});
//# sourceMappingURL=ExactQueryMatcher.test.js.map