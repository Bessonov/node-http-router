const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
/**
 * Match methods
 */
export class MethodMatcher {
    constructor(methods) {
        this.methods = methods;
        this.match = this.match.bind(this);
    }
    match({ req }) {
        const { method: httpMethod } = req;
        if (httpMethod && this.methods.indexOf(httpMethod) >= 0) {
            return {
                matched: true,
                result: {
                    method: httpMethod,
                },
            };
        }
        return {
            matched: false,
        };
    }
}
export function method(methods) {
    return new MethodMatcher(methods);
}
//# sourceMappingURL=MethodMatcher.js.map