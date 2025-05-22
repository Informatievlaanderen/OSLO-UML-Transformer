"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandlerKeywordAnnotation = void 0;
const EntryHandlerKeyword_1 = require("./EntryHandlerKeyword");
const jsonld_context_parser_1 = require("jsonld-context-parser");
/**
 * Handles @annotation entries.
 */
class EntryHandlerKeywordAnnotation extends EntryHandlerKeyword_1.EntryHandlerKeyword {
    constructor() {
        super('@annotation');
    }
    async handle(parsingContext, util, key, keys, value, depth) {
        // Validate value
        if (typeof value === 'string' || (typeof value === 'object' && value['@value'])) {
            parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Found illegal annotation value: ${JSON.stringify(value)}`, jsonld_context_parser_1.ERROR_CODES.INVALID_ANNOTATION));
        }
        // Rest of the processing is done as regular nodes
    }
}
exports.EntryHandlerKeywordAnnotation = EntryHandlerKeywordAnnotation;
//# sourceMappingURL=EntryHandlerKeywordAnnotation.js.map