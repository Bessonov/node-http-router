import type { MatchResultAny } from '../matchers/MatchResult';
import type { Handler } from '../Router';
export type MiddlewareData<T extends (handler: Handler<MatchResultAny, any>) => Handler<MatchResultAny, any>> = Parameters<Parameters<T>[0]>[0]['data'];
