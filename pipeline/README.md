# Pipeline — OSLO Publication Toolchain

This directory contains the CI/CD pipeline scripts and Docker image definition for the OSLO publication toolchain. It is the **single source of truth** for the orchestration logic that was previously duplicated across multiple repositories and branches.

## Purpose

The pipeline scripts handle all steps of the publication workflow:

1. **Checkout** — Find which publication points changed, clone source repositories
2. **Extract** — Convert UML diagrams to intermediate JSON-LD
3. **Translate** — Generate, autotranslate, and merge translation files
4. **Render** — Generate HTML, RDF, SHACL, JSON-LD context, Swagger, Respec
5. **Validate** — Validate JSON-LD output
6. **Bundle** — Copy generated artefacts to the correct URL paths
7. **Report** — Generate overview reports with weather icons
8. **Deploy** — Push results to the generated repository

## Directory structure

```
pipeline/
├── Dockerfile.circleci     # Builds the pipeline Docker image (multi-platform)
├── README.md               # This file
├── Makefile                # Build/publish shortcuts (mirrors OSLO-SpecificationGenerator style)
├── .gitignore
└── scripts/                # Shell scripts (the orchestration logic)
    ├── render-details4.sh
    ├── ....

```

## Usage

### Building the Docker image

Build for the current platform:

```bash
docker build -t informatievlaanderen/oslo-pipeline:4.1.1 -f pipeline/Dockerfile.circleci .
```

Build multi-platform (amd64 + arm64) and push:

```bash
docker buildx build --platform=linux/amd64,linux/arm64 \
  -f pipeline/Dockerfile.circleci \
  -t informatievlaanderen/oslo-pipeline:4.1.1 \
  --push .
```

## Testing

Run the full integration test suite (checkout → extract → render → validate → bundle) against a pinned set of specifications:

```bash
make test
```

The test harness uses the config and specs in `test/`. Generated artefacts are written to `/tmp/oslo-pipeline-test/` by default. Set `OUTPUT_DIR` to use a different location:

```bash
make test OUTPUT_DIR=/tmp/my-test-output
```

Requires a GitHub token with read access to the specification repositories. Set it as `TOOLCHAIN_TOKEN` or `CI_TOKEN` before running.
