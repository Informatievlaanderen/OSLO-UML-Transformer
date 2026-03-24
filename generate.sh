#!/bin/bash

set -e

REPO_URL="$1"
EAP_FILE="$2"
DIAGRAM_NAME="$3"

if [ -z "$REPO_URL" ] || [ -z "$EAP_FILE" ] || [ -z "$DIAGRAM_NAME" ]; then
    echo "Usage: $0 <repo_url> <eap_file> <diagram_name>"
    echo "  repo_url:     GitHub repository URL (e.g. https://github.com/org/repo)"
    echo "  eap_file:     Name of the .eap file (e.g. EPBD.eap)"
    echo "  diagram_name: Name of the diagram (e.g. OSLO-EPBD2-v2)"
    exit 1
fi

REPO_NAME=$(basename "$REPO_URL" .git)
UML_FILE="${REPO_URL}/raw/refs/heads/main/${EAP_FILE}"
STAKEHOLDERS_FILE="${REPO_URL}/raw/refs/heads/main/stakeholders.csv"

# Install required packages globally
echo "==> Installing required packages..."
npm install -g \
@oslo-flanders/ea-converter \
@oslo-flanders/stakeholders-converter \
@oslo-flanders/json-webuniversum-generator \
@oslo-flanders/metadata-generator \
@oslo-flanders/html-generator

# Step 1: Convert EA model to report.jsonld
echo "==> Running oslo-converter-ea..."
oslo-converter-ea \
--umlFile "$UML_FILE" \
--diagramName "$DIAGRAM_NAME" \
--versionId test/1 \
--publicationEnvironment https://data.vlaanderen.be \
--language nl \
--debug true

# Step 2: Convert stakeholders CSV to stakeholders.json
echo "==> Running oslo-stakeholders-converter..."
oslo-stakeholders-converter \
--input $STAKEHOLDERS_FILE \
--outputFormat application/json \
--output stakeholders.json

# Step 3: Generate webuniversum-config.json from report.jsonld
echo "==> Running oslo-webuniversum-json-generator..."
oslo-webuniversum-json-generator \
--input report.jsonld \
--language nl \
--publicationEnvironment https://data.test-vlaanderen.be \
--specificationType ApplicationProfile

# Step 4: Generate metadata.json from report.jsonld
echo "==> Running metadata-generator..."
metadata-generator \
--input report.jsonld \
--output metadata.json \
--hostname data.vlaanderen.be \
--documentpath /doc/applicatieprofiel/$DIAGRAM_NAME \
--mainlanguage nl \
--primarylanguage nl \
--uridomain data.vlaanderen.be

# Step 5: Generate HTML publication
echo "==> Running oslo-generator-html..."
oslo-generator-html \
--input webuniversum-config.json \
--stakeholders ./stakeholders.json \
--metadata ./metadata.json \
--specificationType ApplicationProfile \
--language nl

echo "==> Done."