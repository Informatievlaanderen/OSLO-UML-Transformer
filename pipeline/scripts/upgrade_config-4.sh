#!/bin/bash
set -euo pipefail

TARGETDIR=$1
CONFIGDIR=$2
CHECKOUTFILE=${TARGETDIR}/checkouts.txt

PRIMELANGUAGECONFIG=$(jq -r .primeLanguage ${CONFIGDIR}/config.json)
GOALLANGUAGECONFIG=$(jq -r '.otherLanguages | @sh' ${CONFIGDIR}/config.json)
GOALLANGUAGECONFIG=$(echo ${GOALLANGUAGECONFIG} | sed -e "s/'//g")

PRIMELANGUAGE=${3-${PRIMELANGUAGECONFIG}}
GOALLANGUAGE=${4-${GOALLANGUAGECONFIG}}

#############################################################################################
#
# calculate the configuration from the specification
#
#############################################################################################
get_mapping_file() {
    local MAPPINGFILE=`jq -r 'if (.filename | length) > 0 then .filename else @sh "config/eap-mapping.json"  end' .publication-point.json`
    #local MAPPINGFILE="config/eap-mapping.json"
    if [ -f ".names.txt" ]
    then
	STR=".[] | select(.name == \"$(cat .names.txt)\") | [.]"
	jq "${STR}" ${MAPPINGFILE} > .names.json
	MAPPINGFILE=".names.json"
    fi
    echo ${MAPPINGFILE}
}

#############################################################################################
#
# convert older toolchain version configs to this version
#
#############################################################################################
# incomplete bash version
#
upgrade_config_old() {
    local SLINE=$1
    echo "upgrade config for $SLINE"

    PRIMELANGUAGE=$(jq -r ".primeLanguage" ${CONFIGDIR}/config.json)

    echo "prime language is $PRIMELANGUAGE"
    

    HASTRANSLATION=$(jq -r .[0].translation[0].language ${SLINE}/.names.json)
    echo "${HASTRANSLATION}: if null then no translation is present and thus configuration will be updated."

    # SHOULD SUPPORT autotranslate option

    TITLE=$(jq -r .[0].title ${SLINE}/.names.json)
    TEMPLATEORIG=$(jq -r .[0].template ${SLINE}/.names.json)
    NAME=$(jq -r .[0].name ${SLINE}/.names.json)

    echo "title: $TITLE"
    echo "template original: $TEMPLATEORIG"
    echo "name: $NAME"

#    TEMPLATE=${TEMPLATEORIG/.j2/_${PRIMELANGUAGE}.j2}
    TEMPLATE=${TEMPLATEORIG}
    echo "template: $TEMPLATE"

    TRANSLATIONOBJTEMPLATE='{"translation" : [{
       "language" : $jqlanguage,
       "title" : $jqtitle,
       "template" : $jqtemplate,
       "translationjson" : $jqtranslation,
       "mergefile" : $jqmergefile
     }]}'

    JQTRANSLATION="${NAME}_${PRIMELANGUAGE}.json"

    TRANSLATIONOBJ=$(jq -n \
        --arg jqlanguage "${PRIMELANGUAGE}" --arg jqtitle "${TITLE}" --arg jqtemplate ${TEMPLATE} \
        --arg jqtranslation $JQTRANSLATION --arg jqmergefile ${NAME}_${PRIMELANGUAGE}_merged.json \
        "${TRANSLATIONOBJTEMPLATE}")
    echo $TRANSLATIONOBJ >/tmp/upgrade.json

    # check for the amount of items in the .names.json
    AMOUNT=$(jq length ${SLINE}/.names.json)

    echo "amount of items in the .names.json: $AMOUNT"

    if [ ${AMOUNT} -eq 1 ]; then

        if [ "$HASTRANSLATION" == "" ] || [ "$HASTRANSLATION" == "null" ]; then

            jq -s '[.[0][0] * .[1]]' ${SLINE}/.names.json /tmp/upgrade.json >/tmp/mergedupgrade.json
            cp /tmp/mergedupgrade.json ${SLINE}/.names.json
        fi

    else
        echo "ERROR only a list with a single matching value should be in the specification config"
        cat ${SLINE}/.names.json
        exit -1
    fi

}

#############################################################################################
#
# convert older toolchain version configs to this version
#
#############################################################################################

upgrade_config() {
    local SLINE=$1
    echo "upgrade config for $SLINE"

    set -x

    THEMACONFIGFILE=${SLINE}/.names.json
    TMPFILE=/tmp/upgradeconfig
    TMPFILEINPUT=/tmp/upgradeconfig_input

    node /app/update-config-translation.js -i ${THEMACONFIGFILE}  -g ${PRIMELANGUAGE} -m ${PRIMELANGUAGE} -s ${AZURETRANSLATIONKEY} -o ${TMPFILE}
    for g in ${GOALLANGUAGE}; do
	    cp ${TMPFILE} ${TMPFILEINPUT}
    node /app/update-config-translation.js -i ${TMPFILEINPUT}  -g ${g} -m ${PRIMELANGUAGE} -s ${AZURETRANSLATIONKEY} -o ${TMPFILE}
    done

    cp ${TMPFILE} ${THEMACONFIGFILE}

}


echo "upgrade config: starting with $TARGETDIR $CONFIGDIR"

cat ${CHECKOUTFILE} | while read line; do
    SLINE=${TARGETDIR}/src/${line}
    TLINE=${TARGETDIR}/target/${line}
    RLINE=${TARGETDIR}/report/${line}
    TRLINE=${TARGETDIR}/translation/${line}
    if [ -d "${SLINE}" ]; then
         pushd ${SLINE}
         MAPPINGFILE=$(get_mapping_file)   
	 popd
        upgrade_config ${SLINE}
    else
        echo "Error: ${SLINE}"
    fi
done
