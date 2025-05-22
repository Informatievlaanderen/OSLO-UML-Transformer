"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorAbstractMediaTyped = void 0;
const core_1 = require("@comunica/core");
/**
 * An abstract actor that handles media-typed actions.
 *
 * It splits up a action between a 'handle' and a 'mediaTypes' action.
 * A 'mediaTypes' action is used to retrieve the available media types from this actor.
 * A 'handle' action is abstract, and can be implemented to do anything,
 * such as parsing, serializing, etc.
 * @see IActionAbstractMediaTyped
 *
 * @see ActorAbstractMediaTypedFixed
 */
class ActorAbstractMediaTyped extends core_1.Actor {
    constructor(args) {
        super(args);
    }
    async run(action) {
        if ('handle' in action) {
            const typedAction = action;
            return { handle: await this.runHandle(typedAction.handle, typedAction.handleMediaType, action.context) };
        }
        if ('mediaTypes' in action) {
            return { mediaTypes: await this.getMediaTypes(action.context) };
        }
        if ('mediaTypeFormats' in action) {
            return { mediaTypeFormats: await this.getMediaTypeFormats(action.context) };
        }
        throw new Error('Either a handle, mediaTypes or mediaTypeFormats action needs to be provided');
    }
    async test(action) {
        if ('handle' in action) {
            const typedAction = action;
            return { handle: await this.testHandle(typedAction.handle, typedAction.handleMediaType, action.context) };
        }
        if ('mediaTypes' in action) {
            return { mediaTypes: await this.testMediaType(action.context) };
        }
        if ('mediaTypeFormats' in action) {
            return { mediaTypeFormats: await this.testMediaTypeFormats(action.context) };
        }
        throw new Error('Either a handle, mediaTypes or mediaTypeFormats action needs to be provided');
    }
}
exports.ActorAbstractMediaTyped = ActorAbstractMediaTyped;
//# sourceMappingURL=ActorAbstractMediaTyped.js.map