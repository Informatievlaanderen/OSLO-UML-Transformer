"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
/**
 * A logger accepts messages from different levels
 * and emits them in a certain way.
 */
class Logger {
    /**
     * Convert a string-based logging level to a numerical logging level.
     * @param level A string-based logging level
     * @return The numerical logging level, or undefined.
     */
    static getLevelOrdinal(level) {
        return Logger.LEVELS[level];
    }
}
exports.Logger = Logger;
/**
 * All available logging levels.
 * @type {{trace: number; debug: number; info: number; warn: number; error: number; fatal: number}}
 */
Logger.LEVELS = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5,
};
//# sourceMappingURL=Logger.js.map