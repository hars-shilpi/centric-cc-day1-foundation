# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` or `npm ci` — Install dependencies
- `npm run dev` — Start API in dev mode with ts-node (port 3000, override with `PORT=<number>`)
- `npm run build` — Compile TypeScript to `dist/`
- `npm start` — Run compiled app from `dist/index.js`
- `npm test` — Run Jest test suite
- `npm run test:cov` — Run tests with coverage
- `npm run lint` — Run ESLint

## Architecture

TaskFlow API is a task-management REST service (Node 20, Express, TypeScript). Entry point: `src/index.ts` exports `createApp()` and starts the server on port 3000.

**Three layers:**

1. **Routes** (`src/routes/*.ts`): HTTP handlers using Express Router. Routes under `/tasks` require auth via `requireAuth` middleware from `src/routes/auth.ts`, which parses `Authorization: Bearer <userId>` headers and sets `req.userId`.

2. **Services** (`src/services/*.ts`): Business logic (e.g. `taskService.list()`, `taskService.create()`). Routes call services, never repos directly.

3. **Repository** (`src/repo/taskRepo.ts`): In-memory data store. Only accessed via services.

**Utilities** (`src/util/*.ts`): Validation helpers, date/money formatting.

## Conventions

**Error responses**: All errors use the envelope shape:
```json
{ "error": { "code": "<string>", "message": "<string>", "details?": <any> } }
```
Use `errorEnvelope()` helper from `src/util/validate.ts` or throw `ValidationError` (caught by Express error handler in `index.ts`).

**Validation**: Use helpers from `src/util/validate.ts`:
- `requireString(value, fieldName)` — non-empty string
- `requireNumber(value, fieldName)` — number
- `requireISODate(value, fieldName)` — ISO date string
- `optionalString/optionalNumber()` — nullable versions
- `requireOneOf(value, fieldName, allowedArray)` — enum validation

Validation errors throw `ValidationError` with code `'INVALID_FIELD'`.

**HTTP status codes**:
- 200 GET/PATCH success
- 201 POST success
- 400 validation error (code: `INVALID_FIELD`)
- 401 missing/invalid auth (code: `UNAUTHENTICATED`, set by `requireAuth`)
- 403 authorization failure (code: `FORBIDDEN`; check ownership before responding)
- 404 not found (code: `NOT_FOUND`)
- 500 unexpected error (code: `INTERNAL_ERROR`)

**Authorization**: GET/PATCH handlers must verify both existence (404) and ownership (403) before responding. Example: `if (task.userId !== req.userId) res.status(403).json(errorEnvelope('FORBIDDEN', ...))`.

**Testing**: Jest tests in `tests/` use supertest to make HTTP requests to `createApp()`. Tests do NOT mock services; they hit the in-memory repo through the full stack. Use `{ Authorization: 'Bearer <userId>' }` header in test requests.

**TypeScript**: Strict mode enabled. Unused parameters prefixed with `_` (eslint rule enforces it).

## Do Not Touch

- `src/repo/taskRepo.ts` — Internal repo layer; routes/services access data only through services.
- `src/legacy/reportBuilder.ts` — Experimental/deprecated code; do not integrate.
- `tests/__snapshots__/` — Auto-generated; do not edit by hand.
