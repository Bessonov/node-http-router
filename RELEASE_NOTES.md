About the 3.0.0 Release
=========================
First things first, I advise against updating to this release unless you specifically need the new features or the required changes are minimal. This release is more conceptual, intended for experimentation and gathering feedback about the new validators. I have a strong sense that there are significant, exciting developments on the horizon that could render matchers in their current form obsolete. Let's wait for the next release to see.

However, this release brings a lot of power and capabilities that you may find interesting. Read on for more details.

Breaking Changes
================

ESM Only
--------
As more and more packages migrate to ESM-only builds, this release follows suit.

EndpointMatcher
----------------
The `EndpointMatcher` no longer matches the query string; it now matches only the path, similar to `ExactUrlPathnameMatcher`. To match query parameters, you can use the `query` field in the third argument. Additionally, type arguments are no longer used. Instead, use the `url` field in the third parameter to describe your RegExp output.

Before:
```typescript
new EndpointMatcher<{ name: string }>('GET', /^\/hello\/(?<name>[^/]+)$/)
```

After:
```typescript
endpoint('GET', /^\/hello\/(?<name>[^/]+)$/, {
  url: {
    name: chain(getNthVal(), requiredVal()),
  },
  query: {
    myparam: getNthVal(),
  },
})
```

Source code is no longer included in the npm package
----------------------------------------------------
Although it's sometimes convenient to access the source code within `node_modules`, with the switch to ESM, it's less relevant. However, the code is still available on GitHub.

Features
========

Validators
----------
`RegExpPathnameMatcher`, `EndpointMatcher`, and `QueryStringMatcher` can now be used with validators. In short, a validator is a set of functions that determine if arguments can be transformed to some format and transform them on demand. Many useful validators are already provided; check the README.md for details.

AndMatcher and OrMatcher
------------------------
`AndMatcher` and `OrMatcher` now support up to five matchers instead of two.

Shortcut Functions
------------------
Every matcher, except those deprecated, can now be instantiated with a shortcut function. For example, `and`, `or`, `method`, `endpoint`, etc.

EndpointMatcher
---------------
`EndpointMatcher` now supports plain strings for paths instead of only RegExp. They match the URL as is. Internally, the string is converted to RegExp. At least for now, there are no plans to support parameters within strings.

Deprecations
============

RegExpUrlMatcher
----------------
Use the new `RegExpPathnameMatcher` matcher. Similar to `EndpointMatcher`, it matches only the `pathname` instead of the whole URL and has a third parameter.

Before:
```typescript
new RegExpUrlMatcher<{ groupId: string }>([/^\/group\/(?<groupId>[^/]+)$/])
```

After:
```typescript
regExpPathname([/^\/group\/(?<groupId>[^/]+)$/], {
  groupId: chain(getNthVal(), requiredVal(), toNumVal()),
})
```

ExactQueryMatcher
-----------------
`ExactQueryMatcher` performs its job well, but it wasn't suitable for certain scenarios. For example, it couldn't be used to match multiple query string parameters with the same name, such as `userIds[]=1&userIds[]=2`. Additionally, the output was often a `string`, and the expressiveness was very limited. The brand new `QueryStringMatcher` resolves such issues.

Before:
```typescript
new ExactQueryMatcher({
  mustPresent: true,
  mustAbsent: false,
  isOptional: undefined,
  mustExact: ['exactValue1', 'exactValue2'] as const,
})
```

After:
```typescript
queryString({
  mustPresent: chain(getNthVal(), requiredVal()),
  // mustAbsent: false, // not possible yet!
  isOptional: getNthVal(),
  mustExact: chain(atLeastOneVal(['exactValue1', 'exactValue2']), getNthVal(), requiredVal()),
})
```

Note that a negative match isn't possible yet. However, I'm not sure if anyone has ever used it.

Trying It Out
=============
While this state is highly experimental, you can try it out with `pnpm add github:Bessonov/node-http-router#next`.

After that, you can update to the latest version with `pnpm update -r @bessonovs/node-http-router`.