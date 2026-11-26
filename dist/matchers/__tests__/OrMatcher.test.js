import { createRequest, } from 'node-mocks-http';
import { exactUrlPathname, method, or, } from '../index.js';
it('none match', () => {
    const result = or([
        method(['DELETE']),
        method(['POST']),
    ])
        .match({ req: createRequest() });
    expect(result).toStrictEqual({
        matched: false,
    });
});
it('first match, second not', () => {
    const result = or([
        method(['DELETE']),
        method(['POST']),
    ]).match({ req: createRequest({ method: 'DELETE' }) });
    expect(result).toStrictEqual({
        matched: true,
        result: {
            or: [
                {
                    matched: true,
                    result: {
                        method: 'DELETE',
                    },
                },
                {
                    matched: false,
                },
            ],
        },
    });
});
it('first not match, but second', () => {
    const req = createRequest({
        method: 'POST',
    });
    const result = or([
        method(['DELETE']),
        method(['POST']),
        undefined,
    ]).match({ req });
    expect(result).toStrictEqual({
        matched: true,
        result: {
            or: [
                {
                    matched: false,
                },
                {
                    matched: true,
                    result: {
                        method: 'POST',
                    },
                },
                undefined,
            ],
        },
    });
});
it('both match', () => {
    const req = createRequest({
        url: '/test',
    });
    const result = or([
        method(['GET']),
        exactUrlPathname(['/test']),
    ]).match({ req });
    expect(result).toStrictEqual({
        matched: true,
        result: {
            or: [
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
//# sourceMappingURL=OrMatcher.test.js.map