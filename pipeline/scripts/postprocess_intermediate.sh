#!/bin/bash
set -euo pipefail
#


# ARG1 = default status to be assigned to the terms 
# ARG2 = domain to be considered the namespace of internal terms

# ARGN = json file to be manipulated

DEFAULTSTATUS=$1
NAMESPACE=$2
FILE=$3

if [ -f ${FILE} ] ; then

jq  --arg default ${DEFAULTSTATUS}  'walk( if type=="object" and has("assignedURI") and has("@id") then  if has("status") then . else . + {"status" : "\($default)"} end else . end )' ${FILE} > /tmp/${FILE}.0
jq  --arg namespace ${NAMESPACE} 'walk( if type=="object" and has("assignedURI") and has("scope") and .scope=="https://data.vlaanderen.be/id/concept/scope/External" then  if ( .assignedURI | test("\($namespace)";"i") ) then .scope="https://data.vlaanderen.be/id/concept/scope/inPublicationNamespace" else . end else . end )' /tmp/${FILE}.0 > /tmp/${FILE}.1

cp /tmp/${FILE}.1 ${FILE}

else 
	echo "file ${FILE} does not exist"
fi

