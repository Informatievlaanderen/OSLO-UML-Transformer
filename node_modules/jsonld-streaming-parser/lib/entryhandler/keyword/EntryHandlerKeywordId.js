"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandlerKeywordId = void 0;
const jsonld_context_parser_1 = require("jsonld-context-parser");
const EntryHandlerKeyword_1 = require("./EntryHandlerKeyword");
/**
 * Handles @id entries.
 */
class EntryHandlerKeywordId extends EntryHandlerKeyword_1.EntryHandlerKeyword {
    constructor() {
        super('@id');
    }
    isStackProcessor() {
        return false;
    }
    async handle(parsingContext, util, key, keys, value, depth) {
        if (typeof value !== 'string') {
            // JSON-LD-star allows @id object values
            if (parsingContext.rdfstar && typeof value === 'object') {
                const valueKeys = Object.keys(value);
                if (valueKeys.length === 1 && valueKeys[0] === '@id') {
                    parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Invalid embedded node without property with @id ${value['@id']}`, jsonld_context_parser_1.ERROR_CODES.INVALID_EMBEDDED_NODE));
                }
            }
            else {
                parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Found illegal @id '${value}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_ID_VALUE));
            }
            return;
        }
        // Determine the canonical place for this id.
        // For example, @nest parents should be ignored.
        const depthProperties = await util.getPropertiesDepth(keys, depth);
        // Error if an @id for this node already existed.
        if (parsingContext.idStack[depthProperties] !== undefined) {
            if (parsingContext.idStack[depthProperties][0].listHead) {
                // Error if an @list was already defined for this node
                parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Found illegal neighbouring entries next to @list for key: '${keys[depth - 1]}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_SET_OR_LIST_OBJECT));
            }
            else {
                // Otherwise, the previous id was just because of an @id entry.
                parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Found duplicate @ids '${parsingContext
                    .idStack[depthProperties][0].value}' and '${value}'`, jsonld_context_parser_1.ERROR_CODES.COLLIDING_KEYWORDS));
            }
        }
        // Error if an annotation was defined
        if (parsingContext.rdfstar && parsingContext.annotationsBuffer[depth]) {
            for (const annotation of parsingContext.annotationsBuffer[depth]) {
                if (annotation.depth === depth) {
                    parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Found an illegal @id inside an annotation: ${value}`, jsonld_context_parser_1.ERROR_CODES.INVALID_ANNOTATION));
                }
            }
        }
        // Save our @id on the stack
        parsingContext.idStack[depthProperties] = util.nullableTermToArray(await util.resourceToTerm(await parsingContext.getContext(keys), value));
    }
}
exports.EntryHandlerKeywordId = EntryHandlerKeywordId;
//# sourceMappingURL=EntryHandlerKeywordId.js.map