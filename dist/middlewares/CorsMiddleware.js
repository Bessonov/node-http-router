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
export function CorsMiddleware(callback) {
    return function corsWrapper(handler) {
        return async function corsHandler(params) {
            var _a, _b, _c, _d, _e;
            const { req, res } = params.data;
            // avoid "Cannot set headers after they are sent to the client"
            if (res.writableEnded) {
                // TODO: not sure if handler should be called
                return handler(params);
            }
            const origin = (_a = req.headers.origin) !== null && _a !== void 0 ? _a : '';
            const config = await callback(req, origin, params);
            const allowCredentials = (_b = config.allowCredentials) !== null && _b !== void 0 ? _b : true;
            const allowMethods = (_c = config.allowMethods) !== null && _c !== void 0 ? _c : DEFAULT_ALLOWED_METHODS;
            const allowHeaders = (_d = config.allowHeaders) !== null && _d !== void 0 ? _d : DEFAULT_ALLOWED_HEADERS;
            const maxAge = (_e = config.maxAge) !== null && _e !== void 0 ? _e : DEFAULT_MAX_AGE_SECONDS;
            if (config.origins.includes(origin)) {
                res.setHeader('Access-Control-Allow-Origin', origin);
                res.setHeader('Vary', 'Origin');
                if (allowCredentials) {
                    res.setHeader('Access-Control-Allow-Credentials', 'true');
                }
            }
            if (req.method === 'OPTIONS') {
                if (allowMethods.length) {
                    res.setHeader('Access-Control-Allow-Methods', allowMethods.join(','));
                }
                if (allowHeaders.length) {
                    res.setHeader('Access-Control-Allow-Headers', allowHeaders.join(','));
                }
                if (maxAge) {
                    res.setHeader('Access-Control-Max-Age', String(maxAge));
                }
                // no further processing of preflight requests
                res.statusCode = 200;
                res.end();
                // eslint-disable-next-line consistent-return
                return;
            }
            const result = await handler(params);
            return result;
        };
    };
}
//# sourceMappingURL=CorsMiddleware.js.map