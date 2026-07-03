---
name: OUTLIER pre-existing typecheck errors
description: Known unrelated tsc/codegen failures in api-server and lib/replit-auth-web, safe to ignore
---

`pnpm run codegen` (in `lib/api-spec`) and `tsc --noEmit` in `artifacts/api-server` fail with several pre-existing, unrelated errors:
- `lib/replit-auth-web/src/use-auth.tsx` imports a missing `AuthUser` type from `@workspace/api-client-react`.
- `artifacts/api-server/src/lib/auth.ts` and `src/middlewares/authMiddleware.ts` reference a nonexistent `AuthUser` export from `@workspace/api-zod`.
- `artifacts/api-server/src/lib/objectStorage.ts` has a `signed_url` property access on an `unknown`-typed value.
- `artifacts/api-server/src/routes/auth.ts` accesses `.id`/`.email` on a `User` type that doesn't declare them.

**Why:** these predate unrelated feature work (verified via git diff) and are not caused by new changes — don't spend time investigating them unless the user's task is specifically about auth types or asks to fix typecheck cleanliness.

**How to apply:** when running `tsc --noEmit` or codegen and seeing these specific errors, confirm via diff that your own change isn't the cause, then proceed — no need to fix them as a side quest.
