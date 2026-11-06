#!/bin/bash
set -euo pipefail

TARGETDIR=${OSLO_WORKSPACE:-/tmp/workspace}
CHECKOUTFILE=${TARGETDIR}/checkouts.txt

CONFIGDIR_DEFAULT=$( eval echo "${CIRCLE_WORKING_DIRECTORY}" )
CONFIGDIR=${2:-$CONFIGDIR_DEFAULT/config}
STRICT=$(jq -r .toolchain.strictness ${CONFIGDIR}/config.json)
execution_strictness() {
    if [ "${STRICT}" != "lazy" ] && [ "${STRICT}" != "null" ] && [ -n "${STRICT}" ]; then
        exit -1
    fi
}
#############################################################################################
# extraction command functions

get_mapping_file() {
   if [ -f .names.json ] ; then
     echo ".names.json"
   else
     echo "no mapping file available"
     exit 1
   fi
}

# MAPPINGFILE=$(get_mapping_file)   
#  The usage of the above function would result in erroneous case that MAPPINGFILE="no mapping file available" 
#  But that leads to problems in further processing

#get_mapping_file() {
#    local MAPPINGFILE="config/eap-mapping.json"
#    if [ -f ".names.txt" ]
#    then
#	STR=".[] | select(.name == \"$(cat .names.txt)\") | [.]"
#	jq "${STR}" ${MAPPINGFILE} > .names.json
#	MAPPINGFILE=".names.json"
#    fi
#    echo ${MAPPINGFILE}
#}

#############################################################################################
copy_details() {
    local MAPPINGFILE=$1
    local SLINE=$2
    local TARGET=$3

    mkdir -p $TARGET

    SITE=`jq --arg sline ${SLINE} --arg tline ${TARGET} -r '.[0] |{"site" : .site, "sline": $sline, "tline": $tline} | @text "\(.sline)/\(.site)" '  $1`

    if [ -d ${SITE} ] ; then
	    cp -r ${SITE}/* ${TARGET}
    else 
	    echo "WARNING no site exists" 
    fi
}

#############################################################################################

if [ ! -f "${CHECKOUTFILE}" ]
then
    # normalise the functioning
    echo $CWD > ${CHECKOUTFILE}
fi

cat ${CHECKOUTFILE} | while read line
do
    SLINE=${TARGETDIR}/src/${line}
    echo "Processing line ${SLINE}"
    if [ -d "${SLINE}" ]
    then
      pushd ${SLINE}
       if [ -f .names.json ] ; then
           MAPPINGFILE=".names.json"
           TDIR=${TARGETDIR}/target/${line}/html
           copy_details $MAPPINGFILE $SLINE $TDIR
       else
           echo "Error: no mapping file available. No skeleton data is copied."
           execution_strictness
       fi
      popd
    else
      echo "Error: ${SLINE}" 
    fi
done

