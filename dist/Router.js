import { isMatched, } from './matchers/index.js';
export class Router {
    constructor(defaultHandler) {
        this.defaultHandler = defaultHandler;
        this.routes = [];
        this.addRoute = this.addRoute.bind(this);
        this.exec = this.exec.bind(this);
    }
    addRoute(route) {
        this.routes.push(route);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exec(params) {
        for (const route of this.routes) {
            const match = route.matcher.match(params);
            if (isMatched(match)) {
                return route.handler({
                    match,
                    data: params,
                });
            }
        }
        return this.defaultHandler?.({
            match: { matched: true, result: undefined },
            data: params,
        });
    }
}
//# sourceMappingURL=Router.js.map