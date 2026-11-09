# Project Rules (Angular)

## Priorities
- Follow existing project conventions and Angular version (`package.json`) before introducing patterns.
- Prefer simple, readable, type-safe code. Apply DRY without premature abstraction; preserve behavior and public APIs unless change is requested.
- Keep changes scoped to the task. Do not reformat or refactor unrelated code.

## Architecture
- Organize by feature/domain; place app-wide singletons, infrastructure, and cross-feature utilities in `core`, and genuinely reusable UI in `shared`, when these folders fit the existing structure.
- Keep components focused on presentation and interaction; move HTTP access and reusable business logic to services/facades as appropriate.
- Prefer Angular DI with `inject()`, standalone APIs, and the project's established reactive patterns. Do not introduce state libraries or architectural layers without need.
- Avoid circular dependencies and cross-feature imports of private implementation details.

## API and Services
- Read `README.md` `## API` section for the Swagger/OpenAPI URL. Use the spec as the source of truth for endpoints, HTTP methods, DTOs, parameters, and response types. If inaccessible or ambiguous, ask; never invent contracts.
- Before creating a service, inspect existing services, shared API clients, models, interceptors, and API configuration.
- Reuse common HTTP behavior. When duplication is real, extract the smallest generic, type-safe API client with configurable endpoints, query parameters, and bodies. Do not create identical CRUD wrappers for every resource.
- Add resource-specific services only when they provide meaningful domain behavior or a useful typed API. Do not force all endpoints into one domain service.
- Reuse environment-based API configuration and existing auth/error interceptors. Do not duplicate headers, token handling, or global error processing in services.
- Use typed requests/responses and `Observable<T>`; avoid `any` unless an external contract genuinely requires it. Keep DTOs consistent with the spec.

### API Response Types
- Never use unconstrained generic response types in resource-specific services as a substitute for known DTOs.
- Resolve response schemas from OpenAPI, including referenced components.
- If missing, inspect existing types and API consumers.
- If still unknown, inspect a real API response using an authorized, safe read-only request.
- Generate DTOs only from verified schemas or responses.
- Never invent response fields or silently use `any`.
- Report unresolved response types and request a sample response when necessary.

## Dependencies and Configuration
- Check installed dependencies and existing utilities first. If none fits, recommend a suitable package with rationale; **do not install it without explicit approval**.
- Never hardcode secrets, credentials, or environment-specific URLs. Preserve existing configuration conventions.

## Localization
- Follow the project's existing multilingual data model and i18n conventions.
- If an API returns text for only one language, leave other language values empty; never generate or infer translations unless explicitly requested.

## Quality and Delivery
- Preserve existing naming, formatting, lint rules, and file placement conventions.
- Handle errors at the appropriate layer; avoid swallowed errors and duplicate handling.
- Run relevant available checks (typecheck, lint, tests) when feasible; report anything not run.
- Summarize changed files, architectural decisions, and any unresolved Swagger ambiguities briefly.
