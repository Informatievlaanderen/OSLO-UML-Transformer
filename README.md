# Integration test files

The purpose of this branch is that files used for integration testing can be stored here if needed. Since these files together can form a fairly large volume, it is avoided that these files are packaged and published

## Package oslo-converter-uml-ea

This package converts the UML diagram in an Enterprise Architect (.EAP) file to an RDF file by first extracting all the necessary data from the UML model, applying the OSLO modeling rules and then write the result as RDF (or a serialisation) to a file. 