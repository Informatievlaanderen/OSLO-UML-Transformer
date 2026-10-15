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

# Seed the previous report4/README.md from the generated repository so the
# merge script can extend it across all publication points instead of
# overwriting earlier entries.
#
# The seed is validated before use: merge-overviewreport.js parses the previous
# file by locating the "| Specification |" table header, and falls back to
# writing ONLY the current run's rows when the previous file is missing, empty,
# or unparseable. An invalid seed therefore silently destroys the accumulated
# overview, so we re-download when the existing file is not usable, and abort in
# strict mode when we cannot obtain a valid seed.
GENERATED_ORG=$(jq -r '.generatedrepository.organisation' ${CONFIGDIR}/config.json)
GENERATED_REPO=$(jq -r '.generatedrepository.repository' ${CONFIGDIR}/config.json)
GENERATED_BRANCH="${CIRCLE_BRANCH:-dev}"

global_overview_is_valid() {
    # A usable previous overview must exist and contain the main table header
    # that merge-overviewreport.js splits the legend from.
    [ -s "${TARGETDIR}/README.md" ] && grep -q "| Specification |" "${TARGETDIR}/README.md"
}

download_global_overview() {
    # No token is required for public repositories: downloadFileGithub.sh falls
    # back to the unauthenticated raw.githubusercontent.com path when the token
    # is empty, so we always attempt the download.
    if [ -n "${GENERATED_ORG}" ] && [ -n "${GENERATED_REPO}" ] && [ "${GENERATED_ORG}" != "null" ]; then
        downloadFileGithub.sh \
            "{\"organisation\":\"${GENERATED_ORG}\",\"repository\":\"${GENERATED_REPO}\",\"branchtag\":\"${GENERATED_BRANCH}\",\"filepath\":\"report4/README.md\"}" \
            "${TARGETDIR}/README.md" \
            "${TOOLCHAIN_TOKEN:-}" 2>/dev/null
    fi
}

if ! global_overview_is_valid; then
    if [ -f "${TARGETDIR}/README.md" ]; then
        echo "RENDER-DETAILS: existing ${TARGETDIR}/README.md is empty or missing the specification table; re-downloading fresh global overview"
    fi
    if ! download_global_overview || ! global_overview_is_valid; then
        echo "RENDER-DETAILS: WARNING - could not obtain a valid previous global overview; the merged report4/README.md may only contain this run's publication points"
        # Only reach the merge with an invalid seed in lazy mode: in strict mode
        # this is a hard failure because the overview would silently lose entries.
        if [ "${STRICT}" != "lazy" ] && [ "${STRICT}" != "null" ] && [ -n "${STRICT}" ]; then
            echo "RENDER-DETAILS: aborting: cannot seed the global overview without losing previous entries"
            exit -1
        fi
    fi
fi

cat ${CHECKOUTFILE} | while read line; do
    SLINE=${TARGETDIR}/src/${line}
    TLINE=${TARGETDIR}/report4/${line}
    RLINE=${TARGETDIR}/report4/${line}
    TRLINE=${TARGETDIR}/translation/${line}
    echo "RENDER-DETAILS: Processing line ${SLINE} => ${TLINE},${RLINE}"

    if [ -d "${RLINE}" ]; then
        for i in ${RLINE}/all-*.jsonld; do
            echo "RENDER-DETAILS: convert $i using ${DETAILS}"
            # Per-spec language override: the publication point config may
            # declare a "languages" list (e.g. ["en"]) to restrict which
            # languages are rendered for this spec, overriding the global
            # primeLanguage/otherLanguages from config.json.
            SPEC_LANGUAGES=$(jq -r '.languages // empty' ${i} 2>/dev/null)
            if [ -n "${SPEC_LANGUAGES}" ]; then
                SPEC_PRIMELANGUAGE=$(echo "${SPEC_LANGUAGES}" | jq -r '.[0]')
                SPEC_GOALLANGUAGE=$(echo "${SPEC_LANGUAGES}" | jq -r '.[1:] | join(" ")')
                echo "RENDER-DETAILS: spec-level languages override: prime=${SPEC_PRIMELANGUAGE} goals=${SPEC_GOALLANGUAGE}"
            else
                SPEC_PRIMELANGUAGE=${PRIMELANGUAGE}
                SPEC_GOALLANGUAGE=${GOALLANGUAGE}
            fi
            case ${DETAILS} in
                html)
                    TLINE=${TARGETDIR}/target/${line}
                    RLINE=${TARGETDIR}/report4/html/${line}
                    mkdir -p ${TLINE} ${RLINE}
                    render_nunjucks_html $SLINE $TLINE $i $RLINE ${line} ${TARGETDIR}/report4/${line} ${SPEC_PRIMELANGUAGE} true
                    for g in ${SPEC_GOALLANGUAGE}; do
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
                    render_respec_html $SLINE $TLINE $i $RLINE ${line} ${TARGETDIR}/report4/${line} ${SPEC_PRIMELANGUAGE} true
                    for g in ${SPEC_GOALLANGUAGE}; do
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
                    render_rdf $SLINE $TLINE $i $RLINE ${line} ${TARGETDIR}/report4/${line} ${SPEC_PRIMELANGUAGE} true
                    for g in ${SPEC_GOALLANGUAGE}; do
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
                    render_shacl_languageaware $SLINE $TLINE $i $RLINE ${line} ${SPEC_PRIMELANGUAGE} true
                    for g in ${SPEC_GOALLANGUAGE}; do
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
                    render_context $SLINE $TLINE $i $RLINE ${SPEC_PRIMELANGUAGE} true
                    for g in ${SPEC_GOALLANGUAGE}; do
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
                    render_swagger $SLINE $TLINE $i $RLINE ${line} ${SPEC_PRIMELANGUAGE} true
                    for g in ${SPEC_GOALLANGUAGE}; do
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
                    validate_jsonld $SLINE $TLINE $i $RLINE ${SPEC_PRIMELANGUAGE} true
                    for g in ${SPEC_GOALLANGUAGE}; do
                        generate_for_language ${g} ${i}
                        if [ ${GENERATEDARTEFACT} == true ]; then
                            validate_jsonld $SLINE $TLINE $i $RLINE ${SPEC_PRIMELANGUAGE} true
                        fi
                    done
                ;;
                xsd)
                    render_xsd $SLINE $TLINE $i $RLINE ${SPEC_PRIMELANGUAGE} true
                    for g in ${SPEC_GOALLANGUAGE}; do
                        generate_for_language ${g} ${i}
                        if [ ${GENERATEDARTEFACT} == true ]; then
                            render_xsd $SLINE $TLINE $i $RLINE ${g}
                        fi
                    done
                ;;
                metadata)
                    render_metadata ${SPEC_PRIMELANGUAGE} $i ${line} ${SLINE} ${TLINE}
                    for g in ${SPEC_GOALLANGUAGE}; do
                        render_metadata ${g} $i ${line} ${SLINE} ${TLINE}
                    done
                ;;
                translation)
                    render_translationfiles ${SPEC_PRIMELANGUAGE} ${SPEC_PRIMELANGUAGE} $i ${SLINE} ${TLINE}
                    for g in ${SPEC_GOALLANGUAGE}; do
                        render_translationfiles ${SPEC_PRIMELANGUAGE} ${g} $i ${SLINE} ${TLINE}
                    done
                ;;
                autotranslate)
                    for g in ${SPEC_GOALLANGUAGE}; do
                        USEAUTOTRANSLATION=$(jq -r '.translation | .[] | select(.language == "'"${g}"'") | .autotranslate' $i)
                        if [ "${USEAUTOTRANSLATION}" == "true" ] || [ "${USEAUTOTRANSLATION}" == true ]; then
                            autotranslatefiles ${SPEC_PRIMELANGUAGE} ${g} $i ${SLINE} ${TLINE} ${AUTOTRANSLATIONDIR}/${line}
                        fi
                    done
                ;;
                merge)
                    render_merged_files ${SPEC_PRIMELANGUAGE} ${SPEC_PRIMELANGUAGE} $i ${SLINE} ${TLINE} ${RLINE}
                    for g in ${SPEC_GOALLANGUAGE}; do
                        render_merged_files ${SPEC_PRIMELANGUAGE} ${g} $i ${SLINE} ${TLINE} ${RLINE}
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
                    EXECUTIONVIEW=${TARGETDIR}/report4/overviewreport.md
                    OLD_GLOBAL_OVERVIEW=${TARGETDIR}/README.md
                    GLOBAL_OVERVIEW=${TARGETDIR}/report4/README.md
                    render_report_line ${line} ${RLINE} $i ${EXECUTIONVIEW} ${OLD_GLOBAL_OVERVIEW} ${GLOBAL_OVERVIEW}
                    # Copy the merged result back so the next iteration extends it.
                    # Only promote a valid merged overview: a corrupt/empty one would
                    # otherwise become the "previous" for the next publication point
                    # and cascade the loss of all earlier entries.
                    if [ -s "${GLOBAL_OVERVIEW}" ] && grep -q "| Specification |" "${GLOBAL_OVERVIEW}"; then
                        cp ${GLOBAL_OVERVIEW} ${OLD_GLOBAL_OVERVIEW}
                    else
                        echo "RENDER-DETAILS: WARNING - merged overview is empty/invalid for ${line}; keeping previous seed for the next iteration"
                    fi
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
