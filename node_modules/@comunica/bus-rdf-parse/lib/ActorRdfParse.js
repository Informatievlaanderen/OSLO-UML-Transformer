"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorRdfParse = void 0;
const actor_abstract_mediatyped_1 = require("@comunica/actor-abstract-mediatyped");
/**
 * A base actor for listening to RDF parse events.
 *
 * Actor types:
 * * Input:  IActionRdfParseOrMediaType:      A parse input or a media type input.
 * * Test:   <none>
 * * Output: IActorOutputRdfParseOrMediaType: The parsed quads.
 *
 * @see IActionInit
 */
class ActorRdfParse extends actor_abstract_mediatyped_1.ActorAbstractMediaTyped {
    /**
     * @param args - @defaultNested {<default_bus> a <cc:components/Bus.jsonld#Bus>} bus
     */
    constructor(args) {
        super(args);
    }
}
exports.ActorRdfParse = ActorRdfParse;
//# sourceMappingURL=ActorRdfParse.js.map