Breaking changes
----------------
- ESM only.
- `RegExpUrlMatcher` and `EndpointMatcher` don't match query string anymore, but only path, like `ExactUrlPathnameMatcher` do.

Features
--------
- `AndMatcher` and `OrMatcher` supports now up to five matchers instead of two.
- Every matcher can be instantiated with a shortcut function now. For example, `and`, `or`, `method`, `endpoint`, etc.
- `ExactQueryMatcher` is now deprecated and will be replaced with the new `queryString` matcher. It comes with a set of validators, which can also convert values and supports PHP style arrays such as `users[]=1&users[]=2`.

What's next?
------------
Some ideas:
- `RegExpUrlMatcher` and `EndpointMatcher` will probably get an additional parameter to describe the data instead of do it with type arguments and get only string. This parameter probably will looks like `{userId: numberValidator()}`.
- Addition of some sort of `ajv`-based JSON Schema Matcher.

Trying out
----------
While this state is highly experimental, you can try it out with `pnpm add github:Bessonov/node-http-router#next`.

After that, you can update to the latest version with `pnpm update -r @bessonovs/node-http-router`.