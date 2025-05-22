"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlScriptListener = void 0;
const context_entries_1 = require("@comunica/context-entries");
const readable_stream_1 = require("readable-stream");
const relative_to_absolute_iri_1 = require("relative-to-absolute-iri");
/**
 * An HTML parse listeners that detects <script> data blocks with known RDF media types,
 * parses them, and outputs the resulting quads.
 */
class HtmlScriptListener {
    constructor(mediatorRdfParseHandle, cbQuad, cbError, cbEnd, supportedTypes, context, baseIRI, headers) {
        this.textChunksJsonLd = [];
        this.endBarrier = 1;
        this.passedScripts = 0;
        this.isFinalJsonLdProcessing = false;
        this.mediatorRdfParseHandle = mediatorRdfParseHandle;
        this.cbQuad = cbQuad;
        this.cbError = cbError;
        this.cbEnd = cbEnd;
        this.supportedTypes = supportedTypes;
        this.context = context
            .set(context_entries_1.KeysRdfParseHtmlScript.processingHtmlScript, true);
        this.baseIRI = baseIRI;
        this.headers = headers;
        this.onlyFirstScript = context.get(context_entries_1.KeysRdfParseHtmlScript.extractAllScripts) === false;
        const fragmentPos = this.baseIRI.indexOf('#');
        this.targetScriptId = fragmentPos > 0 ? this.baseIRI.slice(fragmentPos + 1, this.baseIRI.length) : null;
    }
    static newErrorCoded(message, code) {
        // Error codes are required by the JSON-LD spec
        const error = new Error(message);
        error.code = code;
        return error;
    }
    onEnd() {
        if (--this.endBarrier === 0) {
            if (this.textChunksJsonLd.length > 0) {
                // First process buffered JSON-LD chunks if we have any.
                this.handleMediaType = 'application/ld+json';
                this.textChunks = this.textChunksJsonLd;
                this.textChunks.push(']');
                this.textChunksJsonLd = [];
                this.isFinalJsonLdProcessing = true;
                this.endBarrier++;
                // This will call onEnd again
                this.onTagClose();
            }
            else {
                // Otherwise, end processing
                if (this.passedScripts === 0 && this.targetScriptId) {
                    this.cbError(HtmlScriptListener.newErrorCoded(`Failed to find targeted script id "${this.targetScriptId}"`, 'loading document failed'));
                }
                this.cbEnd();
            }
            this.isFinalJsonLdProcessing = false;
        }
    }
    onTagClose() {
        if (this.handleMediaType) {
            if (this.requiresCustomJsonLdHandling(this.handleMediaType) && !this.isFinalJsonLdProcessing) {
                // Reset the media type and text stream
                this.handleMediaType = undefined;
                this.textChunks = undefined;
                this.onEnd();
            }
            else {
                // Create a temporary text stream for pushing all the text chunks
                const textStream = new readable_stream_1.Readable({ objectMode: true });
                textStream._read = () => {
                    // Do nothing
                };
                const textChunksLocal = this.textChunks;
                // Send all collected text to parser
                const parseAction = {
                    context: this.context,
                    handle: {
                        metadata: { baseIRI: this.baseIRI },
                        data: textStream,
                        headers: this.headers,
                        context: this.context,
                    },
                    handleMediaType: this.handleMediaType,
                };
                this.mediatorRdfParseHandle.mediate(parseAction)
                    .then(({ handle }) => {
                    // Initialize text parsing
                    handle.data
                        .on('error', error => this.cbError(HtmlScriptListener
                        .newErrorCoded(error.message, 'invalid script element')))
                        .on('data', this.cbQuad)
                        .on('end', () => this.onEnd());
                    // Push the text stream after all events have been attached
                    for (const textChunk of textChunksLocal) {
                        textStream.push(textChunk);
                    }
                    textStream.push(null);
                })
                    .catch((error) => {
                    if (this.targetScriptId) {
                        // Error if we are targeting this script tag specifically
                        this.cbError(HtmlScriptListener.newErrorCoded(error.message, 'loading document failed'));
                    }
                    else {
                        // Ignore script tags that we don't understand
                        this.onEnd();
                    }
                });
                // Reset the media type and text stream
                this.handleMediaType = undefined;
                this.textChunks = undefined;
            }
        }
    }
    onTagOpen(name, attributes) {
        // Take into account baseIRI overrides
        if (name === 'base' && attributes.href) {
            this.baseIRI = (0, relative_to_absolute_iri_1.resolve)(attributes.href, this.baseIRI);
        }
        // Only handle script tags with a parseable content type
        // If targetScriptId is defined, only extract from script with that id
        if (name === 'script' && (!this.targetScriptId || attributes.id === this.targetScriptId)) {
            if (this.supportedTypes[attributes.type]) {
                if (this.onlyFirstScript && this.passedScripts > 0) {
                    // Ignore script tag if only one should be extracted
                    this.handleMediaType = undefined;
                }
                else {
                    this.passedScripts++;
                    this.handleMediaType = attributes.type;
                    this.endBarrier++;
                    if (this.requiresCustomJsonLdHandling(this.handleMediaType)) {
                        this.textChunks = this.textChunksJsonLd;
                        this.textChunks.push(this.textChunks.length === 0 ? '[' : ',');
                    }
                    else {
                        this.textChunks = [];
                    }
                }
            }
            else if (this.targetScriptId) {
                this.cbError(HtmlScriptListener.newErrorCoded(`Targeted script "${this.targetScriptId}" does not have a supported type`, 'loading document failed'));
            }
        }
        else {
            this.handleMediaType = undefined;
        }
    }
    onText(data) {
        if (this.handleMediaType) {
            this.textChunks.push(data);
        }
    }
    /**
     * If we require custom JSON-LD handling for the given media type.
     *
     * The JSON-LD spec requires JSON-LD within script tags to be seen as a single document.
     * As such, we have to buffer all JSON-LD until the end of HTML processing,
     * and encapsulate all found contents in an array.
     *
     * @param mediaType A: IActionRdfParseHtml media type.
     */
    requiresCustomJsonLdHandling(mediaType) {
        return !this.onlyFirstScript && !this.targetScriptId && mediaType === 'application/ld+json';
    }
}
exports.HtmlScriptListener = HtmlScriptListener;
//# sourceMappingURL=HtmlScriptListener.js.map