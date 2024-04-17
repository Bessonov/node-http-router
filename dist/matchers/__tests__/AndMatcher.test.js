import { createRequest, } from 'node-mocks-http';
import { BooleanMatcher, ExactUrlPathnameMatcher, MethodMatcher, and, } from '..';
it('none match', () => {
    const result = and([
        new MethodMatcher(['POST']),
        new ExactUrlPathnameMatcher(['/test']),
    ]).match({ req: createRequest() });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('first match, second not', () => {
    const result = and([
        new MethodMatcher(['GET']),
        new ExactUrlPathnameMatcher(['/test']),
    ]).match({ req: createRequest() });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('first not match, but second', () => {
    const req = createRequest({
        method: 'POST',
        url: '/test',
    });
    const result = and([
        new MethodMatcher(['GET']),
        new ExactUrlPathnameMatcher(['/test']),
    ]).match({ req });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('both match', () => {
    const req = createRequest({
        url: '/test',
    });
    const result = and([
        new MethodMatcher(['GET']),
        new ExactUrlPathnameMatcher(['/test']),
    ]).match({ req });
    expect(result).toStrictEqual({
        matched: true,
        result: {
            and: [
                {
                    matched: true,
                    result: {
                        method: 'GET',
                    },
                },
                {
                    matched: true,
                    result: {
                        pathname: '/test',
                    },
                },
            ],
        },
    });
});
it('three not a match', () => {
    const req = createRequest({
        url: '/test',
    });
    const result = and([
        new MethodMatcher(['GET']),
        new ExactUrlPathnameMatcher(['/test']),
        new BooleanMatcher(false),
    ]).match({ req });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('three match', () => {
    const req = createRequest({
        url: '/test',
    });
    const result = and([
        new MethodMatcher(['GET']),
        new ExactUrlPathnameMatcher(['/test']),
        new BooleanMatcher(true),
    ]).match({ req });
    expect(result).toStrictEqual({
        matched: true,
        result: {
            and: [
                {
                    matched: true,
                    result: {
                        method: 'GET',
                    },
                },
                {
                    matched: true,
                    result: {
                        pathname: '/test',
                    },
                },
                {
                    matched: true,
                    result: true,
                },
            ],
        },
    });
});
//# sourceMappingURL=AndMatcher.test.js.map