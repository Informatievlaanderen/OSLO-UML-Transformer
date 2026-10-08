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

# --- test: extract -----------------------------------------------------------
start_test "extract"
run_in_container extract-what-4.sh jsonld "${CONTAINER_WORKSPACE}/config"
assert_exit 0 "$?"
run_in_container extract-what-4.sh stakeholders "${CONTAINER_WORKSPACE}/config"
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
RENDER_STEPS="metadata translation merge html rdf shacl context swagger validation"
if [ "${STEP}" != "all" ]; then
    RENDER_STEPS="${STEP}"
fi

start_test "render (${RENDER_STEPS})"
for step in ${RENDER_STEPS}; do
    echo "  > render step: ${step}"
    run_in_container render-details4.sh "${CONTAINER_WORKSPACE}" "${step}" "${CONTAINER_WORKSPACE}/config"
    assert_exit 0 "$?" "render ${step}"
done
end_test || RENDER_FAILED=1

# --- test: bundle ------------------------------------------------------------
start_test "bundle"
run_in_container copy_resources_to_urlref.sh \
    "${CONTAINER_WORKSPACE}/config" \
    "${CONTAINER_WORKSPACE}/target" \
    "${CONTAINER_WORKSPACE}"
assert_exit 0 "$?"
end_test || BUNDLE_FAILED=1

# --- test: sanity checks on the artifacts ------------------------------------
start_test "artifacts"
for line in $(cat "${WORKSPACE}/checkouts.txt" 2>/dev/null); do
    assert_file_exists "${WORKSPACE}/target/${line}/index.html" "index.html for ${line}"
done
end_test || ARTIFACT_FAILED=1

# --- summary -----------------------------------------------------------------
echo ""
echo "=================================================="
echo " Pipeline integration test summary"
echo "=================================================="
if [ "${CHECKOUT_FAILED:-0}" = "1" ] || \
   [ "${UPGRADE_FAILED:-0}" = "1" ] || \
   [ "${EXTRACT_FAILED:-0}" = "1" ] || \
   [ "${RENDER_FAILED:-0}" = "1" ] || \
   [ "${BUNDLE_FAILED:-0}" = "1" ] || \
   [ "${ARTIFACT_FAILED:-0}" = "1" ]; then
    echo "RESULT: FAILED"
    echo "Workspace retained for inspection: ${WORKSPACE}"
    exit 1
else
    echo "RESULT: PASSED"
    exit 0
fi