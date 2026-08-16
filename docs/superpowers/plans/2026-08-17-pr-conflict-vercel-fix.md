# Material Lab PR Conflict and Vercel Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebase the material-lab UI work onto the current standalone Chinese `main`, remove the Git conflict, and make the same PR deploy successfully on Vercel.

**Architecture:** Keep the standalone runtime and its checked-in Rust/WASM package as the source of truth. Port the material-lab presentation into the standalone React shell: centered canvas stage, left material rail, right material inspector with overview/reaction tabs, and no legacy info entry. Make deployment deterministic with one npm lockfile, explicit Vercel output settings, and a webpack branch that never invokes Cargo on Vercel.

**Tech Stack:** React 16, webpack 5, Rust/WASM via wasm-pack, Node test runner, Vercel static deployment.

---

### Task 1: Establish the rebased fix branch

**Files:**
- Modify: Git history only; start from `github/main` in the isolated worktree.

- [ ] Create `codex/material-lab-ui-fix` from the fetched `github/main` reference.
- [ ] Run `npm test` before changing production files and record the clean baseline.

### Task 2: Add failing regression contracts

**Files:**
- Modify: `tests/standalone-ui.test.cjs`

- [ ] Add assertions that the repository has only `package-lock.json`, `vercel.json`, checked-in `crate/pkg`, and a Vercel webpack branch that omits `WasmPackPlugin`.
- [ ] Add assertions for the new material-lab shell: `#canvas-stage`, `.material-rail`, `.material-inspector`, `.inspector-tab`, and no legacy `说明` link or remote analytics/ad runtime.
- [ ] Run `npm test` and confirm the new contracts fail for the expected missing UI/build behavior.

### Task 3: Port the material-lab UI onto the standalone shell

**Files:**
- Create: `js/components/materials.js`
- Modify: `index.html`
- Modify: `js/app.js`
- Modify: `js/components/ui.js`
- Modify: `js/layout.js`
- Modify: `js/styles.css`

- [ ] Keep the standalone simulation imports and controls, but render the centered `canvas-stage`, left material groups, brush controls, and right inspector.
- [ ] Use `materials.js` for material labels, categories, introductions, notes, and reaction rows.
- [ ] Remove the visible legacy info entry and all remote runtime/ad scripts while retaining local assets only.
- [ ] Run the focused UI contract tests and then the full test suite.

### Task 4: Repair deterministic Vercel packaging

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `webpack.config.js`
- Modify: `vercel.json`
- Modify: `.gitignore`
- Create or update: `crate/pkg/*` from `wasm-pack build --target bundler`

- [ ] Use npm as the only package manager and remove `pnpm-lock.yaml` and `yarn.lock` from the fix branch.
- [ ] Preserve `vercel.json` with `npm run build` and `dist` output.
- [ ] Skip wasm-pack when `VERCEL` is set and require the checked-in WASM package at build time.
- [ ] Regenerate `package-lock.json` after keeping the analytics dependencies needed by the UI branch.
- [ ] Run the local Vercel-mode webpack build with `VERCEL=1` and verify it does not call Cargo.

### Task 5: Verify, publish, and update PR #2

**Files:**
- Modify: Git history and remote PR branch only.

- [ ] Run `npm test`, `npm run build`, and a Vercel-mode build with fresh output and zero errors.
- [ ] Push the verified fix history to `github/codex/material-lab-ui` with `--force-with-lease` so PR #2 uses the rebased branch.
- [ ] Re-read PR #2, confirm `mergeable` is no longer conflicted, and inspect the new Vercel preview check.
