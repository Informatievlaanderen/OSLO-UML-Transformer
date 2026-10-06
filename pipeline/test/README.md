# Pipeline Integration Tests

Runs the full CI publication process end-to-end against a fixed set of
specifications, then asserts on the produced artifacts. This is distinct from
the per-package Jest unit tests in `packages/*`, which exercise individual
generators in isolation.

## Prerequiites

1. **Build the Docker image** (from the repo root):
   ```bash
   make -C pipeline build
   ```
   
## How it works

The harness (`run.sh`) mirrors the CircleCI job sequence:

1. **checkout** — `checkoutRepositories.sh` clones the pinned spec repos and
   writes `checkouts.txt`.
2. **extract** — `extract-what-4.sh` converts UML to intermediate JSON-LD.
3. **render** — `render-details4.sh` runs each generator step
   (`html`, `rdf`, `shacl`, `context`, `swagger`, `validation`, `metadata`,
   `translation`, `merge`).
4. **bundle** — `copy_resources_to_urlref.sh` copies artifacts to URL paths.
5. **artifacts** — asserts `index.html` (and other outputs) exist.

## Configuration

| File | Purpose |
| --- | --- |
| `specs.json` | The fixed set of specifications under test (repository, pinned `branchtag`, type, urlref). |
| `config.json` | Toolchain config (`primeLanguage`, `hostname`, `publicationpoints`, strictness…). |
| `lib/assert.sh` | Assertion helpers (`assert_file_exists`, `assert_contains`, `assert_exit`, …). |

## Running

```bash
# Full run (all steps)
make -C pipeline test-pipeline
```

Or directly:

```bash
./pipeline/test/run.sh            # all steps
./pipeline/test/run.sh rdf        # single step
./pipeline/test/run.sh all /path/to/out   # all steps, custom output dir
OUTPUT_DIR=/path/to/out ./pipeline/test/run.sh   # custom output dir via env
WORKSPACE=/tmp/my-space ./pipeline/test/run.sh   # custom workspace (legacy)
```

The output directory (where all generated assets are written) can be set three
ways, in order of precedence:

1. Positional argument 2: `./pipeline/test/run.sh all /path/to/out`
2. `OUTPUT_DIR` env var: `OUTPUT_DIR=/path/to/out ./pipeline/test/run.sh`
3. `WORKSPACE` env var (legacy): `WORKSPACE=/path/to/out ./pipeline/test/run.sh`

Or via make:

```bash
make -C pipeline test-pipeline OUTPUT_DIR=/path/to/out
```

## Adding a specification to the test set

Append an entry to `specs.json`:

```json
{
  "name": "my-spec",
  "repository": "https://github.com/<org>/<repo>",
  "branchtag": "<pinned-commit-or-tag>",
  "type": "ap",
  "urlref": "/doc/applicatieprofiel/my-spec/Standaard/2024-01-01",
  "filename": "config/eap-mapping.json"
}
```

> **Pin `branchtag` to a commit SHA or tag**, not a moving branch, so the test
> stays deterministic.

## Notes

- The output directory defaults to `/tmp/oslo-pipeline-test` and is cleaned on
  each run. Override it (see above) to inspect a failed run (the harness leaves
  it in place on failure).
- `CIRCLE_BRANCH` is set to `test` inside the container, which keeps the
  bundling step non-strict (see `copy_resources_to_urlref.sh`).