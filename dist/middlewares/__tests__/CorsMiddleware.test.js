import { jest, } from '@jest/globals';
import { createRequest, createResponse, } from 'node-mocks-http';
import { CorsMiddleware, } from '../CorsMiddleware.js';
const allowedOrigin = 'https://app.example';
const preflightHeaders = {
    origin: allowedOrigin,
    'access-control-request-method': 'POST',
};
function requestParams(method, headers = {}) {
    return {
        data: { req: createRequest({ method, headers }), res: createResponse() },
        match: { matched: true, result: undefined },
    };
}
const innerHandler = jest.fn(() => 'handled');
const handler = CorsMiddleware(async () => ({ origins: [allowedOrigin] }))(innerHandler);
beforeEach(() => {
    innerHandler.mockClear();
});
it('grants an allowed origin access to the handler response', async () => {
    const params = requestParams('GET', { origin: allowedOrigin });
    expect(await handler(params)).toBe('handled');
    expect(innerHandler).toHaveBeenCalledTimes(1);
    expect(params.data.res.getHeader('Access-Control-Allow-Origin')).toBe(allowedOrigin);
    expect(params.data.res.getHeader('Access-Control-Allow-Credentials')).toBe('true');
    expect(params.data.res.getHeader('Access-Control-Allow-Methods')).toBeUndefined();
    expect(params.data.res.getHeader('Vary')).toBe('Origin');
});
it('ends an allowed preflight with the configured defaults', async () => {
    const params = requestParams('OPTIONS', preflightHeaders);
    await handler(params);
    const { res } = params.data;
    expect(innerHandler).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.writableEnded).toBe(true);
    expect(res.getHeader('Access-Control-Allow-Origin')).toBe(allowedOrigin);
    expect(res.getHeader('Access-Control-Allow-Methods')).toBe('POST,GET,PUT,PATCH,DELETE,OPTIONS');
    expect(res.getHeader('Access-Control-Allow-Credentials')).toBe('true');
    expect(res.getHeader('Access-Control-Max-Age')).toBe('86400');
});
it('passes OPTIONS without a requested method to the handler', async () => {
    const params = requestParams('OPTIONS', { origin: allowedOrigin });
    expect(await handler(params)).toBe('handled');
    expect(params.data.res.writableEnded).toBe(false);
    expect(params.data.res.getHeader('Access-Control-Allow-Methods')).toBeUndefined();
});
it('passes OPTIONS without an origin to the handler', async () => {
    const params = requestParams('OPTIONS', { 'access-control-request-method': 'POST' });
    expect(await handler(params)).toBe('handled');
    expect(params.data.res.getHeader('Access-Control-Allow-Origin')).toBeUndefined();
    expect(params.data.res.getHeader('Access-Control-Allow-Methods')).toBeUndefined();
    expect(params.data.res.getHeader('Vary')).toBe('Origin');
});
it('denies a preflight from an unlisted origin', async () => {
    const params = requestParams('OPTIONS', { ...preflightHeaders, origin: 'https://visitor.example' });
    await handler(params);
    const { res } = params.data;
    expect(innerHandler).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.writableEnded).toBe(true);
    expect(res.getHeader('Access-Control-Allow-Origin')).toBeUndefined();
    expect(res.getHeader('Access-Control-Allow-Methods')).toBeUndefined();
    expect(res.getHeader('Vary')).toBe('Origin');
});
it('uses a wildcard for public requests and credentials for the explicitly listed origin', async () => {
    const wildcardHandler = CorsMiddleware(async () => ({
        origins: ['*', allowedOrigin],
        allowCredentials: true,
    }))(innerHandler);
    const publicRequest = requestParams('OPTIONS', { ...preflightHeaders, origin: 'https://visitor.example' });
    await wildcardHandler(publicRequest);
    expect(publicRequest.data.res.getHeader('Access-Control-Allow-Origin')).toBe('*');
    expect(publicRequest.data.res.getHeader('Access-Control-Allow-Credentials')).toBeUndefined();
    const trustedRequest = requestParams('GET', { origin: allowedOrigin });
    await wildcardHandler(trustedRequest);
    expect(trustedRequest.data.res.getHeader('Access-Control-Allow-Origin')).toBe(allowedOrigin);
    expect(trustedRequest.data.res.getHeader('Access-Control-Allow-Credentials')).toBe('true');
});
it.each([
    ['Accept-Encoding', 'Accept-Encoding, Origin'],
    [['Accept-Language', 'Accept-Encoding'], 'Accept-Language,Accept-Encoding, Origin'],
    ['Accept-Encoding, origin', 'Accept-Encoding, origin'],
    ['*', '*'],
])('preserves the existing Vary header %s', async (existing, expected) => {
    const params = requestParams('GET', { origin: 'https://visitor.example' });
    const { res } = params.data;
    res.setHeader('Vary', existing);
    await handler(params);
    expect(res.getHeader('Vary')).toEqual(expected);
    expect(res.getHeader('Access-Control-Allow-Origin')).toBeUndefined();
    expect(innerHandler).toHaveBeenCalledTimes(1);
});
it('supports responses without a header getter', async () => {
    const { data: { req }, match } = requestParams('GET', { origin: allowedOrigin });
    const res = { setHeader: jest.fn(), writableEnded: false, statusCode: 200, end: jest.fn() };
    await handler({ data: { req, res }, match });
    expect(res.setHeader).toHaveBeenCalledWith('Vary', 'Origin');
});
it('skips the handler for an ended response', async () => {
    const params = requestParams('GET', { origin: allowedOrigin });
    params.data.res.end();
    expect(await handler(params)).toBeUndefined();
    expect(innerHandler).not.toHaveBeenCalled();
    expect(params.data.res.getHeader('Vary')).toBeUndefined();
});
it('skips the handler if the response ends while awaiting the policy', async () => {
    const params = requestParams('GET', { origin: allowedOrigin });
    const result = handler(params);
    params.data.res.end();
    expect(await result).toBeUndefined();
    expect(innerHandler).not.toHaveBeenCalled();
    expect(params.data.res.getHeader('Vary')).toBeUndefined();
});
it('skips the policy and handler when headers have already been sent', async () => {
    const params = requestParams('GET', { origin: allowedOrigin });
    const { res } = params.data;
    const policy = jest.fn(async () => ({ origins: [allowedOrigin] }));
    const guardedHandler = CorsMiddleware(policy)(innerHandler);
    res.writeHead(200);
    expect(await guardedHandler(params)).toBeUndefined();
    expect(policy).not.toHaveBeenCalled();
    expect(innerHandler).not.toHaveBeenCalled();
    expect(res.writableEnded).toBe(false);
    expect(res.getHeader('Vary')).toBeUndefined();
});
it('skips the handler if headers are sent during the policy callback', async () => {
    const params = requestParams('GET', { origin: allowedOrigin });
    const { res } = params.data;
    const delayedHandler = CorsMiddleware(async () => {
        res.writeHead(200);
        return { origins: [allowedOrigin] };
    })(innerHandler);
    expect(await delayedHandler(params)).toBeUndefined();
    expect(innerHandler).not.toHaveBeenCalled();
    expect(res.headersSent).toBe(true);
    expect(res.writableEnded).toBe(false);
    expect(res.getHeader('Access-Control-Allow-Origin')).toBeUndefined();
});
it('honors custom preflight allowances', async () => {
    const customHandler = CorsMiddleware(async () => ({
        origins: [allowedOrigin],
        allowMethods: ['POST', 'DELETE'],
        allowHeaders: ['Authorization'],
        allowCredentials: false,
        maxAge: 360,
    }))(innerHandler);
    const params = requestParams('OPTIONS', preflightHeaders);
    await customHandler(params);
    const { res } = params.data;
    expect(innerHandler).not.toHaveBeenCalled();
    expect(res.getHeader('Access-Control-Allow-Methods')).toBe('POST,DELETE');
    expect(res.getHeader('Access-Control-Allow-Headers')).toBe('Authorization');
    expect(res.getHeader('Access-Control-Allow-Credentials')).toBeUndefined();
    expect(res.getHeader('Access-Control-Max-Age')).toBe('360');
});
it.each([0, -1, 1.5])('handles max age %s with empty preflight allowances', async (maxAge) => {
    const customHandler = CorsMiddleware(async () => ({
        origins: [allowedOrigin],
        allowMethods: [],
        allowHeaders: [],
        maxAge,
    }))(innerHandler);
    const params = requestParams('OPTIONS', preflightHeaders);
    await customHandler(params);
    const { res } = params.data;
    expect(innerHandler).not.toHaveBeenCalled();
    expect(res.getHeader('Access-Control-Allow-Methods')).toBeUndefined();
    expect(res.getHeader('Access-Control-Allow-Headers')).toBeUndefined();
    expect(res.getHeader('Access-Control-Max-Age')).toBe(maxAge === 0 ? '0' : undefined);
});
//# sourceMappingURL=CorsMiddleware.test.js.map