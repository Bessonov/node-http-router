import type { MatchResultAny } from '../matchers/MatchResult';
import type { Handler } from '../Router';
export interface CorsMiddlewareInput {
    headers: {
        origin?: string;
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
export declare function CorsMiddleware<D2, R extends CorsMiddlewareInput = CorsMiddlewareInput>(callback: (req: R, origin: string, params: {
    data: D2;
}) => Promise<CorsMiddlewareCallbackResult>): <T extends MatchResultAny, D extends D2 & {
    req: R;
    res: {
        writableEnded: boolean;
        setHeader: (name: string, value: string) => void;
        statusCode: number;
        end: () => void;
    };
}>(handler: Handler<T, D>) => Handler<T, D>;
export {};
