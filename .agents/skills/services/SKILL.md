---
name: angular-service
description: Create or refactor Angular API services from the Swagger/OpenAPI spec linked in README.md, reusing shared HTTP logic without duplication.
---

1. Find ## API section in the `README.md`; use the Swagger URL and required header parameter. If unavailable or ambiguous, ask; never invent endpoints or schemas.
2. Inspect Angular version, architecture, existing services, shared HTTP utilities, models, API base URL, interceptors, and dependencies before writing code.
3. Identify the requested resource/operations; implement only that scope. Ask if unclear.
4. **Avoid duplication:** compare existing services first. Reuse shared request logic; if repeated, extract the smallest generic, type-safe API service with endpoint/path, query, and body passed as arguments. Do not recreate identical CRUD wrappers per resource or add an abstraction for a single trivial use.
5. Keep resource-specific services only for distinct behavior, domain mapping, or a meaningful typed public API. Prefer existing shared infrastructure over another wrapper. Preserve existing callers when refactoring; update usages only as needed.
6. Use `inject(HttpClient)`, typed `Observable<T>`, and generics where useful. Match Swagger methods, paths, params, payloads, responses, and nullability. Reuse DTOs and environment configuration; never duplicate interceptor auth/error handling.
7. Avoid new dependencies and unrelated changes. Run targeted typecheck/tests; fix regressions.
8. Briefly report files changed, reused/extracted logic, supported operations, checks, and spec gaps.
