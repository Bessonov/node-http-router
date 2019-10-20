Router for Node.js, micro and others
====================================

[![Project is](https://img.shields.io/badge/Project%20is-fantastic-ff69b4.svg)](https://github.com/Bessonov/node-http-router)
[![Build Status](https://api.travis-ci.org/Bessonov/node-http-router.svg?branch=master)](https://travis-ci.org/Bessonov/node-http-router)
[![License](http://img.shields.io/:license-MIT-blue.svg)](https://raw.githubusercontent.com/Bessonov/node-http-router/master/LICENSE)

This router is intended to be used with native node http interface. Features:
- Written in TypeScript with focus on type safety.
- Extensible via [`Matcher`](src/matchers/Matcher.ts) and [`MatchResult`](src/matchers/MatchResult.ts) interfaces.
- Works with [native node http server](https://nodejs.org/api/http.html#http_class_http_server) ([example](src/examples/node.ts)).
- Works with [micro](https://github.com/zeit/micro) ([example](src/examples/micro.ts)).
- Offers a set of matchers:
  - `AndMatcher` and `OrMatcher`
  - `ExactQueryMatcher`
  - Convenient `EndpointMatcher`
  - `ExactUrlPathnameMatcher`
  - `MethodMatcher`
  - Powerful `RegExpUrlMatcher`
- Can be used with [path-to-regexp](https://github.com/pillarjs/path-to-regexp).
- Work with another servers? Tell it me!

First example with micro
------------------------
```typescript
// specify default handler
const router = new Router((req, res) => sendError(req, res, { statusCode: 404 }))

router.addRoute({
	matcher: new ExactUrlPathnameMatcher(['/hello']),
	handler: () => 'Hello kitty!',
})


const [address, port] = ['localhost', 8080]
http.createServer(micro(router.serve)).listen(port, address)
```


Installation
------------

Choose for one of your favourite package manager:

```bash
pnpm install @bessonovs/node-http-router
npm install @bessonovs/node-http-router
yarn add @bessonovs/node-http-router
```

License
-------

The MIT License (MIT)

Copyright (c) 2019, Anton Bessonov

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