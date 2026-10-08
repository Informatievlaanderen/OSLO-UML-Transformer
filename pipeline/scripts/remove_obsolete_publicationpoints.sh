#!/bin/bash
set -euo pipefail

# detect and remove the directories which are not supported by a publication point.

# set -x

# Arg1 = The configuration directory (no trailing slash)
# Arg2 = The location where the generated repository is checked out (no trailing slash)
# Arg3 = Remove the unsupported publication points
# Arg4 = The CircleCI working directory

CONFIGDIR=$1
GENERATEDREPODIR=$2
REMOVE=${3:-false}
CIRCLEWORKDIR=$4 #set explicitly because CIRCLECI_WORKING_DIRECTORY is "~/project"

# global config
REPORTLINEPREFIX='#||# '

PUBLICATIONPOINTSDIRS=$(jq -r '.publicationpoints | @sh' ${CONFIGDIR}/config.json)
PUBLICATIONPOINTSDIRS=$(echo ${PUBLICATIONPOINTSDIRS} | sed -e "s/'//g")


# find all directories of interest


rm /tmp/existingdirs

find ${GENERATEDREPODIR}/doc/applicatieprofiel -type d >> /tmp/existingdirs
find ${GENERATEDREPODIR}/doc/implementatiemodel -type d >> /tmp/existingdirs
find ${GENERATEDREPODIR}/doc/vocabularium -type d >> /tmp/existingdirs
find ${GENERATEDREPODIR}/ns -type d >> /tmp/existingdirs

sed -i "/shacl$/d" /tmp/existingdirs
sed -i "/html$/d" /tmp/existingdirs
sed -i "/context$/d" /tmp/existingdirs
sed -i "/voc$/d" /tmp/existingdirs
sed -i "/standaard$/d" /tmp/existingdirs
sed -i "/document$/d" /tmp/existingdirs
sed -i "/template.$/d" /tmp/existingdirs
sed -i "/template$/d" /tmp/existingdirs
sed -i "/.*html.*/d" /tmp/existingdirs


#
# remove the directories that do not contain a index.html 
# These directories are not published as specification
#
# remove also the next special case
sed -i "/^\/tmp\/generated\/ns$/d" /tmp/existingdirs

cat /tmp/existingdirs | while read line
do
   if [ -f "${line}/index.html" ] ; then
           echo "${line}" >> /tmp/ed
   fi
done
cp /tmp/ed /tmp/existingdirs


jq -ncR '[inputs]' < /tmp/existingdirs > /tmp/existingdirs.json


# find the support

echo "[]" > /tmp/supportingpublicationpoints.json

for dir in ${PUBLICATIONPOINTSDIRS}; do
    echo "${REPORTLINEPREFIX}checking publication points in directory ${CONFIGDIR}/$dir"
    echo "${REPORTLINEPREFIX}"
    PUBLICATIONPOINTSFILES=$(find  ${CONFIGDIR}/$dir -name *.publication.json )
    for f in ${PUBLICATIONPOINTSFILES} ; do
            echo "${REPORTLINEPREFIX}  + adding supporting $f"
            echo "${REPORTLINEPREFIX} "
            jq --arg trg ${GENERATEDREPODIR} '[ .[] | $trg + .urlref ]' $f > /tmp/pb.json
	    jq -s '.[0] + .[1]' /tmp/supportingpublicationpoints.json /tmp/pb.json > /tmp/spb.json
	    mv /tmp/spb.json /tmp/supportingpublicationpoints.json
    done
done

jq -s '.[0] - .[1]' /tmp/existingdirs.json /tmp/supportingpublicationpoints.json > /tmp/unsupporteddirs

NOSUPPORT=`cat /tmp/unsupporteddirs`
if [ "${NOSUPPORT}" == "[]" ] ; then 
	echo "${REPORTLINEPREFIX} All directories are supported"
else
	echo "Error: the following directories are unsupported"
	cat /tmp/unsupporteddirs
fi	

