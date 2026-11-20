#!/bin/bash
# Pipeline integration test harness.
#
# Runs the full CI process (checkout → extract → render → validate → bundle)
# against a fixed set of pinned specifications, then asserts on the produced
# artifacts.
#
# Requires:
#   - the pipeline Docker image built (see pipeline/Makefile: `make build`)
#   - a GitHub token with access to the spec repositories (env var TOOLCHAIN_TOKEN,
#     or CI_TOKEN for public repos). Set it before running, e.g.:
#       export TOOLCHAIN_TOKEN="ghp_..."
#
# Usage:
#   ./pipeline/test/run.sh                 # run all steps
#   ./pipeline/test/run.sh rdf             # run only the rdf step
#   STEP=rdf ./pipeline/test/run.sh        # alternative: via env var
#   ./pipeline/test/run.sh all /path/out   # run all steps, write assets to /path/out
#   OUTPUT_DIR=/path/out ./pipeline/test/run.sh   # alternative: via env var

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIPELINE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# --- configuration -----------------------------------------------------------
# Output directory for all generated assets. Precedence: positional arg 2 >
# OUTPUT_DIR env > WORKSPACE env > default /tmp/oslo-pipeline-test.
WORKSPACE="${2:-${OUTPUT_DIR:-${WORKSPACE:-/tmp/oslo-pipeline-test}}}"
STEP="${1:-${STEP:-all}}"
CI_TOKEN="${TOOLCHAIN_TOKEN:-${CI_TOKEN:-}}"
SPECS_JSON="${SCRIPT_DIR}/specs.json"
CONFIG_JSON="${SCRIPT_DIR}/config.json"

# Honour a user-supplied image, default to the locally built one.
IMAGE="${IMAGE:-oslo-pipeline}"

# Derive the container's view of the source-and-config mount. The orchestration
# scripts hardcode /tmp/workspace as the workspace root (see extract-what-4.sh),
# so mount the host workspace at that path inside the container.
CONTAINER_WORKSPACE="/tmp/workspace"

# --- helpers -----------------------------------------------------------------
die() { echo "ERROR: $*" >&2; exit 1; }

# Asserts a single docker invocation completed successfully.
run_in_container() {
    docker run --rm \
        -v "${WORKSPACE}:${CONTAINER_WORKSPACE}" \
        -e TOOLCHAIN_TOKEN="${CI_TOKEN}" \
        -e CIRCLE_BRANCH="test" \
        -e CIRCLE_WORKING_DIRECTORY="/usr/local/lib/pipeline" \
        -e AZURETRANSLATIONKEY="${AZURETRANSLATIONKEY:-dummy}" \
        "${IMAGE}" "$@"
}

# --- setup -------------------------------------------------------------------
# shellcheck disable=SC1091
. "${SCRIPT_DIR}/lib/assert.sh"

echo "==> Preparing workspace: ${WORKSPACE}"
rm -rf "${WORKSPACE}"
mkdir -p "${WORKSPACE}/config/test" "${WORKSPACE}/src" "${WORKSPACE}/target" "${WORKSPACE}/report4"

# Copy the test configuration and spec list into the workspace.
cp "${CONFIG_JSON}" "${WORKSPACE}/config/config.json"

# checkoutRepositories.sh takes a single JSON array as its publication config.
# Other scripts (copy_resources_to_urlref.sh, validate_publicationpoints.sh)
# discover *.publication.json files under config/<publicationpoints dir>, so
# derive that directory from config.json and place the merged array there.
PUBDIR_NAME="$(jq -r '.publicationpoints[0] // "test"' "${CONFIG_JSON}")"
PUBDIR="${WORKSPACE}/config/${PUBDIR_NAME}"
mkdir -p "${PUBDIR}"
cp "${SPECS_JSON}" "${PUBDIR}/publication.json"

# --- test: checkout ----------------------------------------------------------
start_test "checkout"
run_in_container checkoutRepositories.sh \
    "${CONTAINER_WORKSPACE}" \
    "${CONTAINER_WORKSPACE}/config/${PUBDIR_NAME}/publication.json" \
    "${CONTAINER_WORKSPACE}/config"
assert_exit 0 "$?"
assert_file_exists "${WORKSPACE}/checkouts.txt" "checkouts.txt written"
echo "checkouts.txt contents:"
cat "${WORKSPACE}/checkouts.txt" 2>/dev/null || true
end_test || CHECKOUT_FAILED=1

# --- test: upgrade-config ----------------------------------------------------
# Mirrors the CI "upgrade configs to this toolchain" step. upgrade_config-4.sh
# injects the `.translation[]` block (language/title/template/translationjson/
# mergefile) into each `.names.json`, which flows into the all-*.jsonld files.
# render_nunjucks_html resolves --rootTemplate from `.translation[].template`;
# without this step `.translation` is null and the html generator falls back to
# a default ap2.j2 that is not present, so no index.html is produced.
start_test "upgrade-config"
run_in_container upgrade_config-4.sh \
    "${CONTAINER_WORKSPACE}" \
    "${CONTAINER_WORKSPACE}/config"
assert_exit 0 "$?"
end_test || UPGRADE_FAILED=1

# --- test: autotranslate override -------------------------------------------
# The publication point config (data.vlaanderen.be2) may declare an
# "autotranslate" field to control machine translation per spec:
#   "autotranslate": false                    -> disable for all goal languages
#   "autotranslate": { "en": false, "fr": true } -> per-language control
# upgrade_config-4.sh must apply this override to .names.json so the
# autotranslate/merge/generate steps honour it.
# Runs in an isolated workspace so the synthetic spec does not pollute the
# main pipeline run.
start_test "autotranslate-override"
AT_WS="${WORKSPACE}/autotranslate-override-ws"
rm -rf "${AT_WS}"
mkdir -p "${AT_WS}/src/doc/autotranslate-override-test" "${AT_WS}/config"
cat > "${AT_WS}/src/doc/autotranslate-override-test/.publication-point.json" << 'EOF'
{
  "urlref": "/doc/autotranslate-override-test",
  "name": "autotranslate-override-test",
  "autotranslate": { "en": false, "fr": true }
}
EOF
cat > "${AT_WS}/src/doc/autotranslate-override-test/.names.json" << 'EOF'
[
  {
    "name": "autotranslate-override-test",
    "type": "voc",
    "eap": "Test.eap",
    "template": "test.j2",
    "title": "Test",
    "publication-state": "https://data.vlaanderen.be/id/concept/StandaardStatus/KandidaatStandaard",
    "publication-date": "2026-01-01",
    "translation": [
      { "language": "nl", "template": "test.j2", "title": "Test", "translationjson": "test_nl.json", "mergefile": "merge_test_nl.jsonld", "autotranslate": false },
      { "language": "en", "template": "test_en.j2", "title": "Test", "translationjson": "test_en.json", "mergefile": "merge_test_en.jsonld", "autotranslate": true },
      { "language": "fr", "template": "test_fr.j2", "title": "Test", "translationjson": "test_fr.json", "mergefile": "merge_test_fr.jsonld", "autotranslate": true }
    ]
  }
]
EOF
echo "doc/autotranslate-override-test" > "${AT_WS}/checkouts.txt"
cp "${CONFIG_JSON}" "${AT_WS}/config/config.json"
docker run --rm \
    -v "${AT_WS}:${CONTAINER_WORKSPACE}" \
    -e TOOLCHAIN_TOKEN="${CI_TOKEN}" \
    -e CIRCLE_BRANCH="test" \
    -e CIRCLE_WORKING_DIRECTORY="/usr/local/lib/pipeline" \
    -e AZURETRANSLATIONKEY="${AZURETRANSLATIONKEY:-dummy}" \
    "${IMAGE}" upgrade_config-4.sh "${CONTAINER_WORKSPACE}" "${CONTAINER_WORKSPACE}/config" >/dev/null 2>&1
assert_exit 0 "$?"
EN_AUTOTRANSLATE=$(jq -r ".[0].translation[] | select(.language==\"en\") | .autotranslate" "${AT_WS}/src/doc/autotranslate-override-test/.names.json")
FR_AUTOTRANSLATE=$(jq -r ".[0].translation[] | select(.language==\"fr\") | .autotranslate" "${AT_WS}/src/doc/autotranslate-override-test/.names.json")
if [ "${EN_AUTOTRANSLATE}" == "false" ] && [ "${FR_AUTOTRANSLATE}" == "true" ]; then
    echo "PASS: autotranslate override applied (en=${EN_AUTOTRANSLATE}, fr=${FR_AUTOTRANSLATE})"
else
    echo "FAIL: autotranslate override not applied (en=${EN_AUTOTRANSLATE}, fr=${FR_AUTOTRANSLATE})"
    AUTOTRANSLATE_OVERRIDE_FAILED=1
fi
end_test || AUTOTRANSLATE_OVERRIDE_FAILED=1

# --- test: autotranslate with spec prime language ----------------------------
# When a spec declares "languages": ["en", "nl"] and "autotranslate": {"nl": true},
# the spec's prime (en) must stay autotranslate=false (it is the source) while
# the goal language (nl) is autotranslated — even though nl is the GLOBAL prime.
start_test "autotranslate-spec-prime"
AT2_WS="${WORKSPACE}/autotranslate-spec-prime-ws"
rm -rf "${AT2_WS}"
mkdir -p "${AT2_WS}/src/doc/en-prime-spec" "${AT2_WS}/config"
cat > "${AT2_WS}/src/doc/en-prime-spec/.publication-point.json" << 'EOF'
{
  "urlref": "/doc/en-prime-spec",
  "name": "en-prime-spec",
  "languages": ["en", "nl"],
  "autotranslate": { "nl": true }
}
EOF
cat > "${AT2_WS}/src/doc/en-prime-spec/.names.json" << 'EOF'
[
  {
    "name": "en-prime-spec",
    "type": "voc",
    "eap": "Test.eap",
    "template": "test.j2",
    "title": "Test",
    "publication-state": "https://data.vlaanderen.be/id/concept/StandaardStatus/KandidaatStandaard",
    "publication-date": "2026-01-01",
    "translation": [
      { "language": "nl", "template": "test.j2", "title": "Test", "translationjson": "test_nl.json", "mergefile": "merge_test_nl.jsonld", "autotranslate": false },
      { "language": "en", "template": "test_en.j2", "title": "Test", "translationjson": "test_en.json", "mergefile": "merge_test_en.jsonld", "autotranslate": true }
    ]
  }
]
EOF
echo "doc/en-prime-spec" > "${AT2_WS}/checkouts.txt"
cp "${CONFIG_JSON}" "${AT2_WS}/config/config.json"
docker run --rm \
    -v "${AT2_WS}:${CONTAINER_WORKSPACE}" \
    -e TOOLCHAIN_TOKEN="${CI_TOKEN}" \
    -e CIRCLE_BRANCH="test" \
    -e CIRCLE_WORKING_DIRECTORY="/usr/local/lib/pipeline" \
    -e AZURETRANSLATIONKEY="${AZURETRANSLATIONKEY:-dummy}" \
    "${IMAGE}" upgrade_config-4.sh "${CONTAINER_WORKSPACE}" "${CONTAINER_WORKSPACE}/config" >/dev/null 2>&1
assert_exit 0 "$?"
NL_AUTOTRANSLATE=$(jq -r ".[0].translation[] | select(.language==\"nl\") | .autotranslate" "${AT2_WS}/src/doc/en-prime-spec/.names.json")
EN_AUTOTRANSLATE=$(jq -r ".[0].translation[] | select(.language==\"en\") | .autotranslate" "${AT2_WS}/src/doc/en-prime-spec/.names.json")
if [ "${NL_AUTOTRANSLATE}" == "true" ] && [ "${EN_AUTOTRANSLATE}" == "false" ]; then
    echo "PASS: spec prime (en) not autotranslated, goal (nl) autotranslated (nl=${NL_AUTOTRANSLATE}, en=${EN_AUTOTRANSLATE})"
else
    echo "FAIL: spec prime handling wrong (nl=${NL_AUTOTRANSLATE}, en=${EN_AUTOTRANSLATE})"
    AUTOTRANSLATE_SPEC_PRIME_FAILED=1
fi
end_test || AUTOTRANSLATE_SPEC_PRIME_FAILED=1

# --- test: per-spec languages override ---------------------------------------
# The publication point config (data.vlaanderen.be2) may declare a "languages"
# list to restrict which languages are rendered for a spec, overriding the
# global primeLanguage/otherLanguages from config.json. E.g. an English-only
# spec with "languages": ["en"] must NOT produce NL artifacts.
start_test "languages-override"
LANG_WS="${WORKSPACE}/languages-override-ws"
rm -rf "${LANG_WS}"
mkdir -p "${LANG_WS}/src/doc/en-only-spec" "${LANG_WS}/config" "${LANG_WS}/report4/doc/en-only-spec"
cat > "${LANG_WS}/src/doc/en-only-spec/.publication-point.json" << 'EOF'
{
  "urlref": "/doc/en-only-spec",
  "name": "en-only-spec",
  "languages": ["en"]
}
EOF
cat > "${LANG_WS}/src/doc/en-only-spec/.names.json" << 'EOF'
[
  {
    "name": "en-only-spec",
    "type": "voc",
    "eap": "Test.eap",
    "template": "test.j2",
    "title": "Test",
    "publication-state": "https://data.vlaanderen.be/id/concept/StandaardStatus/KandidaatStandaard",
    "publication-date": "2026-01-01",
    "translation": [
      { "language": "nl", "template": "test.j2", "title": "Test", "translationjson": "test_nl.json", "mergefile": "merge_test_nl.jsonld", "autotranslate": false },
      { "language": "en", "template": "test_en.j2", "title": "Test", "translationjson": "test_en.json", "mergefile": "merge_test_en.jsonld", "autotranslate": false }
    ]
  }
]
EOF
echo "doc/en-only-spec" > "${LANG_WS}/checkouts.txt"
cp "${CONFIG_JSON}" "${LANG_WS}/config/config.json"
# Build the all-*.jsonld the way extract-what-4.sh does (publication-point + names)
jq -s '.[0] + .[1][0]' \
    "${LANG_WS}/src/doc/en-only-spec/.publication-point.json" \
    "${LANG_WS}/src/doc/en-only-spec/.names.json" \
    > "${LANG_WS}/report4/doc/en-only-spec/all-en-only-spec.jsonld"
docker run --rm \
    -v "${LANG_WS}:${CONTAINER_WORKSPACE}" \
    -e TOOLCHAIN_TOKEN="${CI_TOKEN}" \
    -e CIRCLE_BRANCH="test" \
    -e CIRCLE_WORKING_DIRECTORY="/usr/local/lib/pipeline" \
    -e AZURETRANSLATIONKEY="${AZURETRANSLATIONKEY:-dummy}" \
    "${IMAGE}" render-details4.sh "${CONTAINER_WORKSPACE}" metadata "${CONTAINER_WORKSPACE}/config" >/dev/null 2>&1
assert_exit 0 "$?"
META_FILES=$(ls "${LANG_WS}/report4/doc/en-only-spec/html/" 2>/dev/null || true)
if echo "${META_FILES}" | grep -q "meta_en-only-spec_en.json" && ! echo "${META_FILES}" | grep -q "meta_en-only-spec_nl.json"; then
    echo "PASS: languages override produced only EN metadata (${META_FILES})"
else
    echo "FAIL: languages override not honoured (files: ${META_FILES})"
    LANGUAGES_OVERRIDE_FAILED=1
fi
end_test || LANGUAGES_OVERRIDE_FAILED=1

# --- test: extract -----------------------------------------------------------
start_test "extract"
run_in_container extract-what-4.sh jsonld "${CONTAINER_WORKSPACE}/config"
assert_exit 0 "$?"
for line in $(cat "${WORKSPACE}/checkouts.txt" 2>/dev/null); do
    assert_dir_exists "${WORKSPACE}/report4/${line}" "report dir for ${line}"
done
end_test || EXTRACT_FAILED=1

# --- test: render ------------------------------------------------------------
# The render step can be scoped via the STEP argument. Go through each
# publication point and each of its all-*.jsonld files.
# Order matters: metadata + merge must run before html/rdf/shacl/context/swagger,
# because those generators consume the meta_*.json and merged_*.jsonld files.
RENDER_STEPS="metadata translation merge html rdf shacl context swagger validation report"
if [ "${STEP}" != "all" ]; then
    RENDER_STEPS="${STEP}"
fi

# Seed a previous README so the report step's merge has something to extend.
# This simulates the downloadFileGithub.sh call that fetches the previous
# report4/README.md from the generated repository in the real CI pipeline.
if [[ " ${RENDER_STEPS} " =~ " report " ]]; then
    echo "==> Seeding previous README for report merge test"
    cat > "${WORKSPACE}/README.md" <<- 'SEED'
| Execution | Existence | Support |
| --- | --- | --- |
| [commit 0000000](https://example.com/commit/0000000) | [&#9728;](/report4/existence_publicationpoints.report.md)| [&#9728;](/report4/support_publicationpoints.report.md)|

### Legende

<details>

| Term | Betekenis |
| --- | --- |
| mrg | Merge translations to create for each language a single source of truth |
| aut | Autotranslate the translation files, if active |
| uml | Extraction of the data out of the UML |
| rdf | RDF file generation |
| issu | Open Issues |
| trns | Translation files generation, based on existing translation files |
| shcl | SHACL file generation |
| web | Extract all data model for html rendering  |
| rspc | Render html using specific RESPEC integration  |
| stak | Validate and convert the stakeholders |
| tag | Branchtag check |
| val | Validate the jsonld |
| ctx | JSON-LD Context file generation |
| bundle | Resource bundling |
| met | Extract metadata for html rendering |
| html | Render html using generic nunjuncks |
| swag | Swagger file generation |

</details>


| Specification | tag | uml | val | stak | trns | aut | mrg | web | met | html | rspc | ctx | rdf | shcl | swag | bundle | issu |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [previous-spec/ entry](https://data.dev-vlaanderen.be/doc/previous-spec/entry) <br/> [&#9883;](/report4/previous-spec/entry) [&#9884;](https://data.dev-vlaanderen.be/doc/previous-spec/entry) | [&#9728;](/report4/previous-spec/entry/branchtag.report.md) | [&#9728;](/report4/previous-spec/entry/oslo-converter-ea.report.md) | [&#9728;](/report4/previous-spec/entry/jsonld-validation.report.md) | [&#9728;](/report4/previous-spec/entry/oslo-stakeholders-converter.report.md) | [&#9728;](/report4/previous-spec/entry/translate.report.md) | [&#9728;](/report4/previous-spec/entry/autotranslate.report.md) | [&#9728;](/report4/previous-spec/entry/merge.report.md) | [&#9728;](/report4/previous-spec/entry/generator-webuniversum-json.report.md) | [&#9728;](/report4/previous-spec/entry/metadata.report.md) | [&#9728;](/report4/previous-spec/entry/generator-html.report.md) | [&#9728;](/report4/previous-spec/entry/generator-respec.report.md) | [&#9728;](/report4/previous-spec/entry/generator-jsonld-context.report.md) | [&#9728;](/report4/previous-spec/entry/generator-rdf.report.md) | [&#9728;](/report4/previous-spec/entry/generator-shacl.report.md) | [&#9728;](/report4/previous-spec/entry/generator-swagger.report.md) | [&#9728;](/report4/previous-spec/entry/bundle.report.md) | [ 0 ](https://example.com/issues) |
SEED
    echo "==> Seeded README:"
    head -5 "${WORKSPACE}/README.md"
fi

start_test "render (${RENDER_STEPS})"
for step in ${RENDER_STEPS}; do
    echo "  > render step: ${step}"
    run_in_container render-details4.sh "${CONTAINER_WORKSPACE}" "${step}" "${CONTAINER_WORKSPACE}/config"
    assert_exit 0 "$?" "render ${step}"
done
end_test || RENDER_FAILED=1

# --- test: report merge preserves previous entries ---------------------------
if [[ " ${RENDER_STEPS} " =~ " report " ]]; then
    start_test "report-merge"
    README="${WORKSPACE}/report4/README.md"
    if [ -f "${README}" ]; then
        echo "=== Merged README ==="
        cat "${README}"
        echo ""
        # The seeded previous-spec/entry must still be present
        if grep -q "previous-spec/entry" "${README}"; then
            echo "PASS: previous-spec/entry preserved in merged README"
        else
            echo "FAIL: previous-spec/entry was lost — merge overwrote instead of extending"
            REPORT_MERGE_FAILED=1
        fi
        # At least one spec from the current run must be present
        for line in $(cat "${WORKSPACE}/checkouts.txt" 2>/dev/null); do
            if grep -q "${line}" "${README}"; then
                echo "PASS: ${line} present in merged README"
            else
                echo "FAIL: ${line} missing from merged README"
                REPORT_MERGE_FAILED=1
            fi
        done
    else
        echo "FAIL: report4/README.md was not generated"
        REPORT_MERGE_FAILED=1
    fi
    end_test || REPORT_MERGE_FAILED=1
fi

# --- test: bundle ------------------------------------------------------------
start_test "bundle"
run_in_container copy_resources_to_urlref.sh \
    "${CONTAINER_WORKSPACE}/config" \
    "${CONTAINER_WORKSPACE}/target" \
    "${CONTAINER_WORKSPACE}"
assert_exit 0 "$?"
end_test || BUNDLE_FAILED=1

# --- test: sanity checks on the artifacts ------------------------------------
# Only meaningful when the html render step ran (single-step runs like
# STEP=report don't produce index.html).
if [[ " ${RENDER_STEPS} " =~ " html " ]]; then
    start_test "artifacts"
    for line in $(cat "${WORKSPACE}/checkouts.txt" 2>/dev/null); do
        assert_file_exists "${WORKSPACE}/target/${line}/index.html" "index.html for ${line}"
    done
    end_test || ARTIFACT_FAILED=1
fi

# --- summary -----------------------------------------------------------------
echo ""
echo "=================================================="
echo " Pipeline integration test summary"
echo "=================================================="
if [ "${CHECKOUT_FAILED:-0}" = "1" ] || \
   [ "${UPGRADE_FAILED:-0}" = "1" ] || \
   [ "${AUTOTRANSLATE_OVERRIDE_FAILED:-0}" = "1" ] || \
   [ "${AUTOTRANSLATE_SPEC_PRIME_FAILED:-0}" = "1" ] || \
   [ "${LANGUAGES_OVERRIDE_FAILED:-0}" = "1" ] || \
   [ "${EXTRACT_FAILED:-0}" = "1" ] || \
   [ "${RENDER_FAILED:-0}" = "1" ] || \
   [ "${BUNDLE_FAILED:-0}" = "1" ] || \
   [ "${ARTIFACT_FAILED:-0}" = "1" ] || \
   [ "${REPORT_MERGE_FAILED:-0}" = "1" ]; then
    echo "RESULT: FAILED"
    echo "Workspace retained for inspection: ${WORKSPACE}"
    exit 1
else
    echo "RESULT: PASSED"
    exit 0
fi