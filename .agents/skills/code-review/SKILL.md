---
name: code-review
description: Review Angular/TypeScript changes for correctness, security, maintainability, and performance without editing files. Use for code reviews, PR reviews, or audits.
---

Review the requested diff or files; if unspecified, review uncommitted changes (`git diff` and staged diff). Read relevant `AGENTS.md` instructions and nearby code before judging.

Prioritize:
1. Bugs, regressions, incorrect API contracts, and edge cases.
2. Security, data exposure, authentication, and unsafe inputs.
3. Angular/RxJS issues: subscriptions, lifecycle, change detection, routing, DI, and HTTP handling.
4. Type safety, duplicated logic, unnecessary abstractions, and performance.

Check behavior against Swagger/OpenAPI linked in `README.md` when API code is affected. Respect existing architecture and dependencies. Do not flag subjective style already enforced by tooling. Do not modify files unless explicitly asked.

Report only actionable findings, ordered by severity (`P0` critical to `P3` minor). For each: `priority | file:line | issue | impact | suggested fix`. Cite exact lines and avoid speculative claims; distinguish uncertainties. If none, say "No actionable findings" and mention remaining test gaps. Keep the summary brief. Run relevant checks when feasible and report what ran; never claim unrun checks passed.
