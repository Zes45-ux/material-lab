# Vercel Analytics and Speed Insights Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vercel Web Analytics and Speed Insights to the existing Webpack browser entrypoint without changing the app's UI or runtime behavior.

**Architecture:** Install both Vercel browser SDKs as direct dependencies. Initialize their generic browser injection APIs in `js/bootstrap.js` before the existing dynamic import of `js/index.js`, so tracking starts before the application initializes and remains independent of the React render tree.

**Tech Stack:** Webpack 5, Babel, React 16, pnpm, `@vercel/analytics`, `@vercel/speed-insights`.

---

### Task 1: Add the Vercel SDK dependencies

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Install the two runtime packages**

Run from `C:\Users\Zes\Documents\ChatGPT\New project\sandspiel`:

```powershell
pnpm add @vercel/analytics @vercel/speed-insights
```

Expected result: `pnpm` exits with code 0 and updates `package.json` plus `pnpm-lock.yaml` without changing the existing dependency set.

- [ ] **Step 2: Confirm both packages are recorded as direct dependencies**

Run:

```powershell
rg -n '"@vercel/(analytics|speed-insights)"' package.json
rg -n '@vercel/(analytics|speed-insights)' pnpm-lock.yaml
```

Expected result: each package appears in `package.json` and in the lockfile.

### Task 2: Initialize both SDKs from the browser bootstrap

**Files:**
- Modify: `js/bootstrap.js`

- [ ] **Step 1: Add the generic browser imports and calls**

Place the SDK imports at the top of `js/bootstrap.js`, and call both functions before the existing dynamic import:

```js
import { inject as injectAnalytics } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";

injectAnalytics();
injectSpeedInsights();

// A dependency graph that contains any wasm must all be imported
// asynchronously. This `bootstrap.js` file does the single async import, so
// that no one else needs to worry about it again.
import("./index.js").catch(e =>
  console.error("Error importing `index.js`:", e)
);
```

The existing dynamic import and error handler must remain unchanged apart from moving it below the two initialization calls. Do not add manual tracking scripts to `index.html`.

- [ ] **Step 2: Confirm each SDK is initialized exactly once**

Run:

```powershell
rg -n 'injectAnalytics|injectSpeedInsights|@vercel/(analytics|speed-insights)' js/bootstrap.js
```

Expected result: one import and one invocation for each SDK, with no duplicate initialization in other source files.

### Task 3: Verify the production bundle and worktree scope

**Files:**
- Inspect: `package.json`
- Inspect: `pnpm-lock.yaml`
- Inspect: `js/bootstrap.js`
- Inspect: `dist/`

- [ ] **Step 1: Run the production build**

Run:

```powershell
pnpm build
```

Expected result: Webpack exits with code 0 and emits the production bundle into `dist/`.

- [ ] **Step 2: Check the diff for whitespace errors**

Run:

```powershell
git diff --check
```

Expected result: no output and exit code 0.

- [ ] **Step 3: Verify the final change scope**

Run:

```powershell
git status --short
git diff -- package.json pnpm-lock.yaml js/bootstrap.js
```

Expected result: only the two dependency files and `js/bootstrap.js` are changed by this feature; existing unrelated files remain unstaged and untouched.

