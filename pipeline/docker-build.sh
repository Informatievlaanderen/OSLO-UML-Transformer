#!/bin/bash
# Assemble a minimal Docker build context and run the build.
#
# The Dockerfile needs files from two places in the monorepo:
#   - Repo root:  package.json, lerna.json, tsconfig.json, packages/
#   - pipeline/:  Dockerfile.circleci, scripts/
#
# Instead of sending the entire repo (1.4 GB) as build context, this script
# copies only the needed files into a temporary directory and builds from there.
#
# Usage:
#   ./docker-build.sh [options]
#
# Options:
#   --no-cache           Pass --no-cache to docker build
#   --platform <archs>   Comma-separated platforms (e.g. linux/amd64,linux/arm64)
#                        When set, uses docker buildx build automatically.
#   --push               Push after build (implies buildx)
#   --tag <name>         Tag to apply (can be repeated)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Parse flags
NO_CACHE=""
PLATFORM=""
PUSH=""
TAGS=()

while [ $# -gt 0 ]; do
    case "$1" in
        --no-cache) NO_CACHE="--no-cache"; shift ;;
        --platform) PLATFORM="$2"; shift 2 ;;
        --push) PUSH="--push"; shift ;;
        --tag) TAGS+=("$2"); shift 2 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Default tag if none given
if [ ${#TAGS[@]} -eq 0 ]; then
    TAGS=("oslo-pipeline")
fi

# Create a temporary build context
BUILD_DIR=$(mktemp -d /tmp/oslo-pipeline-build-XXXXXX)
echo "==> Assembling build context in ${BUILD_DIR}"

# Copy repo-root files needed by the builder stage
cp "${REPO_ROOT}/package.json"  "${BUILD_DIR}/"
cp "${REPO_ROOT}/lerna.json"    "${BUILD_DIR}/"
cp "${REPO_ROOT}/tsconfig.json" "${BUILD_DIR}/"

# Copy packages/ (the builder stage compiles these)
cp -r "${REPO_ROOT}/packages/" "${BUILD_DIR}/packages/"

# Copy pipeline scripts (needed by the production stage)
mkdir -p "${BUILD_DIR}/pipeline"
cp -r "${SCRIPT_DIR}/scripts/" "${BUILD_DIR}/pipeline/scripts/"

# Copy the Dockerfile itself
cp "${SCRIPT_DIR}/Dockerfile.circleci" "${BUILD_DIR}/Dockerfile"

echo "==> Build context size: $(du -sh "${BUILD_DIR}" | cut -f1)"

# Determine whether to use buildx (multi-platform or push) or plain build
USE_BUILDX=false
if [ -n "${PLATFORM}" ] || [ -n "${PUSH}" ]; then
    USE_BUILDX=true
fi

# Build
if [ "${USE_BUILDX}" = true ]; then
    DOCKER_CMD=(docker buildx build)
    [ -n "${NO_CACHE}" ]  && DOCKER_CMD+=("${NO_CACHE}")
    [ -n "${PLATFORM}" ]  && DOCKER_CMD+=("--platform=${PLATFORM}")
    [ -n "${PUSH}" ]      && DOCKER_CMD+=("${PUSH}")
else
    DOCKER_CMD=(docker build)
    [ -n "${NO_CACHE}" ]  && DOCKER_CMD+=("${NO_CACHE}")
fi

for tag in "${TAGS[@]}"; do
    DOCKER_CMD+=(-t "${tag}")
done
DOCKER_CMD+=(-f "${BUILD_DIR}/Dockerfile" "${BUILD_DIR}")

echo "==> Running: ${DOCKER_CMD[*]}"
"${DOCKER_CMD[@]}"

# Clean up
echo "==> Cleaning up build context"
rm -rf "${BUILD_DIR}"

echo "==> Done"