#! /bin/bash
set -euo pipefail
#

# This script uses gh https://github.com/cli/cli
# The CI should provide the GH_TOKEN environment variable which should be set with an low access (read access on repositories) to ensure the functioning
#
#

# target is the file to which the value as json is going to be added.
# repository is the source repository on which the count has to be made

REPOSITORY=$1
TARGET=$2


# echo GH_TOKEN

if [ "${GH_TOKEN:-}" == "" ] || ! command -v gh &>/dev/null; then
	echo "WARNING: no access to GitHub to extract the number of issues"
	echo "0" > "${TARGET}"
else
	gh issue list --json number -q length -R "${REPOSITORY}" > "${TARGET}"
fi



