# Material Lab Branding Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Rename the product-facing project identity to Material Lab, update the local and GitHub repository metadata, and remove Chinese-edition branding from current project descriptions while preserving the existing Chinese interface and simulation behavior.

**Architecture:** Keep the Rust/WASM crate and simulation identifiers unchanged; the rename is an application/repository metadata and copy change. Product-facing identity is updated at the repository, npm, HTML, PWA, React header, About view, and README layers, while historical design and review documents remain unchanged.

**Tech Stack:** Node.js 20.17+ or 22.9+, npm 11.19.0, React 16, Webpack 5, Rust/WASM, WebGL, GitHub CLI.

## Global Constraints

- Product name is exactly Material Lab.
- GitHub repository slug is exactly Zes45-ux/material-lab.
- npm package name is exactly material-lab.
- Canonical description is exactly: A standalone falling-sand sandbox for exploring pixel materials and physical reactions, built with Rust/WASM, WebGL, and JavaScript.
- Preserve the existing Chinese interface, material labels, simulation behavior, routes, and build workflow.
- Preserve original Sandspiel and WebGL fluid simulation attribution and license information.
- Do not rewrite historical design, research, review, or implementation-plan documents.

---

## File Map

- tests/standalone-ui.test.cjs — contract tests for package, HTML, manifest, header, and About branding.
- package.json — npm package identity and repository URL.
- package-lock.json — lockfile root package identity.
- README.md — primary project description and local development guide.
- manifest.json — PWA display name.
- index.html — document title and search/social description.
- js/components/ui.js — visible application brand in the top bar.
- js/components/info.js — visible About-page brand heading.
- GitHub repository settings — repository name and GitHub description.

## Task 1: Add failing branding contracts

Files:
- Modify: tests/standalone-ui.test.cjs

Interfaces:
- Consumes: current project metadata and rendered source strings through the existing read() helper.
- Produces: assertions that later implementation tasks must satisfy for the exact Material Lab identity.

- [ ] Step 1: Add a package metadata contract

Insert this test after the repository uses one reproducible npm workflow test:

    test("project metadata uses the Material Lab identity", () => {
      const pkg = JSON.parse(read("package.json"));
      const lock = JSON.parse(read("package-lock.json"));
      const description = "A standalone falling-sand sandbox for exploring pixel materials and physical reactions, built with Rust/WASM, WebGL, and JavaScript.";

      assert.equal(pkg.name, "material-lab");
      assert.equal(pkg.description, description);
      assert.equal(pkg.repository.url, "git+https://github.com/Zes45-ux/material-lab.git");
      assert.equal(lock.name, "material-lab");
      assert.equal(lock.packages[""].name, "material-lab");
    });

- [ ] Step 2: Change existing UI expectations to the approved identity

Update the existing assertions in tests/standalone-ui.test.cjs as follows:

    assert.match(ui, /<strong>Material Lab<\/strong>/);
    assert.match(info, /<h1>Material Lab<\/h1>/);
    assert.match(html, /<title>Material Lab<\/title>/);
    assert.match(html, /A standalone falling-sand sandbox for exploring pixel materials and physical reactions/);
    assert.equal(manifest.name, "Material Lab");
    assert.equal(manifest.short_name, "Material Lab");

The current assertions for lang="zh-CN", Chinese controls, material labels, and translated material details remain unchanged.

- [ ] Step 3: Run the focused contracts and verify they fail before implementation

Run:

    node --test tests/standalone-ui.test.cjs --test-name-pattern="Material Lab|static shell|information page"

Expected: FAIL because the current package, HTML, manifest, and visible headings still use sandtable or 像素炼金术.

- [ ] Step 4: Commit the red tests

    git add tests/standalone-ui.test.cjs
    git commit -m "test: assert Material Lab branding"

## Task 2: Update local product identity and documentation

Files:
- Modify: package.json
- Modify: package-lock.json
- Modify: README.md
- Modify: manifest.json
- Modify: index.html
- Modify: js/components/ui.js
- Modify: js/components/info.js

Interfaces:
- Consumes: the exact names and description from the global constraints.
- Produces: consistent product-facing identity across the app and repository files without changing simulation code or the Chinese UI language.

- [ ] Step 1: Update package and PWA metadata

Set these exact package values:

    "name": "material-lab",
    "description": "A standalone falling-sand sandbox for exploring pixel materials and physical reactions, built with Rust/WASM, WebGL, and JavaScript.",
    "repository": {
      "type": "git",
      "url": "git+https://github.com/Zes45-ux/material-lab.git"
    }

Change both name fields in package-lock.json (the root name and packages[""].name) to material-lab. Change manifest.json fields name and short_name to Material Lab.

- [ ] Step 2: Update the HTML shell metadata

In index.html, keep lang="zh-CN" because the existing interface remains Chinese, set the description to the canonical description, and set the title to Material Lab:

    <meta
      name="description"
      content="A standalone falling-sand sandbox for exploring pixel materials and physical reactions, built with Rust/WASM, WebGL, and JavaScript."
    />
    <title>Material Lab</title>

- [ ] Step 3: Update visible application branding

In js/components/ui.js, replace the top-bar brand block with:

    <div className="brand-lockup">
      <span className="brand-mark" aria-hidden="true">
        M
      </span>
      <div>
        <strong>Material Lab</strong>
        <span>材料实验台</span>
      </div>
    </div>

In js/components/info.js, change only the top heading to:

    <h1>Material Lab</h1>

Keep the original-author links, material guide, and Chinese interface copy intact.

- [ ] Step 4: Rewrite the root README around the new project identity

Replace README.md with this content:

    # Material Lab

    Material Lab is a standalone falling-sand sandbox for exploring pixel materials and physical reactions, built with Rust/WASM, WebGL, and JavaScript.

    Draw with sand, water, plants, fire, and other materials on a pixel canvas. Pause the simulation, undo a change, reset the scene, or use wind to see how materials interact.

    The project runs locally without an account, cloud backend, community service, advertising, or telemetry. The production build is a static site that can be deployed to any static file host.

    ![Material Lab screenshot](Screenshot.png)

    ## Requirements

    - A modern browser with WebAssembly support
    - Node.js ^20.17.0 || >=22.9.0 and npm (npm@11.19.0 is pinned by the repository)
    - [Rust and rustup](https://rustup.rs/)
    - [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

    Check the toolchain before starting:

        node --version
        npm --version
        rustup --version
        wasm-pack --version

    ## Run locally

    From the repository root:

        npm install
        npm test
        npm run build
        npm run start

    The test command runs source contracts and a temporary production-build check. The build command writes deployable static files to dist/. The start command keeps a local development server running; use another terminal for additional commands while it is active.

    The repository includes a precompiled WebAssembly package in crate/pkg/, so the default build does not require a local Rust linker. After changing Rust code, rebuild the package before building the web app:

        wasm-pack build --target bundler
        npm run build

    ## Build and deploy

    The committed package-lock.json is the canonical dependency lockfile; use npm rather than pnpm or Yarn. Webpack compiles the front end and packages the checked-in Rust/WASM output into dist/. The generated index.html, JavaScript bundle, WebAssembly, and local assets can be served by any static file server.

    The build works at a domain root or under a subpath. It generates index.html entries for the info/ and bench/ routes, so a static server does not need backend rewrite rules for those paths.

    ### Vercel

    Vercel build machines do not need Rust for the default deployment because crate/pkg/ contains the precompiled WebAssembly package. If Rust code changes, run wasm-pack build --target bundler locally and commit the updated crate/pkg/ files before deploying.

    ## Architecture

    - crate/ contains the Rust simulation and WebAssembly package.
    - js/ contains the React controls, WebGL renderer, fluid simulation, material data, and shaders.
    - webpack.config.js builds the static application and copies the local assets.
    - tests/ contains source contracts and production packaging checks.

    ## Attribution

    Material Lab is derived from [Sandspiel](https://github.com/maxbittker/sandspiel), created by [Max Bittker](https://maxbittker.com). Sandspiel is a falling-sand game built with Rust/WASM, WebGL, and JavaScript, inspired in part by ha55ii's [Powder Game](https://dan-ball.jp/en/javagame/dust/). See [Making Sandspiel](https://maxbittker.com/making-sandspiel) for the original design and development background.

    The fluid simulation is adapted from [PavelDoGreat/WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation).

    ## License

    This project uses the [MIT License](LICENSE). Preserve the license and copyright notices when using, copying, or distributing the project.

- [ ] Step 5: Run the focused contracts and verify they pass

Run:

    node --test tests/standalone-ui.test.cjs --test-name-pattern="Material Lab|static shell|information page"

Expected: PASS for the new metadata and visible-brand assertions, with the existing Chinese-interface assertions still passing.

- [ ] Step 6: Commit the local identity changes

    git add package.json package-lock.json README.md manifest.json index.html js/components/ui.js js/components/info.js
    git commit -m "feat: rebrand project as Material Lab"

## Task 3: Rename the GitHub repository and synchronize the remote

Files:
- Modify: local Git remote configuration only; no tracked source files.
- GitHub settings: repository name and description.

Interfaces:
- Consumes: authenticated GitHub CLI session for Zes45-ux and the local repository at main.
- Produces: GitHub repository Zes45-ux/material-lab, with the canonical description and a local origin URL matching it.

- [ ] Step 1: Rename the GitHub repository

Run:

    gh repo rename -R Zes45-ux/sandspiel-zh material-lab --yes

Expected: GitHub reports the repository was renamed and redirects the old URL.

- [ ] Step 2: Set the GitHub repository description

Run:

    gh repo edit Zes45-ux/material-lab --description "A standalone falling-sand sandbox for exploring pixel materials and physical reactions, built with Rust/WASM, WebGL, and JavaScript."

- [ ] Step 3: Update and verify the local remote

Run:

    git remote set-url origin https://github.com/Zes45-ux/material-lab.git
    git remote get-url origin
    gh repo view Zes45-ux/material-lab --json name,description,url

Expected: origin is https://github.com/Zes45-ux/material-lab.git, the repository name is material-lab, and the GitHub description equals the canonical description.

## Task 4: Run full verification and finish cleanly

Files:
- Read-only verification of all product-facing files and build output.

Interfaces:
- Consumes: completed local identity changes and synchronized GitHub metadata.
- Produces: passing automated tests, a successful production build when dependencies are installed, and evidence that stale Chinese-edition branding is absent from product-facing files.

- [ ] Step 1: Run the complete test suite

Run:

    npm test

Expected: all tests pass. If dependencies are not installed, run npm install first and repeat the test command.

- [ ] Step 2: Run the production build

Run:

    npm run build

Expected: Webpack exits successfully and writes dist/ without changing the tracked source tree.

- [ ] Step 3: Search product-facing files for stale branding

Run:

    rg -n -i "sandspiel-zh|standalone-zh|中文版|独立中文版|像素炼金术" README.md package.json package-lock.json manifest.json index.html js tests plan.md vercel.json webpack.config.js crate

Expected: no matches for stale product branding. Sandspiel attribution links, Rust crate identifiers, environment variable names, and historical documents outside this product-facing set are intentionally preserved.

- [ ] Step 4: Verify final Git state

Run:

    git status --short --branch
    git log --oneline -4
    git remote -v

Expected: main has only the intended commits, origin points to Zes45-ux/material-lab, and no unrelated files are modified.
