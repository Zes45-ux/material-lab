# Vercel Analytics and Speed Insights Integration

## Goal

Add Vercel Web Analytics and Vercel Speed Insights to the Sandspiel browser application so production deployments can report page views and Core Web Vitals in the Vercel dashboard.

## Scope

### In scope

- Add `@vercel/analytics` and `@vercel/speed-insights` as runtime dependencies.
- Initialize both SDKs from the existing Webpack entrypoint before the application bundle is loaded.
- Use the generic browser APIs because this project is a React 16 application bundled by Webpack, not a Next.js application.
- Preserve the existing Google Analytics, Sentry, Firebase, advertising, routing, and rendering behavior.
- Verify that the production Webpack build still succeeds.

### Out of scope

- Replacing or removing the existing Google Analytics or Sentry integrations.
- Adding custom events, user identifiers, or custom route parameter handling.
- Changing any visible UI or simulation behavior.
- Enabling the features in the Vercel dashboard or deploying the project; those actions require the project owner account.

## Design

`js/bootstrap.js` is the earliest browser entrypoint and already gates the asynchronous import of `js/index.js`. It will import and call:

- `inject` from `@vercel/analytics`, aliased as `injectAnalytics`.
- `injectSpeedInsights` from `@vercel/speed-insights`.

The calls will run before the dynamic application import. The SDKs handle browser detection and development-mode behavior, while production Vercel deployments resolve their tracking endpoints through Vercel's standard paths. No manual script tags or duplicate HTML tracking snippets will be added.

## Data flow

1. The browser loads the Webpack bootstrap bundle.
2. The two SDKs enqueue their tracking functions and add their deferred scripts when appropriate.
3. The app imports and starts its existing WASM, React, canvas, and routing code.
4. Vercel receives page-view and performance data after Web Analytics and Speed Insights are enabled for the deployed project.

## Verification

- `package.json` lists both packages.
- The package lock used by the project records both packages.
- `js/bootstrap.js` imports and invokes both generic APIs exactly once.
- `pnpm build` exits successfully.
- `git diff --check` reports no whitespace errors.
- Existing unrelated worktree changes remain untouched.

