Router for Node.js, Micro, and other use cases
==============================================

[![Project is](https://img.shields.io/badge/Project%20is-fantastic-ff69b4.svg)](https://github.com/Bessonov/node-http-router)
[![License](http://img.shields.io/:license-MIT-blue.svg)](https://raw.githubusercontent.com/Bessonov/node-http-router/master/LICENSE)

This router is intended to be used with the native Node.js HTTP interface. Features:
- Written in TypeScript with a focus on type safety.
- Extensible via the [`Matcher`](src/matchers/Matcher.ts) and [`MatchResult`](src/matchers/MatchResult.ts) interfaces.
- Works with the [native Node.js HTTP server](#usage-with-native-node-http-server).
- Works with [Micro](#usage-with-micro), and probably with any other server.
- Offers a set of matchers:
  - [`MethodMatcher`](#methodmatcher)
  - [`ExactUrlPathnameMatcher`](#exacturlpathnamematcher)
  - [`QueryStringMatcher`](#querystringmatcher)
  - Powerful [`RegExpPathnameMatcher`](#regexppathnamematcher)
  - Convenient [`EndpointMatcher`](#endpointmatcher)
  - `AndMatcher` and `OrMatcher`
- Can be used with [path-to-regexp](https://github.com/pillarjs/path-to-regexp).
- Work with other servers? Let me know!

Starting from version 2.0.0, the router isn't tied to Node.js or even HTTP anymore! Although the primary use case is still request routing in Node.js, you can now use it for use cases like event processing.

## Sponsoring

Contact me if you want to become a sponsor or need paid support.

Sponsored by [Superlative GmbH](https://superlative.gmbh)

![Superlative GmbH](./sponsors/superlative.gmbh.png)

## Installation

Choose one of your favorite package managers:

```bash
npm install @bessonovs/node-http-router
yarn add @bessonovs/node-http-router
pnpm add @bessonovs/node-http-router
```

## Changelog

See [releases](https://github.com/Bessonov/node-http-router/releases).

## Documentation and Examples

### Binding

The router doesn't depend on the native HTTP interfaces like `IncomingMessage` and `ServerResponse`. Therefore, you can use it for anything. Below are some use cases.

#### Usage with Native Node.js HTTP Server

```typescript
import { createServer } from 'node:http'
import { endpoint, NodeHttpRouter } from '@bessonovs/node-http-router'

const router = new NodeHttpRouter(function notFound({ data: { res } }) {
	res.statusCode = 404
	res.end()
})

router.addRoute({
	matcher: endpoint('GET', '/hello'),
	handler({ data: { res } }) {
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify({ message: 'Hello kitty!' }))
	},
})

createServer(router.serve).listen(8080, 'localhost')
```

See the [full example](src/examples/node.ts) and the [native Node.js HTTP server](https://nodejs.org/api/http.html#http_class_http_server) documentation.

#### Usage with Micro Server

[Micro](https://github.com/vercel/micro) is a very lightweight layer around the native Node.js HTTP server with some convenience methods.

```typescript
import { createServer } from 'node:http'
import { send, serve } from 'micro'
import { endpoint, NodeHttpRouter } from '@bessonovs/node-http-router'

const router = new NodeHttpRouter(function notFound({ data: { res } }) {
	send(res, 404)
})

router.addRoute({
	matcher: endpoint('GET', '/hello'),
	handler() {
		return 'Hello kitty!'
	},
})

createServer(serve(router.serve)).listen(8080, 'localhost')
```

See the [full example](src/examples/micro.ts).

#### Usage for Event Processing or Generic Use Case

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
	// Define matchers for event processing
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
	// Define event handler for matched events
	handler({ data, match: { result } }) {
		return `the event ${data.name} has number ${result}`
	}
})

// Add default handler
eventRouter.addRoute({
	matcher: bool(true), // matches everything
	handler({ data }) {
		return `the event '${data.name}' is unknown`
	}
})

// Execute and get processing result
const result = eventRouter.exec({
	name: 'test1',
})
```

### Matchers

In the core, matchers are responsible for deciding if a particular handler should be called or not. There is no magic: matchers are iterated on every request, and the first positive "match" calls the defined handler.

#### MethodMatcher
([source](./src/matchers/MethodMatcher.ts))

The method matcher is the simplest matcher and matches any of the passed HTTP methods:

```typescript
router.addRoute({
	matcher: method(['OPTIONS', 'POST']),
	// method is either OPTIONS or POST
	handler: ({ match: { result: { method } } }) => `Method: ${method}`,
})
```

#### ExactUrlPathnameMatcher
([source](./src/matchers/ExactUrlPathnameMatcher.ts))

Matches the original request pathname, preserving percent escapes, dot segments, and repeated slashes.

```typescript
router.addRoute({
	matcher: exactUrlPathname(['/v1/graphql', '/v2/graphql']),
	// pathname is /v1/graphql or /v2/graphql
	handler: ({ match: { result: { pathname } } }) => `Path is ${pathname}`,
})
```

#### QueryStringMatcher
([source](./src/matchers/QueryStringMatcher.ts))

Defines expectations on query parameters:

```typescript
router.addRoute({
	matcher: queryString({
		// example query parameters:
		// this parameter is required
		someParameter1: chain(getNthVal(), requiredVal()),
		// this parameter is optional
		someParameter2: getNthVal(),
		// this parameter should have one of the values
		someParameter3: chain(atLeastOneVal(['exactValue1', 'exactValue2']), getNthVal(), requiredVal()),
		// a PHP-style parameter, expected to have at least one element and is converted to numbers
		'userIds[]': chain(minCountVal(1), mapToNumVal()),
	}),
	// query parameter isOptional has type string | undefined
	handler: ({ match: { result: { query } } }) => {
		// the type of query is:
		// someParameter1: string
		// someParameter2: string | undefined
		// someParameter3: 'exactValue1' | 'exactValue2'
		// 'userIds[]': number[]
	},
})

See [all provided validators](src/validators.ts).

```

#### RegExpPathnameMatcher
([source](./src/matchers/RegExpPathnameMatcher.ts))

Allows powerful expressions:

```typescript
router.addRoute({
	matcher: regExpPathname([/^\/group\/(?<userId>[^/]+)$/], {
		userId: chain(getNthVal(), requiredVal(), toNumVal()),
	}),
	handler: ({ match: { result: { pathname } } }) => `User id is: ${pathname.params.userId}`,
})
```
Validators can use named or ordinal capture groups. Global and sticky expressions collect captures from successive matches.

#### EndpointMatcher
([source](./src/matchers/EndpointMatcher.ts))

The `EndpointMatcher` is a combination of `MethodMatcher`, `RegExpPathnameMatcher`, and `QueryStringMatcher` for convenient usage:

```typescript
router.addRoute({
	matcher: endpoint('GET', /^\/user\/(?<userId>[^/]+)$/
		{
			url: {
				userId: chain(getNthVal(), requiredVal(), toNumVal()),
			},
			query: {
				// profile query parameter is optional in this example
				profile: chain(atLeastOneVal([undefined, 'short', 'full']), getNthVal()),
			},
		},
	),
	handler: ({ match: { result: { pathname, query } } }) => {
		return `User id: ${pathname.params.userId}, profile: ${query.profile}.`,
	}
})
```

`EndpointMatcher` can be used with a string for an exact match instead of a RegExp.

### Validators
([source](./src/validators.ts))

Validators set expectations on the input and convert values. Currently, they work with `RegExpPathnameMatcher`, `EndpointMatcher`, and `QueryStringMatcher`. The following validators are available:

Validator       | Array | Value | Ignores `undefined` | Description
----------------|-------|-------|---------------------|------------
`trueVal`       |   ✓   |   ✓   |          ✓          | It's a wildcard validator mainly used for optional parameters.
`requiredVal`   |   ✓   |   ✓   |                     | Validator to mark required parameters.
`getNthVal`     |   ✓   |       |          ✓          | Returns the n-th element of an array. A negative value returns the element counting from the end of the array.
`mapToNumVal`   |   ✓   |       |          ✓          | Ensures that a string array can be converted to a number array.
`toNumVal`      |       |   ✓   |          ✓          | Ensures that a single value can be converted to a number.
`atLeastOneVal` |   ✓   |       |   With `undefined`  | Filters the passed values based on the listed options. If `undefined` is included in the option list, it indicates that the passed value is optional.
`oneOfVal`      |       |   ✓   |   With `undefined`  | Ensures that the passed value is one of the listed options. If `undefined` is included in the option list, it indicates that the passed value is optional.
`minCountVal`   |   ✓   |       |                     | Ensures that the passed array has a minimal length.

Validators can be chained with the `chain` function.

### Middlewares

**This whole section is highly experimental!**

Currently, there is no built-in API for middlewares. It seems like there is no approach to provide a centralized and type-safe way for middlewares. And it needs some conceptual work before it will be added. Open an issue if you have a great idea!

#### CorsMiddleware
([source](./src/middlewares/CorsMiddleware.ts))

Example of CorsMiddleware usage:

```typescript
const cors = CorsMiddleware(async () => {
	return {
		origins: ['https://my-cool.site'],
	}
})

const router = new NodeHttpRouter()
router.addRoute({
	matcher: method(['OPTIONS', 'POST']),
	handler: cors(({ data: { res }, match: { result: { method } } }) => res.end(`Method: ${method}.`)),
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
	// allows credentials for explicitly listed origins (defaults to true)
	allowCredentials?: boolean
	// max age in seconds, or 0 to disable preflight caching
	maxAge?: number
}
```

Use `origins: ['*']` for public cross-origin access without credentials. Explicitly listed origins take precedence over the wildcard.

The middleware handles preflight requests when `OPTIONS` includes both `Origin` and `Access-Control-Request-Method`. It returns `403` for preflight requests from unlisted origins when no wildcard is configured. Other `OPTIONS` requests reach the wrapped handler.

See the [middleware source](./src/middlewares/CorsMiddleware.ts) for defaults.

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
	matcher: method(['OPTIONS', 'POST']),
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
- Features like multi-tenancy
- Implement modularity
- Apply middlewares globally

An example of multi-tenancy:

```typescript
// create main router
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
	matcher: regExpUrl<{
		tenant: string
		url: string
	}>([/^\/auth\/realms\/(?<tenant>[^/]+)(?<url>.+)/]),
	handler: ({ data, match }) => {
		const { req, res } = data
		// figure out the tenant
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
	matcher: exactUrlPathname(['/myurl']),
	handler: ({ data: { tenant }, match: { result: { pathname } } }) => {
		// if the requested url is `/auth/realms/mytenant/myurl`, then:
		// tenant: mytenant
		// pathname: /myurl
		return `tenant: ${tenant}, url: ${pathname}`
	}
})
```
## Change log

See [releases](https://github.com/Bessonov/node-http-router/releases).

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
