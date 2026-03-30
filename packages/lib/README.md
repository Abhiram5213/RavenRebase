### @axon/lib

This package contains shared utilities and hooks for the Axon app.

> **IMPORTANT:** Importing these should always use the `@axon/lib` alias and not `../../packages/lib`.

#### Hooks

Add any hooks that do not have a dependency on the platform (web/native).
Hooks to fetch data should also be added here.

```ts
import { useDebounce } from '@axon/lib/hooks/useDebounce';
```

#### Utils

Add any utils that do not have a dependency on the platform (web/native). Utils using boot cannot be added here.

```ts
import { isEmailValid } from '@axon/lib/utils/validations';
```
