# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are curious tinkerers who want to draw pixel materials, run experiments, and discover physical reactions in an open-ended sandbox. This audience and job are an assumption based on the repository defaults and were approved by the user.

Technical explorers and learners are secondary audiences when they want to inspect material behavior, demonstrate interactions, or check simulation performance. This is also an assumption based on the repository defaults and was approved by the user.

## Product Purpose

Material Lab is a standalone falling-sand sandbox for exploring pixel materials and physical reactions. It lets people draw into a living simulated world, pause or reset it, and observe gravity, fluids, heat, combustion, growth, and pressure interact. Success means a user can begin experimenting immediately, understand the result through direct visual feedback, and use the product without an account or online service. The product identity and purpose are confirmed from the repository defaults by the user.

## Positioning

The product is an open-ended pixel-material playground whose distinctive mechanism is direct drawing into a local Rust/WASM and WebGL simulation with many interacting material rules. It is positioned as a frictionless, self-contained lab for surprising material interactions rather than a level-based game or a cloud service. This positioning is an assumption based on the repository defaults and was approved by the user.

## Operating Context

- People use the product in a modern WebAssembly-capable browser for short experiments, creative play, demonstrations, or performance checks.
- The main workflow is to choose a material, draw on the canvas, adjust brush size or wind, pause when useful, and reset or undo to try another experiment.
- The product is distributed as static files and can be hosted without a runtime backend, account system, community service, advertising, or telemetry.
- The interface currently uses Simplified Chinese labels while the product-facing identity is Material Lab.
- The application includes a material guide at `info/` and a performance page at `bench/`.

## Capabilities and Constraints

- Rust/WASM provides the simulation core; WebGL and JavaScript provide rendering, interaction, layout, and application controls.
- Materials include sand, water, snow, ice, stone, gas, oil, acid, plants, fungi, seeds, fire, lava, dust, gunpowder, rockets, and utility tools.
- Reactions include gravity, fluid flow, combustion, melting, freezing, corrosion, plant growth, and explosive pressure.
- Users can draw, erase, pause, undo, reset the scene, change wind, choose materials, and change brush size.
- The canonical build workflow uses npm and webpack. The checked-in Rust/WASM package supports the default build without requiring a local Rust linker.
- Production output must remain deployable as static files and support the existing root and subpath build behavior.
- The product must preserve the existing Chinese interface, simulation behavior, routes, build workflow, and original attribution unless the user explicitly changes those constraints.
- The product does not require or currently provide accounts, cloud persistence, a backend, community features, advertising, or telemetry.

## Brand Commitments

- Product name: `Material Lab`.
- Canonical description: “A standalone falling-sand sandbox for exploring pixel materials and physical reactions, built with Rust/WASM, WebGL, and JavaScript.”
- Product-facing copy should describe the current standalone Material Lab product rather than a Chinese edition or repository-specific legacy identity.
- Original Sandspiel attribution and the WebGL fluid simulation credit must remain visible in the appropriate documentation or About view, together with license notices.

## Evidence on Hand

- `README.md` and `README.zh-CN.md` document the product purpose, features, architecture, requirements, build, deployment, and attribution.
- `Screenshot.png` is an existing product screenshot.
- `index.html`, `js/`, `crate/src/`, and `crate/pkg/` contain the runnable web application, simulation source, and checked-in compiled WASM package.
- `js/material-info.json` and the material components provide the current material catalog and interaction copy.
- `tests/` contains source contracts and build, responsive, touch, and UI checks.
- `assets/` contains existing product icons, fonts, and local visual assets.
- No cloud dataset, customer testimonials, external product analytics, or community proof is present; future work must not fabricate any.

## Product Principles

1. Make experimentation immediate: the core loop should begin without sign-up, setup, or online dependencies.
2. Let cause and effect stay visible: material rules should be experienced through direct manipulation and observable reactions.
3. Preserve open-ended discovery: the sandbox should support playful combinations rather than prescribe a single correct outcome.
4. Keep the product self-contained and portable: static deployment and local execution are durable constraints.
5. Respect provenance: preserve Sandspiel, fluid-simulation, license, and copyright attribution as part of the product record.

## Accessibility & Inclusion

The current interface includes visible focus states, a labelled simulation canvas, responsive layouts, and touch-oriented mobile controls. No formal conformance target or additional product-specific accessibility requirement has been confirmed; future work should preserve these affordances and record any explicit standard when one is chosen.
