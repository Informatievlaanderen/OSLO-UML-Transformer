"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorRdfSerialize = void 0;
const actor_abstract_mediatyped_1 = require("@comunica/actor-abstract-mediatyped");
/**
 * A comunica actor for RDF parse events.
 *
 * Actor types:
 * * Input:  IActionRdfSerialize:      A serialize input or a media type input.
 * * Test:   <none>
 * * Output: IActorRdfSerializeOutput: The serialized quads.
 *
 * @see IActionRdfSerialize
 * @see IActorRdfSerializeOutput
 */
class ActorRdfSerialize extends actor_abstract_mediatyped_1.ActorAbstractMediaTyped {
    /**
     * @param args - @defaultNested {<default_bus> a <cc:components/Bus.jsonld#Bus>} bus
     */
    constructor(args) {
        super(args);
    }
}
exports.ActorRdfSerialize = ActorRdfSerialize;
//# sourceMappingURL=ActorRdfSerialize.js.map