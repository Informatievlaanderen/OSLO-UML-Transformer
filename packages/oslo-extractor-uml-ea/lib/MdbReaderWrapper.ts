import * as MDBReaderOriginal from 'mdb-reader';

// This is a very dirty fix to a problem with one of the external libraries we use being mdb-reader.
// As of version 2.x the library is written in ESM and does not
// support CommonJS: https://github.com/andipaetzold/mdb-reader/releases/tag/v2.0.0-next.7
// This means that we cannot use it in our project as it is and we either need to fork it
// and fix it ourselves or use a dirty workaround
// The workaround is to use the default import of the library and then access the default property 
// of the default import, which will throw some errors in the editor, but will work as expected.


const MDBReader = MDBReaderOriginal.default.default;

export default MDBReader;