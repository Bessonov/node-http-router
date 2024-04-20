import { createRequest, createResponse, } from 'node-mocks-http';
import { compile, pathToRegexp, } from 'path-to-regexp';
import { and, bool, endpoint, exactUrlPathname, method, regExpUrl, } from '../matchers/index.js';
import { NodeHttpRouter, } from '../node/NodeHttpRouter.js';
import { Router, } from '../Router.js';
let router;
beforeEach(() => {
    router = new Router();
});
it('nothing matched', () => {
    expect(router.exec({ req: createRequest() })).toBe(undefined);
});
it('match not found route if no routes specified', () => {
    router.addRoute({
        matcher: bool(true),
        handler: () => 'not found',
    });
    expect(router.exec({ req: createRequest() })).toBe('not found');
});
it('match method', () => {
    // example of usage, if matcher is defined first
    const matcher = method(['GET', 'DELETE']);
    const handler = ({ match }) => {
        if (match.result.method === 'DELETE') {
            return 'matched DELETE';
        }
        return `matched ${match.result.method}`;
    };
    router.addRoute({ matcher, handler });
    expect(router.exec({ req: createRequest() })).toBe('matched GET');
    expect(router.exec({ req: createRequest({ method: 'DELETE' }) })).toBe('matched DELETE');
});
it('no match for POST route', () => {
    router.addRoute({
        matcher: method(['GET']),
        handler: () => 'matched GET',
    });
    router.addRoute({
        matcher: bool(true),
        handler: () => 'not found',
    });
    const req = createRequest({
        method: 'POST',
    });
    expect(router.exec({ req })).toBe('not found');
});
it('match POST /test route', () => {
    // example of usage, if handler is defined first
    const handler = ({ match, }) => {
        const [{ result: { method: methodResult } }, { result: { pathname } }] = match.result.and;
        return `matched ${methodResult} ${pathname}`;
    };
    router.addRoute({
        matcher: and([
            method(['POST']),
            exactUrlPathname(['/test']),
        ]),
        handler,
    });
    const req = createRequest({
        method: 'POST',
        url: '/test',
    });
    expect(router.exec({ req })).toBe('matched POST /test');
});
it('match POST /group/123 endpoint', () => {
    // define an endpoint
    const pathUrl = ((pattern) => ({
        pattern: pathToRegexp(pattern),
        path: compile(pattern),
    }))('/group/:groupId');
    router.addRoute({
        matcher: endpoint('POST', pathUrl.pattern),
        handler: ({ match }) => {
            return `matched ${match.result.method} for group ${match.result.match[1]}`;
        },
    });
    router.addRoute({
        matcher: bool(true),
        handler: () => 'not found',
    });
    const req = createRequest({
        method: 'POST',
        url: pathUrl.path({ groupId: 123 }),
    });
    expect(router.exec({ req })).toBe('matched POST for group 123');
    expect(router.exec({ req: createRequest() })).toBe('not found');
});
it('no match, but default handler', () => {
    router = new Router(() => 'default route');
    const req = createRequest({
        method: 'POST',
        url: '/dontcare',
    });
    expect(router.exec({ req })).toBe('default route');
});
class TestMatcherWithParams {
    // eslint-disable-next-line class-methods-use-this
    match(_neededForTypeScript) {
        throw new Error('Method not implemented.');
    }
}
it('simple route match', () => {
    const routerWithoutParams = new Router();
    routerWithoutParams.addRoute({
        matcher: bool(true),
        handler: (_params) => {
            return 'test';
        },
    });
});
it('simple route match with custom type', () => {
    const typedRouter = new Router();
    typedRouter.addRoute({
        matcher: new TestMatcherWithParams(),
        handler: (_params) => {
            return 'myreturn';
        },
    });
});
it('simple non-matching router type', () => {
    const typedRouter = new Router();
    typedRouter.addRoute({
        // @ts-expect-error
        matcher: new TestMatcherWithParams(),
        handler: (_params) => {
            // @ts-expect-error
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const fail = _params;
            return 'myreturn';
        },
    });
});
it('tenant router example from docs', () => {
    // create main rooter
    const rootRouter = new NodeHttpRouter();
    // attach some global urls
    // rootRouter.addRoute(...)
    // create a router used for all handlers
    // with tenant information
    const tenantRouter = new Router();
    // connect routers
    rootRouter.addRoute({
        matcher: regExpUrl([/^\/auth\/realms\/(?<tenant>[^/]+)(?<url>.+)/]),
        handler: ({ data, match }) => {
            const { req, res } = data;
            // figure tenant out
            const { tenant, url } = match.result.match.groups;
            // pass the new url down
            req.url = url;
            return tenantRouter.exec({
                req,
                res,
                tenant,
            });
        },
    });
    // attach some urls behind tenant
    tenantRouter.addRoute({
        matcher: exactUrlPathname(['/myurl']),
        handler: ({ data: { tenant }, match: { result: { pathname } } }) => {
            // if requested url is `/auth/realms/mytenant/myurl`, then:
            // tenant: mytenant
            // pathname: /myurl
            return `tenant: ${tenant}, url: ${pathname}`;
        },
    });
    expect(rootRouter.serve(createRequest({
        method: 'GET',
        url: '/auth/realms/mytenant/myurl',
    }), createResponse())).toBe('tenant: mytenant, url: /myurl');
});
it('nested router', () => {
    const appRouter = new Router();
    appRouter.addRoute({
        matcher: regExpUrl([/\/app\/(?<name>[\w\W]+)/]),
        handler: ({ data: { tenant }, match: { result: { match: { groups: { name } } } }, }) => `myapp ${tenant} ${name}`,
    });
    appRouter.addRoute({
        matcher: bool(true),
        handler: () => '404 app route',
    });
    const rootRouter = new NodeHttpRouter();
    rootRouter.addRoute({
        matcher: regExpUrl([/^\/auth\/realms\/(?<tenant>[^/]+)(?<url>.+)/]),
        handler: ({ data, match }) => {
            const { req } = data;
            const { tenant, url } = match.result.match.groups;
            req.url = url;
            return appRouter.exec({
                tenant,
                req,
            });
        },
    });
    rootRouter.addRoute({
        matcher: bool(true),
        handler: () => '404 tenant route',
    });
    expect(rootRouter.serve(createRequest({
        url: '/unknown',
    }), createResponse())).toBe('404 tenant route');
    expect(rootRouter.serve(createRequest({
        url: '/auth/realms/mytenant/app/test',
    }), createResponse())).toBe('myapp mytenant test');
    expect(rootRouter.serve(createRequest({
        url: '/auth/realms/mytenant/app',
    }), createResponse())).toBe('404 app route');
});
it('event processing', () => {
    const eventRouter = new Router();
    eventRouter.addRoute({
        matcher: {
            match(params) {
                var _a;
                const result = /^test(?<num>\d+)$/.exec(params.name);
                if ((_a = result === null || result === void 0 ? void 0 : result.groups) === null || _a === void 0 ? void 0 : _a.num) {
                    return {
                        matched: true,
                        result: parseInt(result.groups.num, 10),
                    };
                }
                return {
                    matched: false,
                };
            },
        },
        handler({ data, match: { result } }) {
            return `the event ${data.name} has number ${result}`;
        },
    });
    eventRouter.addRoute({
        matcher: bool(true),
        handler({ data }) {
            return `the event '${data.name}' is unknown`;
        },
    });
    expect(eventRouter.exec({
        name: 'test1',
    })).toBe('the event test1 has number 1');
    expect(eventRouter.exec({
        name: 'invalid',
    })).toBe(`the event 'invalid' is unknown`);
});
//# sourceMappingURL=Router.test.js.map