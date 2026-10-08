#!/bin/bash
# Thin dispatcher for the OSLO publication render pipeline.
# Sources the function library and dispatches to the requested render step.
#
# Usage: render-details4.sh <targetdir> <details> <configdir>
#   targetdir  – workspace root (e.g. /tmp/workspace)
#   details    – render step: html, rdf, shacl, context, swagger, validation,
#                metadata, translation, autotranslate, merge, bundle, report,
#                respec, xsd, example
#   configdir  – directory containing config.json

set -euo pipefail

TARGETDIR=$1
DETAILS=$2
CONFIGDIR=$3

# --- Load the function library -----------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=render-lib.sh
. "${SCRIPT_DIR}/render-lib.sh"

# --- Configuration -----------------------------------------------------------
PRIMELANGUAGECONFIG=$(jq -r .primeLanguage ${CONFIGDIR}/config.json)
GOALLANGUAGECONFIG=$(jq -r '.otherLanguages | @sh' ${CONFIGDIR}/config.json)
GOALLANGUAGECONFIG=$(echo ${GOALLANGUAGECONFIG} | sed -e "s/'//g")

PRIMELANGUAGE=${4-${PRIMELANGUAGECONFIG}}
GOALLANGUAGE=${5-${GOALLANGUAGECONFIG}}

STRICT=$(jq -r .toolchain.strictness ${CONFIGDIR}/config.json)
HOSTNAME=$(jq -r .hostname ${CONFIGDIR}/config.json)
URIDOMAIN=$(jq -r .domain ${CONFIGDIR}/config.json)

CHECKOUTFILE=${TARGETDIR}/checkouts.txt
export NODE_PATH=/app/node_modules

AUTOTRANSLATIONDIR=${TARGETDIR}/autotranslation

REPORTLINEPREFIX='#||# '
REPORTLINENEWLINE='  '

# --- Bundle step (runs outside the per-line loop) ----------------------------
if [ "${DETAILS}" == "bundle" ]; then
    echo "RENDER-DETAILS: bundling resources"
    if ! copy_resources_to_urlref.sh ${CONFIGDIR} ${TARGETDIR}/target ${TARGETDIR}; then
        echo "RENDER-DETAILS: bundling failed"
        exit 1
    fi
    exit 0
fi

# --- Per-publication-point dispatch ------------------------------------------
BUNDLING_EXECUTED=false

cat ${CHECKOUTFILE} | while read line; do
    SLINE=${TARGETDIR}/src/${line}
    TLINE=${TARGETDIR}/report4/${line}
    RLINE=${TARGETDIR}/report4/${line}
    TRLINE=${TARGETDIR}/translation/${line}
    echo "RENDER-DETAILS: Processing line ${SLINE} => ${TLINE},${RLINE}"

    if [ -d "${RLINE}" ]; then
        for i in ${RLINE}/all-*.jsonld; do
            echo "RENDER-DETAILS: convert $i using ${DETAILS}"
            case ${DETAILS} in
                html)
                    TLINE=${TARGETDIR}/target/${line}
                    RLINE=${TARGETDIR}/report4/html/${line}
                    mkdir -p ${TLINE} ${RLINE}
                    render_nunjucks_html $SLINE $TLINE $i $RLINE ${line} ${TARGETDIR}/report4/${line} ${PRIMELANGUAGE} true
                    for g in ${GOALLANGUAGE}; do
                        generate_for_language ${g} ${i}
                        if [ ${GENERATEDARTEFACT} == true ]; then
                            render_nunjucks_html $SLINE $TLINE $i $RLINE ${line} ${TARGETDIR}/report4/${line} ${g}
                        fi
                    done
                ;;
                respec)
                    TLINE=${TARGETDIR}/target/${line}
                    RLINE=${TARGETDIR}/report4/respec/${line}
                    mkdir -p ${TLINE} ${RLINE}
                    render_respec_html $SLINE $TLINE $i $RLINE ${line} ${TARGETDIR}/report4/${line} ${PRIMELANGUAGE} true
                    for g in ${GOALLANGUAGE}; do
                        generate_for_language ${g} ${i}
                        if [ ${GENERATEDARTEFACT} == true ]; then
                            render_respec_html $SLINE $TLINE $i $RLINE ${line} ${TARGETDIR}/report4/${line} ${g}
                        fi
                    done
                ;;
                rdf)
                    SLINE=${TARGETDIR}/report4/${line}
                    TLINE=${TARGETDIR}/target/${line}
                    RLINE=${TARGETDIR}/report4/rdf/${line}
                    mkdir -p ${TLINE} ${RLINE}
                    render_rdf $SLINE $TLINE $i $RLINE ${line} ${TARGETDIR}/report4/${line} ${PRIMELANGUAGE} true
                    for g in ${GOALLANGUAGE}; do
                        generate_for_language ${g} ${i}
                        if [ ${GENERATEDARTEFACT} == true ]; then
                            render_rdf $SLINE $TLINE $i $RLINE ${line} ${TARGETDIR}/report4/${line} ${g}
                        fi
                    done
                ;;
                shacl)
                    SLINE=${TARGETDIR}/report4/${line}
                    TLINE=${TARGETDIR}/target/${line}
                    RLINE=${TARGETDIR}/report4/shacl/${line}
                    mkdir -p ${TLINE} ${RLINE}
                    render_shacl_languageaware $SLINE $TLINE $i $RLINE ${line} ${PRIMELANGUAGE} true
                    for g in ${GOALLANGUAGE}; do
                        generate_for_language ${g} ${i}
                        if [ ${GENERATEDARTEFACT} == true ]; then
                            render_shacl_languageaware $SLINE $TLINE $i $RLINE ${line} ${g}
                        fi
                    done
                ;;
                context)
                    SLINE=${TARGETDIR}/report4/${line}
                    TLINE=${TARGETDIR}/target/${line}
                    RLINE=${TARGETDIR}/report4/context/${line}
                    mkdir -p ${TLINE} ${RLINE}
                    render_context $SLINE $TLINE $i $RLINE ${PRIMELANGUAGE} true
                    for g in ${GOALLANGUAGE}; do
                        generate_for_language ${g} ${i}
                        if [ ${GENERATEDARTEFACT} == true ]; then
                            render_context $SLINE $TLINE $i $RLINE ${g}
                        fi
                    done
                ;;
                swagger)
                    SLINE=${TARGETDIR}/report4/${line}
                    TLINE=${TARGETDIR}/target/${line}
                    RLINE=${TARGETDIR}/report4/swagger/${line}
                    mkdir -p ${TLINE} ${RLINE}
                    render_swagger $SLINE $TLINE $i $RLINE ${line} ${PRIMELANGUAGE} true
                    for g in ${GOALLANGUAGE}; do
                        generate_for_language ${g} ${i}
                        if [ ${GENERATEDARTEFACT} == true ]; then
                            render_swagger $SLINE $TLINE $i $RLINE ${line} ${g}
                        fi
                    done
                ;;
                validation)
                    SLINE=${TARGETDIR}/report4/${line}
                    TLINE=${TARGETDIR}/target/${line}
                    RLINE=${TARGETDIR}/report4/jsonld-validation/${line}
                    mkdir -p ${TLINE} ${RLINE}
                    validate_jsonld $SLINE $TLINE $i $RLINE ${PRIMELANGUAGE} true
                    for g in ${GOALLANGUAGE}; do
                        generate_for_language ${g} ${i}
                        if [ ${GENERATEDARTEFACT} == true ]; then
                            validate_jsonld $SLINE $TLINE $i $RLINE ${PRIMELANGUAGE} true
                        fi
                    done
                ;;
                xsd)
                    render_xsd $SLINE $TLINE $i $RLINE ${PRIMELANGUAGE} true
                    for g in ${GOALLANGUAGE}; do
                        generate_for_language ${g} ${i}
                        if [ ${GENERATEDARTEFACT} == true ]; then
                            render_xsd $SLINE $TLINE $i $RLINE ${g}
                        fi
                    done
                ;;
                metadata)
                    render_metadata ${PRIMELANGUAGE} $i ${line} ${SLINE} ${TLINE}
                    for g in ${GOALLANGUAGE}; do
                        render_metadata ${g} $i ${line} ${SLINE} ${TLINE}
                    done
                ;;
                translation)
                    render_translationfiles ${PRIMELANGUAGE} ${PRIMELANGUAGE} $i ${SLINE} ${TLINE}
                    for g in ${GOALLANGUAGE}; do
                        render_translationfiles ${PRIMELANGUAGE} ${g} $i ${SLINE} ${TLINE}
                    done
                ;;
                autotranslate)
                    for g in ${GOALLANGUAGE}; do
                        USEAUTOTRANSLATION=$(jq -r '.translation | .[] | select(.language == "'"${g}"'") | .autotranslate' $i)
                        if [ "${USEAUTOTRANSLATION}" == "true" ] || [ "${USEAUTOTRANSLATION}" == true ]; then
                            autotranslatefiles ${PRIMELANGUAGE} ${g} $i ${SLINE} ${TLINE} ${AUTOTRANSLATIONDIR}/${line}
                        fi
                    done
                ;;
                merge)
                    render_merged_files ${PRIMELANGUAGE} ${PRIMELANGUAGE} $i ${SLINE} ${TLINE} ${RLINE}
                    for g in ${GOALLANGUAGE}; do
                        render_merged_files ${PRIMELANGUAGE} ${g} $i ${SLINE} ${TLINE} ${RLINE}
                    done
                ;;
                bundle)
                    if [ "${BUNDLING_EXECUTED}" != "true" ]; then
                        echo "RENDER-DETAILS: bundling resources"
                        if ! copy_resources_to_urlref.sh ${CONFIGDIR} ${TARGETDIR}/target ${TARGETDIR}; then
                            echo "RENDER-DETAILS: bundling failed"
                            execution_strictness
                        fi
                        BUNDLING_EXECUTED=true
                    fi
                ;;
                report)
                    # Download the previous report4/README.md from the generated repository
                    # so the merge script can extend it rather than starting from scratch.
                    GENERATED_ORG=$(jq -r '.generatedrepository.organisation' ${CONFIGDIR}/config.json)
                    GENERATED_REPO=$(jq -r '.generatedrepository.repository' ${CONFIGDIR}/config.json)
                    GENERATED_BRANCH="${CIRCLE_BRANCH:-dev}"
                    if [ -n "${GENERATED_ORG}" ] && [ -n "${GENERATED_REPO}" ] && [ "${GENERATED_ORG}" != "null" ] && [ -n "${TOOLCHAIN_TOKEN:-}" ]; then
                        downloadFileGithub.sh \
                            "{\"organisation\":\"${GENERATED_ORG}\",\"repository\":\"${GENERATED_REPO}\",\"branchtag\":\"${GENERATED_BRANCH}\",\"filepath\":\"report4/README.md\"}" \
                            "${TARGETDIR}/README.md" \
                            "${TOOLCHAIN_TOKEN:-}" 2>/dev/null || true
                    fi
                    EXECUTIONVIEW=${TARGETDIR}/report4/overviewreport.md
                    OLD_GLOBAL_OVERVIEW=${TARGETDIR}/README.md
                    GLOBAL_OVERVIEW=${TARGETDIR}/report4/README.md
                    render_report_line ${line} ${RLINE} $i ${EXECUTIONVIEW} ${OLD_GLOBAL_OVERVIEW} ${GLOBAL_OVERVIEW}
                ;;
                example)
                    render_example_template $SLINE $TLINE $i $RLINE ${line} ${TARGETDIR}/report/${line} ${PRIMELANGUAGE}
                    for g in ${GOALLANGUAGE}; do
                        generate_for_language ${g} ${i}
                        if [ ${GENERATEDARTEFACT} == true ]; then
                            render_example_template $SLINE $TLINE $i $RLINE ${line} ${TARGETDIR}/report/${line} ${g}
                        fi
                    done
                ;;
                *) echo "RENDER-DETAILS: ${DETAILS} not handled yet" ;;
            esac
        done
    else
        echo "Error: ${SLINE}"
    fi
done
