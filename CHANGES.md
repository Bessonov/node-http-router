Breaking changes
----------------
- ESM only.
- `RegExpUrlMatcher` and `EndpointMatcher` don't match query string anymore, but only path, like `ExactUrlPathnameMatcher` do.

Features
--------
- `AndMatcher` and `OrMatcher` supports now up to five matchers instead of two.
- Every matcher can be instantiated with a shortcut function now. For example, `and`, `or`, `method`, `endpoint`, etc.

What's next?
------------
Some ideas:
- `RegExpUrlMatcher` and `EndpointMatcher` will probably get an additional parameter to describe the data instead of do it with type arguments and get only string. This parameter probably will looks like `{userId: numberValidator()}`.
- `ExactQueryMatcher` will probably get validators too. This will improve extensibility and powerfulness a lot. In addition, it will probably handle PHP style arrays such as `users[]=1&users[]=2`.

Trying out
----------
While this state is highly experimental, you can try it out with `pnpm add github:Bessonov/node-http-router#next`.
