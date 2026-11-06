#!/bin/bash

set -xeuo pipefail

# Arg1 = The configuration directory
# Arg2 = The location where the generated repository is checked out
# Arg3 = Stop when missing publication points are detected.
# Arg5 = The CircleCI working directory

CONFIGDIR=$1
GENERATEDREPODIR=$2
STOP=${3:-false}
CIRCLEWORKDIR=$5 #set explicitly because CIRCLECI_WORKING_DIRECTORY is "~/project"

# global config
REPORTLINEPREFIX='#||# '

PUBLICATIONPOINTSDIRS=$(jq -r '.publicationpoints | @sh' ${CONFIGDIR}/config.json)
PUBLICATIONPOINTSDIRS=$(echo ${PUBLICATIONPOINTSDIRS} | sed -e "s/'//g")



for dir in ${PUBLICATIONPOINTSDIRS}; do
    echo "${REPORTLINEPREFIX}checking publication points in directory ${CONFIGDIR}/$dir"
    echo "${REPORTLINEPREFIX}"
    PUBLICATIONPOINTSFILES=$(find  ${CONFIGDIR}/$dir -name *.publication.json )
    for f in ${PUBLICATIONPOINTSFILES} ; do
            echo "${REPORTLINEPREFIX}   + checking $f"
            echo "${REPORTLINEPREFIX}"
            check.sh $f ${GENERATEDREPODIR} ${STOP}
            if  [ $? -ne 0 ] &&  ${STOP}   ; then
                    echo "Error: missing publication points detected, please resolve them prior continuing"
                    exit 1 ;
            fi
    done
done

