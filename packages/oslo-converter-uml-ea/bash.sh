#!/bin/bash

# convert to json-ld app
node bin/runner.js --umlFile Verkeersmetingen-IM.eap --diagramName VSDS-Verkeersmetingen --outputFile output_app.jsonld --specificationType ApplicationProfile --outputFormat application/ld+json --publicationEnvironment 'https://implementatie.data.vlaanderen.be#' --versionId 'Verkeersmetingen' 

# convert to json-ld voc
node bin/runner.js --umlFile Verkeersmetingen-IM.eap --diagramName VSDS-Verkeersmetingen --outputFile output_voc.jsonld --specificationType Vocabulary --outputFormat application/ld+json --publicationEnvironment 'https://implementatie.data.vlaanderen.be#' --versionId 'Verkeersmetingen' 


#convert to RESPEC html impl
node ../oslo-generator-respec-html/bin/runner.js --input output_app.jsonld --output output_app.html --specificationType ApplicationProfile --language nl --specificationName 'Implementatieprofiel Verkeersmetingen'

#convert to RESPEC html voc
node ../oslo-generator-respec-html/bin/runner.js --input output_voc.jsonld --output output_voc.html --specificationType Vocabulary --language nl --specificationName 'Vocabularium Implementatieprofiel Verkeersmetingen'



