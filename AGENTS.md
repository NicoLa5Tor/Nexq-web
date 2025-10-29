# Repository Guidelines

## Project Structure & Key Modules
Source lives in `src/app`, organized by feature folders (e.g., `home`, `services-overview`, `animations`). Shared services reside in `src/services`, and static assets go under `src/assets`. Global styling is managed through `src/styles.scss` alongside component-level SCSS. Server-side rendering is configured via `server.ts` and the built output lands in `dist/` after production builds.

## Build, Test, and Local Development
Install dependencies with `npm install` once. Use `npm start` for the Angular dev server, which serves the SPA with live reload. Run `npm run build` for a production build, or `npm run watch` when you need incremental rebuilds. Execute `npm run serve:ssr:NEXQ` after a build to verify the SSR bundle. Keep the code linted with `npm run lint` before opening pull requests.

## Coding Style & Naming Conventions
The project uses TypeScript, HTML, and SCSS with a two-space indentation standard. Follow Angular component patterns: components and directives in PascalCase filenames, selectors prefixed with `app-`, and services in camelCase with the `.service.ts` suffix. Utility logic belongs in dedicated services or directives; avoid sprawling components. ESLint (see `eslint.config.js`) and Angular ESLint rules enforce formatting—fix issues locally with `npm run lint -- --fix` when practical.

## Testing Guidelines
Unit tests use Jasmine and Karma; colocate specs next to their subjects with the `.spec.ts` suffix. Run the full suite via `npm test` before pushing. Add focused tests for new directives, animations, or services to keep regressions out. Aim to cover edge cases around scroll/animation behavior, as these are common change points.

## Commit & Pull Request Guidelines
Commit messages favor Conventional Commits—use prefixes like `feat:`, `fix:`, or `chore:` followed by a concise summary (e.g., `fix: ensure services CTA visible`). Group related changes and keep commits scoped. PRs should include a clear summary, linked issue or ticket, and test evidence (`npm test`, `npm run lint`). Attach screenshots or screen recordings for UI-facing updates, especially animations or layout shifts.
