Router for Node.js, micro and other use cases
=============================================

[![Project is](https://img.shields.io/badge/Project%20is-fantastic-ff69b4.svg)](https://github.com/Bessonov/node-http-router)
[![Build Status](https://api.travis-ci.org/Bessonov/node-http-router.svg?branch=master)](https://travis-ci.org/Bessonov/node-http-router)
[![License](http://img.shields.io/:license-MIT-blue.svg)](https://raw.githubusercontent.com/Bessonov/node-http-router/master/LICENSE)

This router is intended to be used with native node http interface. Features:
- Written in TypeScript with focus on type safety.
- Extensible via [`Matcher`](src/matchers/Matcher.ts) and [`MatchResult`](src/matchers/MatchResult.ts) interfaces.
- Works with [native node http server](#usage-with-native-node-http-server).
- Works with [micro](#usage-with-micro).
- Offers a set of matchers:
  - [`MethodMatcher`](#methodmatcher)
  - [`ExactUrlPathnameMatcher`](#exacturlpathnamematcher)
  - [`ExactQueryMatcher`](#exactquerymatcher)
  - Powerful [`RegExpUrlMatcher`](#regexpurlmatcher)
  - Convenient [`EndpointMatcher`](#endpointmatcher)
  - `AndMatcher` and `OrMatcher`
- Can be used with [path-to-regexp](https://github.com/pillarjs/path-to-regexp).
- Work with other servers? Tell it me!

From 2.0.0 the router isn't tied to node or even http anymore! Although the primary use case is still node's request routing, you can use it for use cases like event processing.

## Sponsoring

Contact me if you want to become a sponsor or need paid support.

Sponsored by Superlative GmbH

![Superlative GmbH](./sponsors/superlative.gmbh.png)


## Installation

Choose for one of your favourite package manager:

```bash
npm install @bessonovs/node-http-router
yarn add @bessonovs/node-http-router
pnpm add @bessonovs/node-http-router
```

## Changelog

See [releases](https://github.com/Bessonov/node-http-router/releases).

## Documentation and examples

### Binding

The router doesn't depends on the native http interfaces like `IncomingMessage` and `ServerResponse`. Therefore, you can use it for everything. Below are some use cases.

#### Usage with native node http server

```typescript
const router = new NodeHttpRouter()

const server = http.createServer(router.serve).listen(8080, 'localhost')

router.addRoute({
	matcher: new ExactUrlPathnameMatcher(['/hello']),
	handler: () => 'Hello kitty!',
})

// 404 handler
router.addRoute({
	matcher: new BooleanMatcher(true),
	handler: ({ data: { res } }) => send(res, 404)
})
```

See [full example](src/examples/node.ts) and [native node http server](https://nodejs.org/api/http.html#http_class_http_server) documentation.

#### Usage with micro server

[micro](https://github.com/vercel/micro) is a very lightweight layer around the native node http server with some convenience methods.

```typescript
const router = new NodeHttpRouter()

http.createServer(micro(router.serve)).listen(8080, 'localhost')

router.addRoute({
	matcher: new ExactUrlPathnameMatcher(['/hello']),
	handler: () => 'Hello kitty!',
})

// 404 handler
router.addRoute({
	matcher: new BooleanMatcher(true),
	handler: ({ data: { res } }) => send(res, 404)
})
```

See [full example](src/examples/micro.ts).

#### Usage for event processing or generic use case

```typescript
// Custom type
type MyEvent = {
	name: 'test1',
} | {
	name: 'test2',
} | {
	name: 'invalid',
}

const eventRouter = new Router<MyEvent>()

eventRouter.addRoute({
	// define matchers for event processing
	matcher: ({
		match(params: MyEvent): MatchResult<number> {
			const result = /^test(?<num>\d+)$/.exec(params.name)
			if (result?.groups?.num) {
				return {
					matched: true,
					result: parseInt(result.groups.num)
				}
			}
			return {
				matched: false,
			}
		},
	}),
	// define event handler for matched events
	handler({ data, match: { result } }) {
		return `the event ${data.name} has number ${result}`
	}
})

// add default handler
eventRouter.addRoute({
	matcher: new BooleanMatcher(true),
	handler({ data }) {
		return `the event '${data.name}' is unknown`
	}
})

// execute and get processing result
const result = eventRouter.exec({
	name: 'test1',
})
```

### Matchers

In the core, matchers are responsible to decide if particular handler should be called or not. There is no magic: matchers are iterated on every request and first positive "match" calls defined handler.

#### MethodMatcher ([source](./src/matchers/MethodMatcher.ts))

Method matcher is the simplest matcher and matches any of the passed http methods:

```typescript
router.addRoute({
	matcher: new MethodMatcher(['OPTIONS', 'POST']),
	// method is either OPTIONS or POST
	handler: ({ match: { result: { method } } }) => `Method: ${method}`,
})
```

#### ExactUrlPathnameMatcher ([source](./src/matchers/ExactUrlPathnameMatcher.ts))

Matches given pathnames (but ignores query parameters):

```typescript
router.addRoute({
	matcher: new ExactUrlPathnameMatcher(['/v1/graphql', '/v2/graphql']),
	// pathname is /v1/graphql or /v2/graphql
	handler: ({ match: { result: { pathname } } }) => `Path is ${pathname}`,
})
```

#### ExactQueryMatcher ([source](./src/matchers/ExactQueryMatcher.ts))

Defines expectations on query parameters:

```typescript
router.addRoute({
	matcher: new ExactQueryMatcher({
		// example of 4 query parameters:
		// true defines mandatory parameters
		mustPresent: true,
		// false defines parameters expected to absent
		mustAbsent: false,
		// undefined defines optional parameters. They
		// aren't used for matching, but available as type
		isOptional: undefined,
		// array of strings defines expected parameter name and value
		mustExact: ['exactValue'] as const,
	}),
	// query parameter isOptional has type string | undefined
	handler: ({ match: { result: { query } } }) => query.isOptional,
})
```

#### RegExpUrlMatcher ([source](./src/matchers/RegExpUrlMatcher.ts))

Allows powerful expressions:

```typescript
router.addRoute({
	matcher: new RegExpUrlMatcher<{ userId: string }>([/^\/group\/(?<userId>[^/]+)$/]),
	handler: ({ match: { result: { match } } }) => `User id is: ${match.groups.userId}`,
})
```
Be aware that regular expression must match the whole base url (also with query parameters) and not only `pathname`. Ordinal parameters can be used too.

#### EndpointMatcher ([source](./src/matchers/EndpointMatcher.ts))

EndpointMatcher is a combination of Method and RegExpUrl matcher for convenient usage:

```typescript
router.addRoute({
	matcher: new EndpointMatcher<{ userId: string }>('GET', /^\/group\/(?<userId>[^/]+)$/),
	handler: ({ match: { result: { method, match } } }) => `Group id ${match.groups.userId} matched with ${method} method`,
})
```

### Middlewares

**This whole section is highly experimental!**

Currently, there is no built-in API for middlewares. It seems like there is no aproach to provide centralized and typesafe way for middlewares. And it need some conceptual work, before it will be added. Open an issue, if you have a great idea!

#### CorsMiddleware ([source](./src/middlewares/CorsMiddleware.ts))

Example of CorsMiddleware usage:

```typescript
const cors = CorsMiddleware(async () => {
	return {
		origins: ['https://my-cool.site'],
	}
})

const router = new NodeHttpRouter()
router.addRoute({
	matcher: new MethodMatcher(['OPTIONS', 'POST']),
	// use it
	handler: cors(({ match: { result: { method } } }) => `Method: ${method}.`),
})
```

Available options:

```typescript
interface CorsMiddlewareOptions {
	// exact origins like 'http://0.0.0.0:8080' or '*'
	origins: string[],
	// methods like 'POST', 'GET' etc.
	allowMethods?: HttpMethod[]
	// headers like 'Authorization' or 'X-Requested-With'
	allowHeaders?: string[]
	// allows cookies in CORS scenario
	allowCredentials?: boolean
	// max age in seconds
	maxAge?: number
}
```

See ([source](./src/middlewares/CorsMiddleware.ts)) file for defaults.

#### Create own middleware

```typescript
// example of a generic middleware, not a real cors middleware!
function CorsMiddleware(origin: string) {
	return function corsWrapper<
		T extends MatchResult<any>,
		D extends {
			// add requirements of middleware
			req: ServerRequest,
			res: ServerResponse,
		}
	>(
		wrappedHandler: Handler<T, D & {
			// new attributes can be used in the handler
			isCors: boolean
		}>,
	): Handler<T, D> {
		return async function corsHandler(params) {
			const { req, res } = params.data
			const isCors = !!req.headers.origin
			// -> executed before handler
			// it's even possible to skip the handler at all
			const result = await wrappedHandler({
				...params,
				data: {
					...params.data,
					isCors,
				}
			})
			// -> executed after handler, like:
			if (isCors) {
				res.setHeader('Access-Control-Allow-Origin', origin)
			}
			return result
		}
	}
}

// create a configured instance of middleware
const cors = CorsMiddleware('http://0.0.0.0:8080')

const router = new NodeHttpRouter()

router.addRoute({
	matcher: new MethodMatcher(['OPTIONS', 'POST']),
	// use it
	handler: cors(({ match: { result: { method } }, data: { isCors } }) => `Method: ${method}. Cors: ${isCors}`),
})
```

#### Combine middlewares

Of course you can create a `middlewares` wrapper and put all middlewares inside it:
```typescript
function middlewares<
	T extends MatchResultAny,
	D extends {
		req: ServerRequest
		res: ServerResponse
	}
>(
	handler: Handler<T, D
		& MiddlewareData<typeof corsMiddleware>
		& MiddlewareData<typeof sessionMiddleware>
	>,
): Handler<T, any> {
	return function middlewaresHandler(...args) {
		return corsMiddleware(sessionMiddleware(handler))(...args)
	}
}

router.addRoute({
	matcher,
	// use it
	handler: middlewares(({ data: { csrftoken } }) => `Token: ${csrftoken}`),
})
```

### Nested routers

There are some use cases for nested routers:
- Add features like multi-tenancy
- Implement modularity
- Apply middlewares globally

An example of multi-tenancy:

```typescript
// create main rooter
const rootRouter = new NodeHttpRouter()
// attach some global urls
// rootRouter.addRoute(...)

// create a router used for all handlers
// with tenant information
const tenantRouter = new Router<{
	req: ServerRequest
	res: ServerResponse
	tenant: string
}>()

// connect routers
rootRouter.addRoute({
	matcher: new RegExpUrlMatcher<{
		tenant: string
		url: string
	}>([/^\/auth\/realms\/(?<tenant>[^/]+)(?<url>.+)/]),
	handler: ({ data, match }) => {
		const { req, res } = data
		// figure tenant out
		const { tenant, url } = match.result.match.groups
		// pass the new url down
		req.url = url
		return tenantRouter.exec({
			req,
			res,
			tenant,
		})
	},
})

// attach some urls behind tenant
tenantRouter.addRoute({
	matcher: new ExactUrlPathnameMatcher(['/myurl']),
	handler: ({ data: { tenant }, match: { result: { pathname } } }) => {
		// if requested url is `/auth/realms/mytenant/myurl`, then:
		// tenant: mytenant
		// pathname: /myurl
		return `tenant: ${tenant}, url: ${pathname}`
	}
})
```

## License

MIT License

Copyright (c) 2019 - today, Anton Bessonov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.