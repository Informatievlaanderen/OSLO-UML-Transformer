#!/bin/bash
set -euo pipefail

# Validate that static swagger files from bundleDirectory do not silently
# overwrite generated swagger artifacts.
#
# The bundle step first copies generated artifacts into resources/, then copies
# static files from the theme repository's bundleDirectory on top. When a static
# file has the same relative path as a generated file, it overwrites it.
# Templates hardcode links to the resources/ path, so the generated version
# becomes invisible.
#
# This script checks: for each file in resources/swagger/, if a file with the
# same relative path exists in the generated swagger/ directory and differs,
# a warning is emitted.
#
# Args:
#   1) configuration directory (e.g. config)
#   2) generated repository directory (target)
#   3) workspace directory containing report4 (default: /tmp/workspace)

CONFIGDIR=$1
GENERATEDDIR=$2
WORKSPACEDIR=${3:-${OSLO_WORKSPACE:-/tmp/workspace}}

if [ -z "$CONFIGDIR" ] || [ -z "$GENERATEDDIR" ]; then
    echo "Usage: $0 <config-dir> <generated-dir> [workspace-dir]"
    exit 1
fi

if [ ! -f "$CONFIGDIR/config.json" ]; then
    echo "config.json not found in configuration directory: $CONFIGDIR"
    exit 1
fi

if [ ! -d "$GENERATEDDIR" ]; then
    echo "Generated directory not found: $GENERATEDDIR"
    exit 1
fi

HAS_OVERWRITE=false
OVERWRITE_COUNT=0

# Check a single publication point for overwritten swagger files
check_publication_point() {
    local urlref=$1

    URLREF_NO_LEADING=${urlref#/}
    SOURCE_DIR="$GENERATEDDIR/$URLREF_NO_LEADING"
    RESOURCES_DIR="$SOURCE_DIR/resources"

    if [ ! -d "$SOURCE_DIR" ]; then
        return
    fi

    if [ ! -d "$RESOURCES_DIR" ]; then
        return
    fi

    echo "  Checking $urlref ..."

    local generated_dir="$SOURCE_DIR/swagger"
    local resources_subdir="$RESOURCES_DIR/swagger"

    if [ ! -d "$generated_dir" ]; then
        return
    fi

    if [ ! -d "$resources_subdir" ]; then
        return
    fi

    # For each file in resources/swagger/, check if a file with the same
    # relative path exists in the generated swagger/ directory and differs.
    while IFS= read -r -d '' bundled_file; do
        local rel_path="${bundled_file#$resources_subdir/}"
        local generated_file="$generated_dir/$rel_path"

        if [ ! -f "$generated_file" ]; then
            continue
        fi

        if ! diff -q "$generated_file" "$bundled_file" > /dev/null 2>&1; then
            echo "    WARNING: Static file overwrites generated file for $urlref: swagger/$rel_path"
            echo "      Generated: $generated_file"
            echo "      Static:    $bundled_file"
            HAS_OVERWRITE=true
            OVERWRITE_COUNT=$((OVERWRITE_COUNT + 1))
        fi
    done < <(find "$resources_subdir" -type f -print0)
}

# Process publication files from the config directory
PUBLICATIONPOINTSDIRS=$(jq -r '.publicationpoints | @sh' "$CONFIGDIR/config.json")
PUBLICATIONPOINTSDIRS=$(echo "$PUBLICATIONPOINTSDIRS" | sed -e "s/'//g")

for dir in $PUBLICATIONPOINTSDIRS; do
    PUBLICATIONPOINTSFILES=$(find "$CONFIGDIR/$dir" -name '*.publication.json' -o -name 'publication.json')
    for f in $PUBLICATIONPOINTSFILES; do
        while IFS= read -r pubpoint; do
            URLREF=$(echo "$pubpoint" | jq -r '.urlref')
            COPY_RESOURCES=$(echo "$pubpoint" | jq -r 'if has("bundle") then .bundle else false end')

            if [ -z "$URLREF" ] || [ "$URLREF" = "null" ]; then
                continue
            fi

            if [ "$COPY_RESOURCES" != "true" ]; then
                continue
            fi

            check_publication_point "$URLREF"
        done < <(jq -c 'if type == "array" then .[] else . end | select(.urlref)' "$f")
    done
done

if [ "$HAS_OVERWRITE" = "true" ]; then
    echo ""
    echo "WARNING: $OVERWRITE_COUNT generated swagger file(s) are overwritten by static files from bundleDirectory."
    echo "The static files may be outdated. Review the warnings above and update the static files"
    echo "or remove them if the generated versions should be used instead."
    exit 0  # Warning only, not a hard failure
fi

echo "OK: No generated swagger files are overwritten by static files."