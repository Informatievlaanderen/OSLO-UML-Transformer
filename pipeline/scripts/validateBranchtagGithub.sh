#!/bin/bash
set -euo pipefail

#
# validate if a branchtag is a branch or not
#

# DIR = directory in which a github repository is checked out
# BRANCHTAG = the branchtag value to be checked
DIR=$1
BRANCHTAG=$2


pushd ${DIR} &> /tmp/validateBranchtag
git branch --list --all &> /tmp/branches
# git branches produces a star as first char which gets interpreted and thus that is problematic: remove it
sed -i "s/^\*//g" /tmp/branches
BRANCHES=$( cat /tmp/branches )

REALCOMMIT=true
for bi in ${BRANCHES} ; do
#	echo $bi
	if [ "$bi" = ${BRANCHTAG} ] ; then
		REALCOMMIT=false
	fi
	if [ "$bi" = "remotes/origin/${BRANCHTAG}" ] ; then
		REALCOMMIT=false
	fi
done
popd &> /tmp/validateBranchtag
echo ${REALCOMMIT}
