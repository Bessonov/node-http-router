import type { MatchResultAny } from '../matchers/index.js';
import type { Handler } from '../Router.js';
export interface CorsMiddlewareInput {
    headers: {
        origin?: string;
        'access-control-request-method'?: string | string[];
    };
    method: string;
}
type HttpMethod = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
export interface CorsMiddlewareCallbackResult {
    origins: string[];
    allowMethods?: HttpMethod[];
    allowHeaders?: string[];
    allowCredentials?: boolean;
    maxAge?: number;
}
interface CorsMiddlewareResponse {
    writableEnded: boolean;
    headersSent?: boolean;
    getHeader?: (name: string) => string | number | readonly string[] | undefined;
    setHeader: (name: string, value: string) => void;
    statusCode: number;
    end: () => void;
}
export declare function CorsMiddleware<D2, R extends CorsMiddlewareInput = CorsMiddlewareInput>(callback: (req: R, origin: string, params: {
    data: D2;
}) => Promise<CorsMiddlewareCallbackResult>): <T extends MatchResultAny, D extends D2 & {
    req: R;
    res: CorsMiddlewareResponse;
}>(handler: Handler<T, D>) => Handler<T, D>;
export {};
