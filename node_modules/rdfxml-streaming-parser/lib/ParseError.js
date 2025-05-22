"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseError = void 0;
/**
 * An error that includes line and column in the error message.
 */
class ParseError extends Error {
    constructor(parser, message) {
        const saxParser = parser.saxParser;
        super(parser.trackPosition ? `Line ${saxParser.line} column ${saxParser.column + 1}: ${message}` : message);
    }
}
exports.ParseError = ParseError;
//# sourceMappingURL=ParseError.js.map