# Material Lab Branding and Project Description

## Goal

Reposition the project from the repository-specific `sandspiel-zh` identity to
`Material Lab`, a standalone falling-sand sandbox for exploring pixel materials
and physical reactions. Product-facing names and descriptions should describe
the current local Rust/WASM, WebGL, and JavaScript application without framing
it as a Chinese edition.

## Naming

- Product name: `Material Lab`
- GitHub repository slug: `material-lab`
- npm package name: `material-lab`
- Canonical description: `A standalone falling-sand sandbox for exploring pixel materials and physical reactions, built with Rust/WASM, WebGL, and JavaScript.`
- Original Sandspiel attribution remains in the README and About view because
  the project is derived from that codebase.

## Scope

### Product-facing metadata and documentation

- Rename the GitHub repository to `Zes45-ux/material-lab` and update the local
  `origin` URL after the remote rename.
- Update `package.json` and the root package entry in `package-lock.json` with
  the new package name, description, and repository URL.
- Update the HTML title and description plus the PWA manifest name and short
  name.
- Rewrite the root README around the new product identity, local development
  workflow, architecture, deployment notes, attribution, and license.
- Update the visible app brand and About heading so they no longer present the
  application as `sandspiel-zh` or a named Chinese edition.

### Preserved behavior and history

- Keep the existing Chinese interface, material labels, simulation behavior,
  routes, and build workflow unchanged.
- Keep historical design, research, and review documents intact; they record
  the project history and are not product-facing branding.
- Keep the original Sandspiel and WebGL fluid simulation credits and license
  information.

## Validation

- Run the existing automated test suite.
- Run a production build if the local toolchain is available.
- Search product-facing files for `sandspiel-zh`, `standalone-zh`, `中文版`,
  and `独立中文版`; historical documents may retain these terms by design.
- Confirm the GitHub remote points to `Zes45-ux/material-lab` and the working
  tree is clean apart from the intended implementation commit(s).
