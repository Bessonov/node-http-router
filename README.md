Router for Node.js, micro and others
====================================

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
- Work with another servers? Tell it me!

## Installation

Choose for one of your favourite package manager:

```bash
npm install @bessonovs/node-http-router
yarn add @bessonovs/node-http-router
pnpm add @bessonovs/node-http-router
```

## Documentation and examples

### Binding

The router works with native http interfaces like `IncomingMessage` and `ServerResponse`. Therefore it should be possible to use it with most of existing servers.

#### Usage with native node http server

```typescript
const router = new Router((req, res) => {
	res.statusCode = 404
	res.end()
})

const server = http.createServer(router.serve).listen(8080, 'localhost')

router.addRoute({
	matcher: new ExactUrlPathnameMatcher(['/hello']),
	handler: () => 'Hello kitty!',
})
```

See [full example](src/examples/node.ts) and [native node http server](https://nodejs.org/api/http.html#http_class_http_server) documentation.

#### Usage with micro

[micro](https://github.com/vercel/micro) is a very lightweight layer around the native node http server with some convenience methods.

```typescript
// specify default handler
const router = new Router((req, res) => send(res, 404))

http.createServer(micro(router.serve)).listen(8080, 'localhost')

router.addRoute({
	matcher: new ExactUrlPathnameMatcher(['/hello']),
	handler: () => 'Hello kitty!',
})
```

See [full example](src/examples/micro.ts).

### Matchers

In the core, matchers are responsible to decide if particular handler should be called or not. There is no magic: matchers are iterated on every request and first positive "match" calls defined handler.

#### MethodMatcher ([source](./src/matchers/MethodMatcher.ts))

Method matcher is the simplest matcher and matches any of the passed http methods:

```typescript
router.addRoute({
	matcher: new MethodMatcher(['OPTIONS', 'POST']),
	// method is either OPTIONS or POST
	handler: (req, res, { method }) => `Method: ${method}`,
})
```

#### ExactUrlPathnameMatcher ([source](./src/matchers/ExactUrlPathnameMatcher.ts))

Matches given pathnames (but ignores query parameters):

```typescript
router.addRoute({
	matcher: new ExactUrlPathnameMatcher(['/v1/graphql', '/v2/graphql']),
	// pathname is /v1/graphql or /v2/graphql
	handler: (req, res, { pathname }) => `Path is ${pathname}`,
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
		// a string defines expected parameter name and value
		mustExact: 'exactValue',
	}),
	// query parameter isOptional has type string | undefined
	handler: (req, res, { query }) => query.isOptional,
})
```

#### RegExpUrlMatcher ([source](./src/matchers/RegExpUrlMatcher.ts))

Allows powerful expressions:

```typescript
router.addRoute({
	matcher: new RegExpUrlMatcher<{ userId: string }>([/^\/group\/(?<userId>[^/]+)$/]),
	handler: (req, res, { match }) => `User id is: ${match.groups.userId}`,
})
```
Ordinal parameters can be used too. Be aware that regular expression must match the whole base url (also with query parameters) and not only `pathname`.

#### EndpointMatcher ([source](./src/matchers/EndpointMatcher.ts))

EndpointMatcher is a combination of Method and RegExpUrl matcher for convenient usage:

```typescript
router.addRoute({
	matcher: new EndpointMatcher<{ userId: string }>('GET', /^\/group\/(?<userId>[^/]+)$/),
	handler: (req, res, { match }) => `Group id is: ${match.groups.userId}`,
})
```

### Middlewares

**This section is highly experimental!**

Currently, there is no built-in API for middlewares. It seems like there is no aproach to provide centralized and typesafe way for middlewares. And it need some conceptual work, before it will be added. Open an issue, if you have a great idea!

#### CorsMiddleware ([source](./src/middlewares/CorsMiddleware.ts))

Example of CorsMiddleware usage:

```typescript
const corsMiddleware = CorsMiddleware({
	origins: corsOrigins,
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

See source file for defaults.

#### Create own middleware

```typescript
// example of a generic middleware, not a cors middleware!
function CorsMiddleware(origin: string) {
	return function corsWrapper<T extends MatchResult, D extends Matched<T>>(
		wrappedHandler: Handler<T, D>,
	): Handler<T, D> {
		return async function corsHandler(req, res, ...args) {
			// -> executed before handler
			// it's even possible to skip the handler at all
			const result = await wrappedHandler(req, res, ...args)
			// -> executed after handler, like:
			res.setHeader('Access-Control-Allow-Origin', origin)
			return result
		}
	}
}

// create a configured instance of middleware
const cors = CorsMiddleware('http://0.0.0.0:8080')

router.addRoute({
	matcher: new MethodMatcher(['OPTIONS', 'POST']),
	// use it
	handler: cors((req, res, { method }) => `Method: ${method}`),
})
```

Apropos typesafety. You can modify types in middleware:

```typescript
function ValueMiddleware(myValue: string) {
	return function valueWrapper<T extends MatchResult>(
		handler: Handler<T, Matched<T> & {
			// add additional type
			myValue: string
		}>,
	): Handler<T> {
		return function valueHandler(req, res, match) {
			return handler(req, res, {
				...match,
				// add additional property
				myValue,
			})
		}
	}
}

const value = ValueMiddleware('world')

router.addRoute({
	matcher: new MethodMatcher(['GET']),
	handler: value((req, res, { myValue }) => `Hello ${myValue}`),
})
```

#### DRY approach

Of course you can create a `middlewares` wrapper and put all middlewares inside it:
```typescript
type Middleware<T extends (handler: Handler<MatchResult>) => Handler<MatchResult>> = Parameters<Parameters<T>[0]>[2]

function middlewares<T extends MatchResult>(
	handler: Handler<T, Matched<T>
		& Middleware<typeof session>
		& Middleware<typeof cors>>,
): Handler<T> {
	return function middlewaresHandler(...args) {
		return cors(session(handler))(...args)
	}
}

router.addRoute({
	matcher,
	// use it
	handler: middlewares((req, res, { csrftoken }) => `Token: ${csrftoken}`),
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