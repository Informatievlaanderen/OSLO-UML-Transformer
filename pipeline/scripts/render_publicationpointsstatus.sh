#!/bin/bash
set -euo pipefail

#
# Arg1 = the file to which the status is reported
EXECUTIONVIEW=$1

# global setting
REPORTLINEPREFIX='#||# '

RLINE=/tmp/generated/report4

# This must be aligned with the same function in render_details
#
check_tool_output_for_non_emptiness() {
	local REPORT=$1

	sed  "/${REPORTLINEPREFIX}/d" $REPORT > /tmp/out
	# if the report is empty then sun (no issues)
	# if the report contains indications of errors (word Error, error, ERROR) then thunderstorm
	# otherwise cloud
	SUN="&#9728;" 
	CLOUD="&#9729;" 
	THUNDERSTORM="&#9736;" 

	if [ -s /tmp/out ] ; then
		E=$( grep -c rror /tmp/out )
		if [ $E -eq 0  ] ; then
			E=$( grep -c RROR /tmp/out )
			if [ $E -eq 0  ] ; then
				REPORTSTATE=${CLOUD}
			else
				REPORTSTATE=${THUNDERSTORM}
			fi
		else
			REPORTSTATE=${THUNDERSTORM}
		fi
	else
		REPORTSTATE=${SUN}
	fi	
}


echo "| Execution | Existence | Support |" >> ${EXECUTIONVIEW}
echo "| --- | --- | --- |"       >> ${EXECUTIONVIEW}
echo -n "| [commit ${CIRCLE_SHA1}](https://github.com/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/commit/${CIRCLE_SHA1}) "    >> ${EXECUTIONVIEW}

REPORTS="existence_publicationpoints support_publicationpoints"

for REPORTFILE in ${REPORTS} ; do
	    if [ -f ${RLINE}/${REPORTFILE}.report.md ] ; then 
	      check_tool_output_for_non_emptiness ${RLINE}/${REPORTFILE}.report.md
	      echo -n "| [${REPORTSTATE}](/report4/${REPORTFILE}.report.md)" >> ${EXECUTIONVIEW}
	    else 
	      echo -n "| " >> ${EXECUTIONVIEW}
	    fi
done
echo  "|" >> ${EXECUTIONVIEW}
