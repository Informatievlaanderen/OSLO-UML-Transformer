#!/bin/bash
# Library of render functions for the OSLO publication toolchain.
# Source this file from render-details4.sh after setting global variables.
#
# Required globals (set by caller):
#   CONFIGDIR, PRIMELANGUAGE, GOALLANGUAGE, STRICT, HOSTNAME, URIDOMAIN,
#   CHECKOUTFILE, AUTOTRANSLATIONDIR, REPORTLINEPREFIX, REPORTLINENEWLINE

# --- Strictness --------------------------------------------------------------

execution_strictness() {
    if [ "${STRICT}" != "lazy" ] && [ "${STRICT}" != "null" ] && [ -n "${STRICT}" ]; then
        exit -1
    fi
}

# --- Generator parameters ----------------------------------------------------

generator_parameters() {
    local GENERATOR=$1
    local JSONI=$2

    COMMAND=$(echo '.'${GENERATOR}'.parameters')
    PARAMETERS=$(jq -r ${COMMAND} ${JSONI})
    if [ "${PARAMETERS}" == "null" ]; then
        PARAMETERS=$(jq -r ${COMMAND} ${CONFIGDIR}/config.json)
    fi
    if [ "${PARAMETERS}" == "null" ] || [ -z "${PARAMETERS}" ]; then
        PARAMETERS=""
    fi
}

# --- Language gating ---------------------------------------------------------

generate_for_language() {
    local LANGUAGE=$1
    local JSONI=$2

    # Check the per-language autotranslate flag in the publication point config.
    COMMANDLANGJSON=$(echo '.translation | .[] | select(.language | contains("'${LANGUAGE}'")) | .autotranslate')
    PUB_AUTOTRANSLATE=$(jq -r "${COMMANDLANGJSON}" ${JSONI})

    if [ "${PUB_AUTOTRANSLATE}" == "true" ] || [ "${PUB_AUTOTRANSLATE}" == true ]; then
        # Autotranslate is enabled for this language — check if the merged file exists.
        local FILENAME=$(jq -r '.name' "${JSONI}")
        local JSONDIR=$(dirname "${JSONI}")
        local MERGEDFILE="${JSONDIR}/merged/merged_${FILENAME}_${LANGUAGE}.jsonld"
        if [ -f "${MERGEDFILE}" ]; then
            GENERATEDARTEFACT=true
        else
            GENERATEDARTEFACT=false
        fi
    else
        # No autotranslate — check if a manual translation file exists.
        COMMANDLANGJSON=$(echo '.translation | .[] | select(.language | contains("'${LANGUAGE}'")) | .translationjson')
        TRANSLATIONFILE=$(jq -r "${COMMANDLANGJSON}" ${JSONI})
        if [ "${TRANSLATIONFILE}" == "" ] || [ "${TRANSLATIONFILE}" == "null" ]; then
            GENERATEDARTEFACT=false
        else
            GENERATEDARTEFACT=true
        fi
    fi
}

# --- Type mapping ------------------------------------------------------------

spectype_for() {
    local JSONI=$1
    local TYPE=$(jq -r '.type' "${JSONI}")
    case "${TYPE}" in
        ap|oj) echo "ApplicationProfile" ;;
        voc)   echo "Vocabulary" ;;
        *)     echo "ApplicationProfile" ;;
    esac
}

# --- File resolution ---------------------------------------------------------

resolve_merged_file() {
    local JSONI=$1
    local SLINE=$2
    local LANGUAGE=$3
    local FILENAME=$(jq -r '.name' "${JSONI}")
    local MERGEDFILE="${SLINE}/merged/merged_${FILENAME}_${LANGUAGE}.jsonld"
    if [ -f "${MERGEDFILE}" ]; then
        echo "translations integrated file found" >&2
        echo "${MERGEDFILE}"
    else
        echo "defaulting to the primelanguage version" >&2
        echo "${JSONI}"
    fi
}

# --- Logging -----------------------------------------------------------------

log_command() {
    local REPORTFILE=$1
    shift
    local rendered=()
    local arg
    for arg in "$@"; do
        case "$arg" in
            ''[[:space:]]*|[[:space:]]*''|*[[:space:]]*) rendered+=("'$arg'") ;;
            *) rendered+=("$arg") ;;
        esac
    done
    local line="${rendered[*]}"
    if [ -n "${AZURETRANSLATIONKEY:-}" ]; then
        line="${line//${AZURETRANSLATIONKEY}/***}"
    fi
    echo "GEN-CMD: ${line}"
    echo "${REPORTLINEPREFIX}command: ${line}${REPORTLINENEWLINE}" >>"${REPORTFILE}"
}

# --- Report helpers ----------------------------------------------------------

check_tool_output_for_non_emptiness() {
    local REPORT=$1

    sed "/${REPORTLINEPREFIX}/d" $REPORT >/tmp/out
    SUN="&#9728;"
    CLOUD="&#9729;"
    THUNDERSTORM="&#9736;"

    if [ -s /tmp/out ]; then
        E=$(grep -ci '\berror\b' /tmp/out || true)
        if [ $E -gt 0 ]; then
            REPORTSTATE=${THUNDERSTORM}
        else
            W=$(grep -ci '\bwarn\b' /tmp/out || true)
            if [ $W -gt 0 ]; then
                REPORTSTATE=${CLOUD}
            else
                REPORTSTATE=${SUN}
            fi
        fi
    else
        REPORTSTATE=${SUN}
    fi
}

render_report_header() {
    local OVERVIEW=$1

    if [ ! -f ${OVERVIEW} ]; then
        echo "### Legende" >${OVERVIEW}
        echo "" >>${OVERVIEW}
        echo "<details>" >>${OVERVIEW}
        echo "" >>${OVERVIEW}
        echo "| Term | Betekenis |" >>${OVERVIEW}
        echo "| --- | --- |" >>${OVERVIEW}
        declare -A terms
        terms=(
            ["tag"]="Branchtag check"
            ["uml"]="Extraction of the data out of the UML"
            ["val"]="Validate the jsonld"
            ["stak"]="Validate and convert the stakeholders"
            ["trns"]="Translation files generation, based on existing translation files"
            ["aut"]="Autotranslate the translation files, if active"
            ["mrg"]="Merge translations to create for each language a single source of truth"
            ["web"]="Extract all data model for html rendering "
            ["met"]="Extract metadata for html rendering"
            ["html"]="Render html using generic nunjuncks"
            ["rspc"]="Render html using specific RESPEC integration "
            ["ctx"]="JSON-LD Context file generation"
            ["rdf"]="RDF file generation"
            ["shcl"]="SHACL file generation"
            ["swag"]="Swagger file generation"
            ["bundle"]="Resource bundling"
            ["issu"]="Open Issues"
        )

        for term in "${!terms[@]}"; do
            echo "| $term | ${terms[$term]} |" >>${OVERVIEW}
        done

        echo "" >>${OVERVIEW}
        echo "</details>" >>${OVERVIEW}
        echo "" >>${OVERVIEW}

        echo "| Specification | tag | uml | val | stak | trns | aut  | mrg | web | met | html | rspc| ctx | rdf | shcl | swag | bundle | issu |" >>${OVERVIEW}
        echo "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |" >>${OVERVIEW}
    fi
}

render_report_line() {
    local LINE=$1
    local RLINE=$2
    local JSONI=$3
    local EXECUTIONVIEW=$4
    local OLD_GLOBAL_OVERVIEW=$5
    local GLOBAL_OVERVIEW=$6

    render_report_header ${EXECUTIONVIEW}
    local FIRSTPARTLINE=$(echo $LINE | cut -d'/' -f2-3)
    local SECONDPARTLINE=$(echo $LINE | cut -d'/' -f4-)
    HOSTNAME=$(jq -r .hostname ${JSONI})
    URLREF=$(jq -r .urlref ${JSONI})
    echo -n "| [${FIRSTPARTLINE}/ ${SECONDPARTLINE}](${HOSTNAME}${URLREF}) <br/> [&#9883;](/report4/${LINE}) [&#9884;](${HOSTNAME}${URLREF})" >>${EXECUTIONVIEW}

    REPORTS="branchtag oslo-converter-ea jsonld-validation oslo-stakeholders-converter translate autotranslate merge generator-webuniversum-json metadata generator-html generator-respec generator-jsonld-context generator-rdf generator-shacl generator-swagger bundle"

    for REPORTFILE in ${REPORTS}; do
        REPORTPATH=${RLINE}/${REPORTFILE}.report.md
        REPORTLINK=/report4/${LINE}/${REPORTFILE}.report.md
        if [ "${REPORTFILE}" == "bundle" ] && [ ! -f "${REPORTPATH}" ] && [ -f "${RLINE}/bundle.report.md" ]; then
            REPORTPATH=${RLINE}/bundle.report.md
            REPORTLINK=/report4/${LINE}/bundle.report.md
        fi
        if [ -f ${REPORTPATH} ]; then
            check_tool_output_for_non_emptiness ${REPORTPATH}
            echo -n "| [${REPORTSTATE}](${REPORTLINK})" >>${EXECUTIONVIEW}
        else
            echo -n "| " >>${EXECUTIONVIEW}
        fi
    done

    REPOSITORY=$(jq -r '.repository // empty' ${JSONI})
    FEEDBACKURL=$(jq -r '.feedbackurl // empty' ${JSONI})
    if [ -n "${REPOSITORY}" ] && [ -n "${FEEDBACKURL}" ] && [ "${REPOSITORY}/issues" != "${FEEDBACKURL}" ]; then
        echo "WARNING: feedback url and thema repository differ"
        echo "       REPOSITORY > ${REPOSITORY}/issues"
        echo "       FEEDBACK   > ${FEEDBACKURL}"
    fi

    if [ -n "${REPOSITORY}" ]; then
        countRepoIssues.sh ${REPOSITORY} /tmp/issues || true
    else
        echo "0" > /tmp/issues
    fi
    NBIssues=$(cat /tmp/issues)
    echo -n "| [ ${NBIssues} ](${REPOSITORY:-unknown}/issues)" >>${EXECUTIONVIEW}

    echo "|" >>${EXECUTIONVIEW}

    if ! node /app/merge-overviewreport.js -p ${OLD_GLOBAL_OVERVIEW} -c ${EXECUTIONVIEW} -o ${GLOBAL_OVERVIEW}; then
        echo "RENDER-DETAILS: failed"
        execution_strictness
    else
        echo "RENDER-DETAILS: overview merged succesfully"
    fi

    for REPORTFILE in ${REPORTS}; do
        REPORTPATH=${RLINE}/${REPORTFILE}.report.md
        if [ "${REPORTFILE}" == "bundle" ] && [ ! -f "${REPORTPATH}" ] && [ -f "${RLINE}/bundle.report.md" ]; then
            REPORTPATH=${RLINE}/bundle.report.md
        fi
        if [ -f ${REPORTPATH} ]; then
            LINK=$(basename $JSONI)
            log_command ${REPORTPATH} node /app/report_lines_links.js -i ${JSONI} -o /tmp/reportlines
            node /app/report_lines_links.js -i ${JSONI} -o /tmp/reportlines || true
            REF=$(basename ${JSONI})
            if [ -f /tmp/reportlines ] && [ -s /tmp/reportlines ]; then
                sed -E "s|(urn:.*) = (.*)|s \1 [\1](${REF}#L\2) g|g " /tmp/reportlines >/tmp/markdown_report_lines
                cat /tmp/markdown_report_lines | while read line; do
                    sed -i -E "$line" ${REPORTPATH}
                done
            fi
            sed -i "s/$/\n/" ${REPORTPATH}
        fi
    done
}

consolidate_reporting() {
    local RLINE=$1

    for dir in context rdf html respec shacl swagger jsonld-validation; do
        if [ -d "${RLINE}/${dir}" ]; then
            cp -r ${RLINE}/${dir}/* ${RLINE}
            rm -rvf ${RLINE}/${dir}
        else
            echo "No ${dir} directory found"
        fi
    done
}

# --- Merge -------------------------------------------------------------------

render_merged_files() {
    local PRIMELANGUAGE=$1
    local GOALLANGUAGE=$2
    local JSONI=$3
    local SLINE=$4
    local TLINE=$5
    local RLINE=$6

    FILENAME=$(jq -r ".name" ${JSONI})
    GOALFILENAME=${FILENAME}_${GOALLANGUAGE}.json

    COMMANDLANGJSON=$(echo '.translation | .[] | select(.language | contains("'${GOALLANGUAGE}'")) | .autotranslate')
    USEAUTOTRANSLATION=$(jq -r "${COMMANDLANGJSON}" ${JSONI})
    TRANSLATIONFILE=${GOALFILENAME}

    REPORTFILE=${TLINE}/merge.report.md
    echo "${REPORTLINEPREFIX}merge for language ${GOALLANGUAGE} ${REPORTLINENEWLINE}" &>>${REPORTFILE}
    echo "${REPORTLINEPREFIX}-------------------------------------${REPORTLINENEWLINE}" &>>${REPORTFILE}

    if [ "${USEAUTOTRANSLATION}" == "" ] || [ "${USEAUTOTRANSLATION}" == "null" ]; then
        INPUTTRANSLATIONFILE=${TLINE}/translation/${TRANSLATIONFILE}
    else
        if [ "${USEAUTOTRANSLATION}" == true ]; then
            INPUTTRANSLATIONFILE=${TLINE}/autotranslation/${TRANSLATIONFILE}
        else
            INPUTTRANSLATIONFILE=${TLINE}/translation/${TRANSLATIONFILE}
        fi
    fi

    if [ -f "${INPUTTRANSLATIONFILE}" ]; then
        echo "A translation file ${TRANSLATIONFILE} exists."
        sed -i -e "s/${GOALLANGUAGE}-t-${PRIMELANGUAGE}/${GOALLANGUAGE}/g" ${INPUTTRANSLATIONFILE}
    fi

    mkdir -p ${RLINE}/merged
    MERGEDFILENAME=merged_${FILENAME}_${GOALLANGUAGE}.jsonld
    MERGEDFILE=${RLINE}/merged/${MERGEDFILENAME}

    if [ "${PRIMELANGUAGE}" == "${GOALLANGUAGE}" ]; then
        echo "The primelanguage and the goallanguage are the same: nothing to merge. Just copy it"
        cp ${JSONI} ${MERGEDFILE}
    else
        if [ -f "${INPUTTRANSLATIONFILE}" ]; then
            echo "${INPUTTRANSLATIONFILE} exists, the files will be merged."
            log_command ${REPORTFILE} node /app/translation-json-update.js -i ${JSONI} -f ${INPUTTRANSLATIONFILE} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE} -o ${MERGEDFILE} -p "${REPORTLINEPREFIX}"
            if ! node /app/translation-json-update.js -i ${JSONI} -f ${INPUTTRANSLATIONFILE} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE} -o ${MERGEDFILE} -p "${REPORTLINEPREFIX}" &>>${REPORTFILE}; then
                echo "RENDER-DETAILS: failed"
                execution_strictness
            else
                echo "RENDER-DETAILS: Files succesfully merged and saved to: ${MERGEDFILE}"
                prettyprint_jsonld ${MERGEDFILE}
            fi
        else
            echo "${INPUTTRANSLATIONFILE} does not exist, nothing to merge. Just copy it"
            cp ${JSONI} ${MERGEDFILE}
        fi
    fi
}

# --- Metadata ----------------------------------------------------------------

render_metadata() {
    local GOALLANGUAGE=$1
    local JSONI=$2
    local DROOT=$3
    local SLINE=$4
    local TLINE=$5

    FILENAME=$(jq -r ".name" ${JSONI})
    BRANCHTAG=$(jq -r '.branchtag // empty' ${JSONI})
    METAOUTPUTFILENAME=meta_${FILENAME}_${GOALLANGUAGE}.json
    mkdir -p ${TLINE}/html
    METAOUTPUT=${TLINE}/html/${METAOUTPUTFILENAME}

    REPORTFILE=${TLINE}/metadata.report.md
    echo "${REPORTLINEPREFIX}metadata for language ${GOALLANGUAGE} ${REPORTLINENEWLINE}" &>>${REPORTFILE}
    echo "${REPORTLINEPREFIX}-------------------------------------${REPORTLINENEWLINE}" &>>${REPORTFILE}

    ARGS=( -i "${JSONI}" -g "${PRIMELANGUAGE}" -m "${GOALLANGUAGE}" -h "${HOSTNAME}" -r "/${DROOT}" -u "${URIDOMAIN}" -o "${METAOUTPUT}" -p "${REPORTLINEPREFIX}" )
    log_command ${REPORTFILE} node /app/html-metadata-generator.js "${ARGS[@]}"
    if ! node /app/html-metadata-generator.js "${ARGS[@]}" &>>"${REPORTFILE}"; then
        echo "RENDER-DETAILS: failed"
        execution_strictness
    else
        echo "RENDER-DETAILS: metadata file succesfully updated"
        if [ -n "${BRANCHTAG}" ] && [ -f "${METAOUTPUT}" ]; then
            jq --arg bt "${BRANCHTAG}" '. + {"branchtag": $bt}' "${METAOUTPUT}" > /tmp/meta_bt.json && mv /tmp/meta_bt.json "${METAOUTPUT}"
        fi

        AVAILABLE_LANGUAGES=("${PRIMELANGUAGE}")
        for lang in $(jq -r '.otherLanguages[]' ${CONFIGDIR}/config.json); do
            generate_for_language ${lang} ${JSONI}
            if [ "${GENERATEDARTEFACT}" == "true" ] || [ "${GENERATEDARTEFACT}" == true ]; then
                AVAILABLE_LANGUAGES+=("${lang}")
            fi
        done

        if [ -f "${METAOUTPUT}" ]; then
            AVAILABLE_JSON=$(printf '%s\n' "${AVAILABLE_LANGUAGES[@]}" | jq -R . | jq -s .)
            jq --argjson availableLanguages "${AVAILABLE_JSON}" '. + {availableLanguages: $availableLanguages}' "${METAOUTPUT}" > /tmp/meta_avail.json && mv /tmp/meta_avail.json "${METAOUTPUT}"
        fi

        pretty_print_json ${METAOUTPUT}
    fi
}

# --- Validation --------------------------------------------------------------

validate_jsonld() {
    local SLINE=$1
    local TLINE=$2
    local JSONI=$3
    local RLINE=$4
    local LANGUAGE=$5

    MERGEDFILE=${JSONI}
    TYPE=$(jq -r '.type' ${JSONI})
    SPECTYPE=$(spectype_for ${JSONI})
    generator_parameters jsonldvalidation ${JSONI}

    mkdir -p ${RLINE}

    REPORTFILE=${RLINE}/jsonld-validation.report.md
    echo "${REPORTLINEPREFIX}oslo-jsonld-validator ${REPORTLINENEWLINE}" &>>${REPORTFILE}
    echo "${REPORTLINEPREFIX}-------------------------------------${REPORTLINENEWLINE}" &>>${REPORTFILE}
    log_command ${REPORTFILE} oslo-jsonld-validator --input ${MERGEDFILE} --whitelist https://raw.githubusercontent.com/Informatievlaanderen/OSLO-UML-Transformer/refs/heads/configuration/whitelist.json --specificationType ${SPECTYPE} --publicationEnvironment ${URIDOMAIN} --language ${LANGUAGE} ${PARAMETERS}

    oslo-jsonld-validator --input ${MERGEDFILE} \
    --whitelist https://raw.githubusercontent.com/Informatievlaanderen/OSLO-UML-Transformer/refs/heads/configuration/whitelist.json \
    --specificationType ${SPECTYPE} \
    --publicationEnvironment $URIDOMAIN \
    --language ${LANGUAGE} \
    ${PARAMETERS} \
    2>&1 | tee -a ${REPORTFILE}

    echo ${REPORTFILE}
    echo "RENDER-DETAILS(JSONLD-VALIDATION): File was rendered in ${REPORTFILE}"
}

# --- Translation files -------------------------------------------------------

render_translationfiles() {
    local PRIMELANGUAGE=$1
    local GOALLANGUAGE=$2
    local JSONI=$3
    local SLINE=$4
    local TLINE=$5

    FILENAME=$(jq -r ".name" ${JSONI})
    PRIMEOUTPUTFILENAME=${FILENAME}_${PRIMELANGUAGE}.json
    GOALOUTPUTFILENAME=${FILENAME}_${GOALLANGUAGE}.json
    TRANSLATIONFILE=${GOALOUTPUTFILENAME}

    mkdir -p ${TLINE}/translation
    INPUTTRANSLATIONFILE=${SLINE}/translation/${TRANSLATIONFILE}
    OUTPUTTRANSLATIONFILE=${TLINE}/translation/${TRANSLATIONFILE}

    REPORTFILE=${TLINE}/translate.report.md
    echo "INPUTTRANSLATIONFILE: ${INPUTTRANSLATIONFILE}" &>>${REPORTFILE}
    echo "OUTPUTTRANSLATIONFILE: ${OUTPUTTRANSLATIONFILE}" &>>${REPORTFILE}
    echo "TRANSLATIONFILE: ${TRANSLATIONFILE}" &>>${REPORTFILE}
    echo "${REPORTLINEPREFIX}translate for language ${GOALLANGUAGE}${REPORTLINENEWLINE}" &>>${REPORTFILE}
    echo "${REPORTLINEPREFIX}-------------------------------------${REPORTLINENEWLINE}" &>>${REPORTFILE}

    if [ -f "${INPUTTRANSLATIONFILE}" ]; then
        echo "A translation file ${TRANSLATIONFILE} exists."
        log_command ${REPORTFILE} node /app/translation-json-generator.js -i ${JSONI} -t ${INPUTTRANSLATIONFILE} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE} -o ${OUTPUTTRANSLATIONFILE} -p "${REPORTLINEPREFIX}"
        if ! node /app/translation-json-generator.js -i ${JSONI} -t ${INPUTTRANSLATIONFILE} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE} -o ${OUTPUTTRANSLATIONFILE} -p "${REPORTLINEPREFIX}" &>>${REPORTFILE}; then
            echo "RENDER-DETAILS: failed"
        else
            echo "RENDER-DETAILS: translation file succesfully updated"
            pretty_print_json ${OUTPUTTRANSLATIONFILE}
        fi
    else
        echo "NO translation file ${TRANSLATIONFILE} exists"
        log_command ${REPORTFILE} node /app/translation-json-generator.js -i ${JSONI} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE} -o ${OUTPUTTRANSLATIONFILE} -p "${REPORTLINEPREFIX}"
        if ! node /app/translation-json-generator.js -i ${JSONI} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE} -o ${OUTPUTTRANSLATIONFILE} -p "${REPORTLINEPREFIX}" &>>${REPORTFILE}; then
            echo "RENDER-DETAILS: failed"
        else
            echo "RENDER-DETAILS: translation file succesfully created"
            pretty_print_json ${OUTPUTTRANSLATIONFILE}
        fi
    fi
}

# --- Autotranslate -----------------------------------------------------------

autotranslatefiles() {
    local PRIMELANGUAGE=$1
    local GOALLANGUAGE=$2
    local JSONI=$3
    local SLINE=$4
    local TLINE=$5
    local MEMORYLINE=$6

    FILENAME=$(jq -r ".name" ${JSONI})
    PRIMEOUTPUTFILENAME=${FILENAME}_${PRIMELANGUAGE}.json
    GOALOUTPUTFILENAME=${FILENAME}_${GOALLANGUAGE}.json
    TRANSLATIONFILE=${GOALOUTPUTFILENAME}

    mkdir -p ${TLINE}/autotranslation
    mkdir -p ${TLINE}/translation_input
    INPUTTRANSLATIONFILE=${TLINE}/translation_input/${TRANSLATIONFILE}
    OUTPUTTRANSLATIONFILE=${TLINE}/autotranslation/${TRANSLATIONFILE}

    REPORTFILE=${TLINE}/autotranslate.report.md
    echo "${REPORTLINEPREFIX}autotranslate for language ${GOALLANGUAGE}${REPORTLINENEWLINE}" &>>${REPORTFILE}
    echo "${REPORTLINEPREFIX}-------------------------------------${REPORTLINENEWLINE}" &>>${REPORTFILE}

    if [ -f ${MEMORYLINE}/${TRANSLATIONFILE} ]; then
        echo "translation memory exists on ${MEMORYLINE}."
        echo "${REPORTLINEPREFIX} update the translation file from the memory" &>>${REPORTFILE}
        echo "${REPORTLINEPREFIX}" &>>${REPORTFILE}

        log_command ${REPORTFILE} node /app/translation-json-generator.js -i ${JSONI} -t ${MEMORYLINE}/${TRANSLATIONFILE} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE}-t-${PRIMELANGUAGE} -o ${INPUTTRANSLATIONFILE} -p "${REPORTLINEPREFIX}"
        if ! node /app/translation-json-generator.js -i ${JSONI} -t ${MEMORYLINE}/${TRANSLATIONFILE} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE}-t-${PRIMELANGUAGE} -o ${INPUTTRANSLATIONFILE} -p "${REPORTLINEPREFIX}" &>>${REPORTFILE}; then
            echo "RENDER-DETAILS: failed"
            execution_strictness
        else
            echo "RENDER-DETAILS: translation file succesfully updated"
            pretty_print_json ${OUTPUTTRANSLATIONFILE}
        fi
    else
        echo "use translation template as input for auto translation"
        cp ${TLINE}/translation/${TRANSLATIONFILE} ${INPUTTRANSLATIONFILE}
    fi

    if [ -f "${INPUTTRANSLATIONFILE}" ]; then
        echo "A translation file ${TRANSLATIONFILE} exists."
        sed -i -e "s/${GOALLANGUAGE}-t-${PRIMELANGUAGE}/${GOALLANGUAGE}/g" ${INPUTTRANSLATIONFILE}
    fi

    if [ -f "${INPUTTRANSLATIONFILE}" ]; then
        echo "A translation file ${TRANSLATIONFILE} exists."
        echo "${REPORTLINEPREFIX}" &>>${REPORTFILE}
        echo "${REPORTLINEPREFIX} autotranslate the translation file for language ${GOALLANGUAGE}" &>>${REPORTFILE}
        echo "${REPORTLINEPREFIX}" &>>${REPORTFILE}
        log_command ${REPORTFILE} node /app/autotranslate.js -i ${INPUTTRANSLATIONFILE} -s ${AZURETRANSLATIONKEY} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE} -o ${OUTPUTTRANSLATIONFILE} -p "${REPORTLINEPREFIX}"
        if ! node /app/autotranslate.js -i ${INPUTTRANSLATIONFILE} -s ${AZURETRANSLATIONKEY} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE} -o ${OUTPUTTRANSLATIONFILE} -p "${REPORTLINEPREFIX}" &>>${REPORTFILE}; then
            echo "RENDER-DETAILS: failed"
            execution_strictness
        else
            echo "RENDER-DETAILS: translation file succesfully updated"
            pretty_print_json ${OUTPUTTRANSLATIONFILE}
        fi
    fi

    pushd ${SLINE}/templates
    FILESTOPROCESS=$(find . -name "*.j2" -exec basename {} .j2 \;)
    for transi in ${FILESTOPROCESS}; do
        echo "process $transi"
        J2FILE=${transi}_${GOALLANGUAGE}.j2
        MD5SUMFILE=${transi}.j2.md5sum
        echo "${REPORTLINEPREFIX}" &>>${REPORTFILE}
        echo "${REPORTLINEPREFIX} autotranslate the J2 templates for language ${GOALLANGUAGE}" &>>${REPORTFILE}
        echo "${REPORTLINEPREFIX}" &>>${REPORTFILE}
        if [ -f ${MEMORYLINE}/${J2FILE} ]; then
            echo "translation memory contains ${J2FILE}"
            if [ -f ${MEMORYLINE}/$MD5SUMFILE ]; then
                CURSUM=$(md5sum ${transi}.j2)
                MEMSUM=$(cat ${MEMORYLINE}/${MD5SUMFILE})
                if [ "${CURSUM}" = "${MEMSUM}" ]; then
                    cp ${MEMORYLINE}/${J2FILE} ${TLINE}/autotranslation/${J2FILE}
                else
                    md5sum ${transi}.j2 >${TLINE}/autotranslation/${MD5SUMFILE}
                    log_command ${REPORTFILE} node /app/autotranslateJ2.js -i ${transi}.j2 -o ${TLINE}/autotranslation/${J2FILE} -s ${AZURETRANSLATIONKEY} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE} -p "${REPORTLINEPREFIX}"
                    if ! node /app/autotranslateJ2.js -i ${transi}.j2 -o ${TLINE}/autotranslation/${J2FILE} -s ${AZURETRANSLATIONKEY} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE} -p "${REPORTLINEPREFIX}" &>>${REPORTFILE}; then
                        echo "RENDER-DETAILS: failed"
                        execution_strictness
                    else
                        echo "RENDER-DETAILS: J2 file succesfully updated"
                    fi
                fi
            else
                md5sum ${transi}.j2 >${TLINE}/autotranslation/${MD5SUMFILE}
                log_command ${REPORTFILE} node /app/autotranslateJ2.js -i ${transi}.j2 -o ${TLINE}/autotranslation/${J2FILE} -s ${AZURETRANSLATIONKEY} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE} -p "${REPORTLINEPREFIX}"
                if ! node /app/autotranslateJ2.js -i ${transi}.j2 -o ${TLINE}/autotranslation/${J2FILE} -s ${AZURETRANSLATIONKEY} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE} -p "${REPORTLINEPREFIX}" &>>${REPORTFILE}; then
                    echo "RENDER-DETAILS: failed"
                    execution_strictness
                else
                    echo "RENDER-DETAILS: J2 file succesfully updated"
                fi
            fi
        else
            md5sum ${transi}.j2 >${TLINE}/autotranslation/${MD5SUMFILE}
            log_command ${REPORTFILE} node /app/autotranslateJ2.js -i ${transi}.j2 -o ${TLINE}/autotranslation/${J2FILE} -s ${AZURETRANSLATIONKEY} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE} -p "${REPORTLINEPREFIX}"
            if ! node /app/autotranslateJ2.js -i ${transi}.j2 -o ${TLINE}/autotranslation/${J2FILE} -s ${AZURETRANSLATIONKEY} -m ${PRIMELANGUAGE} -g ${GOALLANGUAGE} -p "${REPORTLINEPREFIX}" &>>${REPORTFILE}; then
                echo "RENDER-DETAILS: failed"
                execution_strictness
            else
                echo "RENDER-DETAILS: J2 file succesfully updated"
            fi
        fi
    done
    popd

    mkdir -p ${MEMORYLINE}
    cp -r ${TLINE}/autotranslation/* ${MEMORYLINE}
}

# --- RDF ---------------------------------------------------------------------

render_rdf() {
    local SLINE=$1
    local TLINE=$2
    local JSONI=$3
    local RLINE=$4
    local DROOT=$5
    local RRLINE=$6
    local LANGUAGE=$7
    local PRIMELANGUAGE=${8-false}

    OUTPUTDIR=${TLINE}/voc
    mkdir -p ${OUTPUTDIR}

    MERGEDFILE=$(resolve_merged_file ${JSONI} ${SLINE} ${LANGUAGE})

    VOCNAME=$(jq -r '.name' ${MERGEDFILE})
    TYPE=$(jq -r '.type' ${MERGEDFILE})

    REPORTFILE=${RLINE}/generator-rdf.report.md

    OUTPUT=${OUTPUTDIR}/${VOCNAME}_${LANGUAGE}.ttl
    OUTPUTFORMAT="text/turtle"

    generator_parameters rdfgenerator ${JSONI}

    if [ ${TYPE} == "voc" ]; then
        SPECTYPE=$(spectype_for ${MERGEDFILE})

        echo "${REPORTLINEPREFIX}oslo-generator-rdf for language ${LANGUAGE}${REPORTLINENEWLINE}" &>>${REPORTFILE}
        echo "${REPORTLINEPREFIX}-------------------------------------${REPORTLINENEWLINE}" &>>${REPORTFILE}
        log_command ${REPORTFILE} oslo-generator-rdf --input ${MERGEDFILE} --output ${OUTPUT} --contentType ${OUTPUTFORMAT} --silent false --language ${LANGUAGE} ${PARAMETERS}
        if ! oslo-generator-rdf \
        --input ${MERGEDFILE} \
        --output ${OUTPUT} \
        --contentType ${OUTPUTFORMAT} \
        --silent false \
        --language ${LANGUAGE} \
        ${PARAMETERS} \
        &>>${REPORTFILE}; then
            echo "RENDER-DETAILS: failed"
            cat ${REPORTFILE}
            execution_strictness
        fi
        if [ -f ${OUTPUT} ]; then
            echo "RENDER-DETAILs: success"
        else
            echo "RENDER-DETAILS: failed"
            cat ${REPORTFILE}
            execution_strictness
        fi

        if [ ${PRIMELANGUAGE} == true ]; then
            cp ${OUTPUT} ${OUTPUTDIR}/${VOCNAME}.ttl
        fi
        echo "RENDER-DETAILS(RDF): File was rendered in ${OUTPUT}"
    fi
}

# --- HTML (Nunjucks) ---------------------------------------------------------

render_nunjucks_html() {
    local SLINE=$1
    local TLINE=$2
    local JSONI=$3
    local RLINE=$4
    local DROOT=$5
    local RRLINE=$6
    local LANGUAGE=$7
    local PRIMELANGUAGE=${8-false}

    TYPE=$(jq -r '.type' ${JSONI})
    SPECTYPE=$(spectype_for ${JSONI})

    echo "Creating a webuniversum config for a ${TYPE}"

    FILENAME=$(jq -r ".name" ${JSONI})
    MERGEDFILE=$(resolve_merged_file ${JSONI} ${RRLINE} ${LANGUAGE})

    mkdir -p ${RLINE}/html
    INT_OUTPUT=${RLINE}/html/int_${FILENAME}_${LANGUAGE}.json
    INT_REPORTFILE=${RLINE}/generator-webuniversum-json.report.md

    generator_parameters webuniversumgenerator ${JSONI}

    echo "${REPORTLINEPREFIX}oslo-webuniversum-json-generator for language ${LANGUAGE}${REPORTLINENEWLINE}" &>>${INT_REPORTFILE}
    echo "${REPORTLINEPREFIX}-------------------------------------${REPORTLINENEWLINE}" &>>${INT_REPORTFILE}
    log_command ${INT_REPORTFILE} oslo-webuniversum-json-generator --input ${MERGEDFILE} --output ${INT_OUTPUT} --specificationType ${SPECTYPE} --language ${LANGUAGE} --publicationEnvironment ${HOSTNAME} ${PARAMETERS}
    if ! oslo-webuniversum-json-generator \
    --input ${MERGEDFILE} \
    --output ${INT_OUTPUT} \
    --specificationType ${SPECTYPE} \
    --language ${LANGUAGE} \
    --publicationEnvironment $HOSTNAME \
    ${PARAMETERS} \
    &>>${INT_REPORTFILE}; then
        echo "RENDER-DETAILS: failed"
        cat ${INT_REPORTFILE}
        execution_strictness
    fi

    generator_parameters htmlgenerator ${JSONI}

    mkdir -p ${RRLINE}/templates
    cp -n ${SLINE}/templates/* ${RRLINE}/templates 2>/dev/null || true
    cp -n ${RRLINE}/autotranslation/*.j2 ${RRLINE}/templates 2>/dev/null || true
    cp -n ${HOME}/project/templates/* ${RRLINE}/templates 2>/dev/null || true
    cp -n /usr/local/lib/oslo/packages/oslo-generator-html/lib/templates/* ${RRLINE}/templates 2>/dev/null || true
    mkdir -p ${RLINE}

    OUTPUT=${TLINE}/index_${LANGUAGE}.html
    COMMANDTEMPLATELANG=$(echo '.translation | .[] | select(.language | contains("'${LANGUAGE}'")) | .template')
    TEMPLATELANG=$(jq -r "${COMMANDTEMPLATELANG}" ${JSONI})
    COMMANDTITLELANG=$(echo '.translation | .[] | select(.title | contains("'${LANGUAGE}'")) | .template')
    TITLELANG=$(jq -r "${COMMANDTITLELANG}" ${JSONI})

    REPORTFILE=${RLINE}/generator-html.report.md

    METADATA=${RRLINE}/html/meta_${FILENAME}_${LANGUAGE}.json
    STAKEHOLDERS=${RRLINE}/stakeholders.json

    echo "${REPORTLINEPREFIX}oslo-generator-html for language ${LANGUAGE}${REPORTLINENEWLINE}" &>>${REPORTFILE}
    echo "${REPORTLINEPREFIX}-------------------------------------${REPORTLINENEWLINE}" &>>${REPORTFILE}
    log_command ${REPORTFILE} oslo-generator-html --input ${INT_OUTPUT} --output ${OUTPUT} --stakeholders ${STAKEHOLDERS} --metadata ${METADATA} --specificationType ${SPECTYPE} --specificationName ${TITLELANG} --templates ${RRLINE}/templates --rootTemplate ${TEMPLATELANG} --silent false --language ${LANGUAGE} ${PARAMETERS}
    if ! eval oslo-generator-html \
    --input ${INT_OUTPUT} \
    --output ${OUTPUT} \
    --stakeholders ${STAKEHOLDERS} \
    --metadata ${METADATA} \
    --specificationType ${SPECTYPE} \
    --specificationName ${TITLELANG} \
    --templates ${RRLINE}/templates \
    --rootTemplate ${TEMPLATELANG} \
    --silent false \
    --language ${LANGUAGE} \
    ${PARAMETERS} \
    &>>${REPORTFILE}; then
        echo "RENDER-DETAILS: failed"
        cat ${REPORTFILE}
        execution_strictness
    fi
    if [ -f ${OUTPUT} ]; then
        echo "RENDER-DETAILs: success"
    else
        echo "RENDER-DETAILS: failed"
        cat ${REPORTFILE}
        execution_strictness
    fi

    if [ ${PRIMELANGUAGE} == true ]; then
        cp ${OUTPUT} ${TLINE}/index.html
    fi
    echo "RENDER-DETAILS(language html): File was rendered in ${OUTPUT}"
}

# --- Respec HTML -------------------------------------------------------------

render_respec_html() {
    local SLINE=$1
    local TLINE=$2
    local JSONI=$3
    local RLINE=$4
    local DROOT=$5
    local RRLINE=$6
    local LANGUAGE=$7
    local PRIMELANGUAGE=${8-false}

    FILENAME=$(jq -r ".name" ${JSONI})
    MERGEDFILE=$(resolve_merged_file ${JSONI} ${RRLINE} ${LANGUAGE})

    mkdir -p ${RLINE}

    TYPE=$(jq -r '.type' ${JSONI})
    mkdir -p ${TLINE}/html

    OUTPUT=${TLINE}/respec-index_${LANGUAGE}.html
    COMMANDTEMPLATELANG=$(echo '.translation | .[] | select(.language | contains("'${LANGUAGE}'")) | .template')
    TEMPLATELANG=$(jq -r "${COMMANDTEMPLATELANG}" ${JSONI})
    COMMANDTITLELANG=$(echo '.translation | .[] | select(.title | contains("'${LANGUAGE}'")) | .template')
    TITLELANG=$(jq -r "${COMMANDTITLELANG}" ${JSONI})

    REPORTFILE=${RLINE}/generator-respec.report.md
    generator_parameters respecgenerator ${JSONI}

    SPECTYPE=$(spectype_for ${JSONI})

    echo "${REPORTLINEPREFIX}oslo-generator-respec for language ${LANGUAGE}${REPORTLINENEWLINE}" &>>${REPORTFILE}
    echo "${REPORTLINEPREFIX}-------------------------------------${REPORTLINENEWLINE}" &>>${REPORTFILE}
    log_command ${REPORTFILE} oslo-generator-respec --input ${MERGEDFILE} --output ${OUTPUT} --specificationType ${SPECTYPE} --specificationName ${TITLELANG} --silent false --language ${LANGUAGE} ${PARAMETERS}
    if ! eval oslo-generator-respec \
    --input ${MERGEDFILE} \
    --output ${OUTPUT} \
    --specificationType ${SPECTYPE} \
    --specificationName ${TITLELANG} \
    --silent false \
    --language ${LANGUAGE} \
    ${PARAMETERS} \
    &>>${REPORTFILE}; then
        echo "RENDER-DETAILS: failed"
        cat ${REPORTFILE}
        execution_strictness
    fi
}

# --- JSON-LD Context ---------------------------------------------------------

render_context() {
    local SLINE=$1
    local TLINE=$2
    local JSONI=$3
    local RLINE=$4
    local GOALLANGUAGE=$5
    local PRIMELANGUAGE=${6-false}

    FILENAME=$(jq -r ".name" ${JSONI})
    OUTFILE=${FILENAME}.jsonld
    OUTFILELANGUAGE=${FILENAME}_${GOALLANGUAGE}.jsonld

    MERGEDFILE=$(resolve_merged_file ${JSONI} ${SLINE} ${GOALLANGUAGE})

    REPORTFILE=${RLINE}/generator-jsonld-context.report.md
    mkdir -p ${RLINE}

    TYPE=$(jq -r '.type' ${JSONI})
    OUTPUT=${TLINE}/context/${OUTFILELANGUAGE}

    SPECTYPE=$(spectype_for ${JSONI})
    generator_parameters contextgenerator ${JSONI}

    if [ ${SPECTYPE} == "ApplicationProfile" ]; then
        mkdir -p ${TLINE}/context

        echo "${REPORTLINEPREFIX}oslo-jsonld-context-generator for language ${GOALLANGUAGE}${REPORTLINENEWLINE}" &>>${REPORTFILE}
        echo "${REPORTLINEPREFIX}-------------------------------------${REPORTLINENEWLINE}" &>>${REPORTFILE}
        log_command ${REPORTFILE} oslo-jsonld-context-generator --input ${MERGEDFILE} --language ${GOALLANGUAGE} --output ${OUTPUT} ${PARAMETERS}
        if ! oslo-jsonld-context-generator \
        --input ${MERGEDFILE} \
        --language ${GOALLANGUAGE} \
        --output ${OUTPUT} \
        ${PARAMETERS} \
        &>>${REPORTFILE}; then
            echo "RENDER-DETAILS: failed"
            cat ${REPORTFILE}
            execution_strictness
        fi
        if [ -f ${OUTPUT} ]; then
            echo "RENDER-DETAILs: success"
        else
            echo "RENDER-DETAILS: failed"
            cat ${REPORTFILE}
            execution_strictness
        fi

        prettyprint_jsonld ${TLINE}/context/${OUTFILELANGUAGE}
        if [ ${PRIMELANGUAGE} == true ]; then
            cp ${TLINE}/context/${OUTFILELANGUAGE} ${TLINE}/context/${OUTFILE}
        fi
    fi
}

# --- Swagger -----------------------------------------------------------------

render_swagger() {
    local SLINE=$1
    local TLINE=$2
    local JSONI=$3
    local RLINE=$4
    local DROOT=$5
    local GOALLANGUAGE=$6
    local PRIMELANGUAGE=${7-false}

    FILENAME=$(jq -r ".name" ${JSONI})
    MERGEDFILE=$(resolve_merged_file ${JSONI} ${SLINE} ${GOALLANGUAGE})

    REPORTFILE=${RLINE}/generator-swagger.report.md
    mkdir -p ${RLINE}

    TYPE=$(jq -r '.type' ${JSONI})
    SPECTYPE=$(spectype_for ${JSONI})
    generator_parameters swaggergenerator ${JSONI}

    if [ ${SPECTYPE} == "ApplicationProfile" ]; then
        CONTEXT_URL="${HOSTNAME}/${DROOT}/context/${FILENAME}.jsonld"

        echo "${REPORTLINEPREFIX} oslo-generator-swagger for language ${GOALLANGUAGE}${REPORTLINENEWLINE}" &>>${REPORTFILE}
        echo "${REPORTLINEPREFIX} -------------------------------------${REPORTLINENEWLINE}" &>>${REPORTFILE}
        log_command ${REPORTFILE} oslo-generator-swagger --input ${MERGEDFILE} --language ${GOALLANGUAGE} --output ${TLINE} --versionAPI 1.0.0 --versionSwagger 3.0.4 --title "OpenAPI Swagger publication" --description "This is a inspirational OpenAPI Swagger publication" --contextURL ${CONTEXT_URL} --baseURL ${HOSTNAME} ${PARAMETERS}
        if ! eval oslo-generator-swagger \
        --input ${MERGEDFILE} \
        --language ${GOALLANGUAGE} \
        --output ${TLINE} \
        --versionAPI 1.0.0 \
        --versionSwagger 3.0.4 \
        --title "OpenAPI Swagger publication" \
        --description "This is a inspirational OpenAPI Swagger publication" \
        --contextURL ${CONTEXT_URL} \
        --baseURL ${HOSTNAME} \
        ${PARAMETERS} \
        &>>${REPORTFILE}; then
            echo "RENDER-DETAILS: failed"
            cat ${REPORTFILE}
            execution_strictness
        fi
        if [ -d ${TLINE} ]; then
            echo "RENDER-DETAILs: success"
        else
            echo "RENDER-DETAILS: failed"
            cat ${REPORTFILE}
            execution_strictness
        fi
    fi
}

# --- SHACL -------------------------------------------------------------------

render_shacl_languageaware() {
    local SLINE=$1
    local TLINE=$2
    local JSONI=$3
    local RLINE=$4
    local LINE=$5
    local GOALLANGUAGE=$6
    local PRIMELANGUAGE=${7-false}

    FILENAME=$(jq -r ".name" ${JSONI})
    MERGEDFILE=$(resolve_merged_file ${JSONI} ${SLINE} ${GOALLANGUAGE})

    OUTFILE=${TLINE}/shacl/${FILENAME}-SHACL_${GOALLANGUAGE}.jsonld
    OUTREPORT=${RLINE}/shacl/${FILENAME}-SHACL_${GOALLANGUAGE}.report.md

    REPORTFILE=${RLINE}/generator-shacl.report.md

    TYPE=$(jq -r '.type' ${JSONI})
    SPECTYPE=$(spectype_for ${JSONI})
    generator_parameters shaclgenerator ${JSONI}

    if [ ${SPECTYPE} == "ApplicationProfile" ]; then
        HH=$(echo ${HOSTNAME} | sed -e "s|/$||g")
        LL=$(echo ${LINE} | sed -e "s|^/||g")

        SHAPEBASEURI="${HH}/${LL}#"
        DOCUMENTURL="${HH}/${LL}"
        mkdir -p ${TLINE}/shacl
        mkdir -p ${RLINE}/shacl

        echo "${REPORTLINEPREFIX}oslo-shacl-template-generator for language ${GOALLANGUAGE}${REPORTLINENEWLINE}" &>>${REPORTFILE}
        echo "${REPORTLINEPREFIX}-------------------------------------${REPORTLINENEWLINE}" &>>${REPORTFILE}
        log_command ${REPORTFILE} oslo-shacl-template-generator --input ${MERGEDFILE} --language ${GOALLANGUAGE} --output ${OUTFILE} --shapeBaseURI ${SHAPEBASEURI} --applicationProfileURL ${DOCUMENTURL} ${PARAMETERS}
        if ! oslo-shacl-template-generator \
        --input ${MERGEDFILE} \
        --language ${GOALLANGUAGE} \
        --output ${OUTFILE} \
        --shapeBaseURI ${SHAPEBASEURI} \
        --applicationProfileURL ${DOCUMENTURL} \
        ${PARAMETERS} \
        &>>${REPORTFILE}; then
            echo "RENDER-DETAILS: failed"
            cat ${REPORTFILE}
            execution_strictness
        fi
        if [ -f ${OUTFILE} ]; then
            echo "RENDER-DETAILs: success"
        else
            echo "RENDER-DETAILS: failed"
            cat ${REPORTFILE}
            execution_strictness
        fi

        prettyprint_jsonld ${OUTFILE}
        if [ ${PRIMELANGUAGE} == true ]; then
            cp ${OUTFILE} ${TLINE}/shacl/${FILENAME}-SHACL.jsonld
        fi
    fi
}

# --- XSD (stub) --------------------------------------------------------------

render_xsd() {
    echo "RENDER-DETAILS(xsd): XSD generation is not yet implemented in version 4"
}

# --- Example templates (stub) ------------------------------------------------

render_example_template() {
    echo "RENDER-DETAILS(example): Example template generation is not yet implemented in version 4"
}

# --- Utilities ---------------------------------------------------------------

pretty_print_json() {
    if [ -f "$1" ]; then
        jq . $1 >/tmp/pp.json
        mv /tmp/pp.json $1
    fi
}

prettyprint_jsonld() {
    local FILE=$1
    if [ -f ${FILE} ]; then
        touch2 /tmp/pp/${FILE}
        jq --sort-keys . ${FILE} >/tmp/pp/${FILE}
        cp /tmp/pp/${FILE} ${FILE}
    fi
}

touch2() { mkdir -p "$(dirname "$1")" && touch "$1"; }