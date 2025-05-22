import * as RDF from "@rdfjs/types";
import { ParsingContext } from "../ParsingContext";
import { Util } from "../Util";
import { IEntryHandler } from "./IEntryHandler";
/**
 * Interprets keys as predicates.
 * The most common case in JSON-LD processing.
 */
export declare class EntryHandlerPredicate implements IEntryHandler<boolean> {
    /**
     * Handle the given predicate-object by either emitting it,
     * or by placing it in the appropriate stack for later emission when no @graph and/or @id has been defined.
     * @param {ParsingContext} parsingContext A parsing context.
     * @param {Util} util A utility instance.
     * @param {any[]} keys A stack of keys.
     * @param {number} depth The current depth.
     * @param {Term} predicate The predicate.
     * @param {Term} object The object.
     * @param {boolean} reverse If the property is reversed.
     * @param {boolean} isEmbedded If the property exists in an embedded node as direct child.
     * @param {boolean} isAnnotation If the property exists in an annotation object.
     * @return {Promise<void>} A promise resolving when handling is done.
     */
    static handlePredicateObject(parsingContext: ParsingContext, util: Util, keys: any[], depth: number, predicate: RDF.Term, object: RDF.Term, reverse: boolean, isEmbedded: boolean, isAnnotation: boolean): Promise<void>;
    isPropertyHandler(): boolean;
    isStackProcessor(): boolean;
    validate(parsingContext: ParsingContext, util: Util, keys: any[], depth: number, inProperty: boolean): Promise<boolean>;
    test(parsingContext: ParsingContext, util: Util, key: any, keys: any[], depth: number): Promise<boolean>;
    handle(parsingContext: ParsingContext, util: Util, key: any, keys: any[], value: any, depth: number, testResult: boolean): Promise<any>;
}
