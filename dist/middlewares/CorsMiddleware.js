const DEFAULT_ALLOWED_METHODS = [
    'POST',
    'GET',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
];
const DEFAULT_ALLOWED_HEADERS = [
    'X-Requested-With',
    'Access-Control-Allow-Origin',
    'Content-Type',
    'Authorization',
    'Accept',
];
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours
function hasStartedResponse(res) {
    return res.writableEnded || res.headersSent === true;
}
export function CorsMiddleware(callback) {
    return function corsWrapper(handler) {
        return async function corsHandler(params) {
            const { req, res } = params.data;
            if (hasStartedResponse(res)) {
                return undefined;
            }
            const origin = req.headers.origin ?? '';
            const config = await callback(req, origin, params);
            if (hasStartedResponse(res)) {
                return undefined;
            }
            const vary = res.getHeader?.('Vary')?.toString();
            const variesByOrigin = vary?.split(',').some(value => {
                const field = value.trim().toLowerCase();
                return field === '*' || field === 'origin';
            });
            if (!variesByOrigin) {
                res.setHeader('Vary', vary ? `${vary}, Origin` : 'Origin');
            }
            if (!origin) {
                return handler(params);
            }
            const allowedOrigin = config.origins.includes(origin) ? origin : config.origins.find(value => value === '*');
            if (allowedOrigin !== undefined) {
                res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
                if (allowedOrigin !== '*' && (config.allowCredentials ?? true)) {
                    res.setHeader('Access-Control-Allow-Credentials', 'true');
                }
            }
            if (req.method !== 'OPTIONS' || req.headers['access-control-request-method'] === undefined) {
                return handler(params);
            }
            if (allowedOrigin === undefined) {
                res.statusCode = 403;
                res.end();
                return undefined;
            }
            const allowMethods = config.allowMethods ?? DEFAULT_ALLOWED_METHODS;
            const allowHeaders = config.allowHeaders ?? DEFAULT_ALLOWED_HEADERS;
            const maxAge = config.maxAge ?? DEFAULT_MAX_AGE_SECONDS;
            if (allowMethods.length) {
                res.setHeader('Access-Control-Allow-Methods', allowMethods.join(','));
            }
            if (allowHeaders.length) {
                res.setHeader('Access-Control-Allow-Headers', allowHeaders.join(','));
            }
            if (Number.isSafeInteger(maxAge) && maxAge >= 0) {
                res.setHeader('Access-Control-Max-Age', String(maxAge));
            }
            res.statusCode = 200;
            res.end();
            return undefined;
        };
    };
}
//# sourceMappingURL=CorsMiddleware.js.map