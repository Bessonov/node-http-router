import { createRequest, } from 'node-mocks-http';
import { method, } from '../MethodMatcher';
it('not match', () => {
    const result = method(['POST'])
        .match({ req: createRequest() });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('match GET', () => {
    const result = method(['GET'])
        .match({
        req: createRequest({
            url: '/test',
        }),
    });
    expect(result).toStrictEqual({
        matched: true,
        result: {
            method: 'GET',
        },
    });
});
it('match first', () => {
    const result = method(['POST', 'GET'])
        .match({
        req: createRequest({
            method: 'POST',
        }),
    });
    expect(result).toStrictEqual({
        matched: true,
        result: {
            method: 'POST',
        },
    });
});
it('match second', () => {
    const result = method(['POST', 'GET'])
        .match({
        req: createRequest({
            method: 'GET',
        }),
    });
    expect(result).toStrictEqual({
        matched: true,
        result: {
            method: 'GET',
        },
    });
});
//# sourceMappingURL=MethodMatcher.test.js.map