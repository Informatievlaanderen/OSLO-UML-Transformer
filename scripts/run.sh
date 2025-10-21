#!/bin/sh

UML_FILE=$1
DIAGRAM_NAME=$2

# Input validation
if [ -z "$UML_FILE" ]; then
    echo "UML file is missing!"
    exit 1
fi

if [ -z "$DIAGRAM_NAME" ]; then
    echo "Diagram name is missing!"
    exit 2
fi

# Enterprise Architect conversion
echo "Converting EAP to internal JSON-LD format"
../packages/oslo-converter-uml-ea/bin/runner.js \
    --umlFile "$UML_FILE" \
    --diagramName "$DIAGRAM_NAME" \
    --versionId "https://test.data.vlaanderen.be/TEST/1" \
    --publicationEnvironment "https://test.data.vlaanderen.be/" \
    --outputFormat "application/ld+json"

# SHACL generation
echo "Generating SHACL from internal JSON-LD format"
../packages/oslo-generator-shacl-template/bin/runner.js \
    --input report.jsonld \
    --language nl \
    --outputFormat "text/turtle"
