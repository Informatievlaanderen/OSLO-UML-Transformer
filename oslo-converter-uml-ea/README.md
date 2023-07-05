# Tests

There are multiple integration test files available for the `oslo-converter-uml-ea` package. Each Enterprise Architect file has certain use cases that must be covered by the functionality of the `oslo-converter-uml-ea`. The result for each file is available file in the results directory.

## Test 01: AssociatiesMijnDomein

### Executed command
```bash
node bin/runner --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/01-AssociatiesMijnDomein.EAP --diagramName MijnDomein --specificationType ApplicationProfile --outputFile 01-AssociatiesMijnDomein.jsonld --versionId version/1 --publicationEnvironment https://data.vlaanderen.be
```

## Test 02: AssociatiesMijnAfdaalDomein

### Executed command
```bash
node bin/runner.js --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/02-AssociatiesMijnAfdaalDomein.EAP --diagramName MijnAfdaalDomeinAP --outputFile 02-AssociatiesMijnAfdaalDomein.jsonld --specificationType ApplicationProfile --versionId version/1 --publicationEnvironment https://data.vlaanderen.be
```

## Test 03: AssocatiesMijnDomeinMetAfdaalTags

### Executed command
```bash
node bin/runner.js --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/03-AssociatiesMijnDomeinMetAfdaalTags.EAP --diagramName MijnDomeinMetAfdaalTagsAP --outputFile 03-AssociatiesMijnDomeinMetAfdaalTags.jsonld --specificationType ApplicationProfile --versionId version/1 --publicationEnvironment https://data.vlaanderen.be
```

## Test 04: AssociatiesMijnDomeinMetApLabelTags

### Executed command
```bash
node bin/runner.js --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/04-AssociatiesMijnDomeinMetApLabelTags.EAP --diagramName MijnDomeinMetApLabelTags --outputFile 04-AssociatiesMijnDomeinMetApLabelTags.jsonld --specificationType ApplicationProfile --versionId version/1 --publicationEnvironment https://data.vlaanderen.be 
```

## Test 05: AssociatiesMijnDomeinMetCarets

### Executed command
```bash
node bin/runner.js --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/05-AssociatiesMijnDomeinMetCarets.EAP --diagramName MijnDomeinMetCarets --outputFile 05-AssociatiesMijnDomeinMetCarets.jsonld --specificationType ApplicationProfile --versionId version/1 --publicationEnvironment https://data.vlaanderen.be   
```

## Test 06: AssocatiesMijnDomeinMetHoofdletters

### Executed command
```bash
node bin/runner.js --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/06-AssociatiesMijnDomeinMetHoofdletters.EAP --diagramName MijnDomeinMetHoofdletters --outputFile 06-AssociatiesMijnDomeinMetHoofdletters.jsonld --specificationType ApplicationProfile --versionId version/1 --publicationEnvironment https://data.vlaanderen.be 
```

## Test 07: AssociatiesMijnDomeinMetNameTags

### Executed command
```bash
node bin/runner.js --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/07-AssociatiesMijnDomeinMetNameTags2.EAP --diagramName MijnDomeinMetNameTags2 --outputFile 07-AssociatiesMijnDomeinMetNameTags2.jsonld --specificationType ApplicationProfile --versionId version/1 --publicationEnvironment https://data.vlaanderen.be    
```

## Test 08: AssociatiesMijnDomeinMetPackages

### Executed command
```bash
node bin/runner.js --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/08-AssociatiesMijnDomeinMetPackages.EAP --diagramName MijnDomeinMetPackages3 --outputFile 07-AssociatiesMijnDomeinMetPackages.jsonld --specificationType ApplicationProfile --versionId version/1 --publicationEnvironment https://data.vlaanderen.be 
```

## Test 09: AssociatiesMijnDomeinMetUriTags

### Executed command
```bash
node bin/runner.js --umlFile https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/integration-test-files/oslo-converter-uml-ea/09-AssociatiesMijnDomeinMetUriTags.EAP --diagramName MijnDomeinMetUriTags2 --outputFile 07-AssociatiesMijnDomeinMetUriTags.jsonld --specificationType ApplicationProfile --versionId version/1 --publicationEnvironment https://data.vlaanderen.be    
```