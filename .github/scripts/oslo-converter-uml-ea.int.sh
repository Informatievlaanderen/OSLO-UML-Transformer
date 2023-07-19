#!/bin/bash
#
# Run integration tests for the package 'oslo-converter-uml-ea'

resultsDir=$(readlink -f "$(dirname $0)/../oslo-converter-uml-ea-test-results")
mkdir -p $resultsDir

run_test() {
    local test_name="$1"
    local golden_master="$2"
    local test_file_result="$3"
    
    source $(dirname $0)/json_diff.sh 
    result=$(json_diff $golden_master $test_file_result | sed 's/@@.*@@//')

    if [ -z "$result" ]; then
        echo "Test $test_name: PASSED"
    else
        echo "Test $test_name: FAILED"
        echo "$result"
    fi

    echo "------------------------------------------------------"
}

## Test 1: AssociatiesMijnDomein
curl -sLX GET https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/results/01-AssociatiesMijnDomein.jsonld \
 -o $resultsDir/01-AssociatiesMijnDomeinGoldenMaster.jsonld

node $(dirname $0)/../../packages/oslo-converter-uml-ea/bin/runner.js \
 --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/01-AssociatiesMijnDomein.EAP \
 --diagramName MijnDomein \
 --specificationType ApplicationProfile \
 --outputFile "$resultsDir/01-AssociatiesMijnDomein.jsonld" \
 --versionId version/1 \
 --publicationEnvironment https://data.vlaanderen.be \
 --silent

run_test "01-AssociatiesMijnDomein" \
 "$resultsDir/01-AssociatiesMijnDomeinGoldenMaster.jsonld" \
 "$resultsDir/01-AssociatiesMijnDomein.jsonld"

## Test 2: AssociatiesMijnAfdaalDomein
curl -sLX GET https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/results/02-AssociatiesMijnAfdaalDomein.jsonld \
 -o $resultsDir/02-AssociatiesMijnAfdaalDomeinGoldenMaster.jsonld

node $(dirname $0)/../../packages/oslo-converter-uml-ea/bin/runner.js \
 --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/02-AssociatiesMijnAfdaalDomein.EAP \
 --diagramName MijnAfdaalDomeinAP \
 --specificationType ApplicationProfile \
 --outputFile "$resultsDir/02-AssociatiesMijnAfdaalDomein.jsonld" \
 --versionId version/1 \
 --publicationEnvironment https://data.vlaanderen.be \
 --silent

run_test "02-AssociatiesMijnAfdaalDomein" \
 "$resultsDir/02-AssociatiesMijnAfdaalDomeinGoldenMaster.jsonld" \
 "$resultsDir/02-AssociatiesMijnAfdaalDomein.jsonld"

## Test 3: AssociatiesMijnDomeinMetAfdaalTags
curl -sLX GET https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/results/03-AssociatiesMijnDomeinMetAfdaalTags.jsonld \
 -o $resultsDir/03-AssociatiesMijnDomeinMetAfdaalTagsGoldenMaster.jsonld

node $(dirname $0)/../../packages/oslo-converter-uml-ea/bin/runner.js \
 --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/03-AssociatiesMijnDomeinMetAfdaalTags.EAP \
 --diagramName MijnDomeinMetAfdaalTagsAP \
 --outputFile "$resultsDir/03-AssociatiesMijnDomeinMetAfdaalTags.jsonld" \
 --specificationType ApplicationProfile \
 --versionId version/1 \
 --publicationEnvironment https://data.vlaanderen.be \
 --silent

run_test "03-AssociatiesMijnDomeinMetAfdaalTags" \
 "$resultsDir/03-AssociatiesMijnDomeinMetAfdaalTagsGoldenMaster.jsonld" \
 "$resultsDir/03-AssociatiesMijnDomeinMetAfdaalTags.jsonld"

## Test 4: AssociatiesMijnDomeinMetApLabelTags
curl -sLX GET https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/results/04-AssociatiesMijnDomeinMetApLabelTags.jsonld \
 -o $resultsDir/04-AssociatiesMijnDomeinMetApLabelTagsGoldenMaster.jsonld

node $(dirname $0)/../../packages/oslo-converter-uml-ea/bin/runner.js \
 --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/04-AssociatiesMijnDomeinMetApLabelTags.EAP \
 --diagramName MijnDomeinMetApLabelTags \
 --outputFile "$resultsDir/04-AssociatiesMijnDomeinMetApLabelTags.jsonld" \
 --specificationType ApplicationProfile \
 --versionId version/1 \
 --publicationEnvironment https://data.vlaanderen.be \
 --silent

run_test "04-AssociatiesMijnDomeinMetApLabelTags" \
 "$resultsDir/04-AssociatiesMijnDomeinMetApLabelTagsGoldenMaster.jsonld" \
 "$resultsDir/04-AssociatiesMijnDomeinMetApLabelTags.jsonld"

## Test 5: AssociatiesMijnDomeinMetCarets
curl -sLX GET https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/results/05-AssociatiesMijnDomeinMetCarets.jsonld \
 -o $resultsDir/05-AssociatiesMijnDomeinMetCaretsGoldenMaster.jsonld

node $(dirname $0)/../../packages/oslo-converter-uml-ea/bin/runner.js \
 --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/05-AssociatiesMijnDomeinMetCarets.EAP \
 --diagramName MijnDomeinMetCarets \
 --outputFile "$resultsDir/05-AssociatiesMijnDomeinMetCarets.jsonld" \
 --specificationType ApplicationProfile \
 --versionId version/1 \
 --publicationEnvironment https://data.vlaanderen.be \
 --silent

run_test "05-AssociatiesMijnDomeinMetCarets" \
 "$resultsDir/05-AssociatiesMijnDomeinMetCaretsGoldenMaster.jsonld" \
 "$resultsDir/05-AssociatiesMijnDomeinMetCarets.jsonld"

## Test 6: AssociatiesMijnDomeinMetHoofdletters
curl -sLX GET https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/results/06-AssociatiesMijnDomeinMetHoofdletters.jsonld \
 -o $resultsDir/06-AssociatiesMijnDomeinMetHoofdlettersGoldenMaster.jsonld

node $(dirname $0)/../../packages/oslo-converter-uml-ea/bin/runner.js \
 --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/06-AssociatiesMijnDomeinMetHoofdletters.EAP \
 --diagramName MijnDomeinMetHoofdletters \
 --outputFile "$resultsDir/06-AssociatiesMijnDomeinMetHoofdletters.jsonld" \
 --specificationType ApplicationProfile \
 --versionId version/1 \
 --publicationEnvironment https://data.vlaanderen.be \
 --silent

run_test "06-AssociatiesMijnDomeinMetHoofdletters" \
 "$resultsDir/06-AssociatiesMijnDomeinMetHoofdlettersGoldenMaster.jsonld" \
 "$resultsDir/06-AssociatiesMijnDomeinMetHoofdletters.jsonld"

## Test 7: AssociatiesMijnDomeinMetNameTags2
curl -sLX GET https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/results/07-AssociatiesMijnDomeinMetNameTags2.jsonld \
 -o $resultsDir/07-AssociatiesMijnDomeinMetNameTags2GoldenMaster.jsonld

node $(dirname $0)/../../packages/oslo-converter-uml-ea/bin/runner.js \
 --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/07-AssociatiesMijnDomeinMetNameTags2.EAP \
 --diagramName MijnDomeinMetNameTags2 \
 --outputFile "$resultsDir/07-AssociatiesMijnDomeinMetNameTags2.jsonld" \
 --specificationType ApplicationProfile \
 --versionId version/1 \
 --publicationEnvironment https://data.vlaanderen.be \
 --silent

run_test "07-AssociatiesMijnDomeinMetNameTags2" \
 "$resultsDir/07-AssociatiesMijnDomeinMetNameTags2GoldenMaster.jsonld" \
 "$resultsDir/07-AssociatiesMijnDomeinMetNameTags2.jsonld"

## Test 8: AssociatiesMijnDomeinMetPackages
curl -sLX GET https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/results/08-AssociatiesMijnDomeinMetPackages.jsonld \
 -o $resultsDir/08-AssociatiesMijnDomeinMetPackagesGoldenMaster.jsonld

node $(dirname $0)/../../packages/oslo-converter-uml-ea/bin/runner.js \
 --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/08-AssociatiesMijnDomeinMetPackages.EAP \
 --diagramName MijnDomeinMetPackages3 \
 --outputFile "$resultsDir/08-AssociatiesMijnDomeinMetPackages.jsonld" \
 --specificationType ApplicationProfile \
 --versionId version/1 \
 --publicationEnvironment https://data.vlaanderen.be \
 --silent

run_test "08-AssociatiesMijnDomeinMetPackages" \
 "$resultsDir/08-AssociatiesMijnDomeinMetPackagesGoldenMaster.jsonld" \
 "$resultsDir/08-AssociatiesMijnDomeinMetPackages.jsonld"

## Test 9: AssociatiesMijnDomeinMetUriTags
curl -sLX GET https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/results/09-AssociatiesMijnDomeinMetUriTags.jsonld \
 -o $resultsDir/09-AssociatiesMijnDomeinMetUriTagsGoldenMaster.jsonld

node $(dirname $0)/../../packages/oslo-converter-uml-ea/bin/runner.js \
 --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/09-AssociatiesMijnDomeinMetUriTags.EAP \
 --diagramName MijnDomeinMetUriTags2 \
 --outputFile "$resultsDir/09-AssociatiesMijnDomeinMetUriTags.jsonld" \
 --specificationType ApplicationProfile \
 --versionId version/1 \
 --publicationEnvironment https://data.vlaanderen.be \
 --silent

run_test "09-AssociatiesMijnDomeinMetUriTags" \
 "$resultsDir/09-AssociatiesMijnDomeinMetUriTagsGoldenMaster.jsonld" \
 "$resultsDir/09-AssociatiesMijnDomeinMetUriTags.jsonld"

# Clean up all the files
rm -r "$resultsDir"