#!/bin/bash
set -euo pipefail
# filepath: /Users/vandenbrouckekristof/Documents/uncapped/digitaal_vlaanderen/data.vlaanderen.be2/scripts/triggerall.test.sh

# Get the current branch (use CIRCLE_BRANCH in CircleCI, fallback to git for local testing)
CURRENT_BRANCH=${CIRCLE_BRANCH:-$(git branch --show-current)}

echo "Current branch: ${CURRENT_BRANCH}"
echo "Checking directory: config/${CURRENT_BRANCH}"

# Process all .publication.json files in the current branch directory
for pub_file in config/${CURRENT_BRANCH}/*.publication.json; do
    if [ -f "$pub_file" ]; then
        echo "Processing $pub_file"
        ./config/${CURRENT_BRANCH}/triggerall.sh "$pub_file"
    fi
done

# Also check for the main publication.json file in the current branch directory
main_pub_file="config/${CURRENT_BRANCH}/publication.json"
if [ -f "$main_pub_file" ]; then
    echo "Processing $main_pub_file"
    ./config/${CURRENT_BRANCH}/triggerall.sh "$main_pub_file"
fi