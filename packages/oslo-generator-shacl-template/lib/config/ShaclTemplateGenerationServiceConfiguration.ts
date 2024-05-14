import { IConfiguration, YargsParams } from "@oslo-flanders/core";
import type { GenerationMode } from "../enums/GenerationMode";
import type { Constraint } from "../enums/Constraint";
import { getConstraints, getGenerationMode } from "../utils/utils";
import { injectable } from "inversify";

@injectable()
export class ShaclTemplateGenerationServiceConfiguration implements IConfiguration {
	/**
	 * Path of the input file.
	 */
	private _input: string | undefined;

	/**
	 * Path of the output file.
	 */
	private _output: string | undefined;

	/**
	 * Format for the output file
	 */
	private _outputFormat: string | undefined;

	/**
	 * Language to generate the template in.
	 */
	private _language: string | undefined;

	/**
	 * The base URI to be used for the HTTP URIs of the SHACL shapes.
	 */
	private _shapeBaseURI: string | undefined;

	/**
	 * The generation mode, which can be 'grouped' or 'individual'.
	 * @see GenerationMode
	 */
	private _mode: GenerationMode | undefined;

	/**
	 * Additional constraints to add to the SHACL shape.
	 * @see Constraint
	 */
	private _constraint: Constraint[] | undefined;

	/**
	 * The URL on which the application profile is published. This is needed to create references to terms on the application profile
	 */
	private _applicationProfileURL: string | undefined;

	/**
	 * Create unique HTTP URIs for the individual SHACL shapes using the labels
	 */
	private _useUniqueURIs: boolean | undefined;

	/**
	 * Add additional messages in the configured language to the SHACL shapes
	 */
	private _addConstraintMessages: boolean | undefined;

	/**
	 * Add extra entry for rule numbers, allowing editors to add a rule number across multiple specs.
	 */
	private _addConstraintRuleNumbers: boolean | undefined;

	public async createFromCli(params: YargsParams): Promise<void> {
		this._input = <string>params.input;
		this._output = <string>params.output;
		this._outputFormat = <string>params.outputFormat;
		this._language = <string>params.language;
		this._shapeBaseURI = <string>params.shapeBaseURI;
		this._mode = getGenerationMode(<string>params.mode);
		this._constraint = getConstraints(<string[]>params.constraint);
		this._applicationProfileURL = <string>params.applicationProfileURL;
		this._useUniqueURIs = <boolean>params.uniqueURIs;
		this._addConstraintMessages = <boolean>params.addConstraintMessages;
		this._addConstraintRuleNumbers = <boolean>params.addRuleNumbers;
	}

	public get input(): string {
		if (!this._input) {
			throw new Error(`Trying to access "input" before it was set.`)
		}
		return this._input;
	}

	public get output(): string {
		// Explicitly check for undefined, because value empty string ('') also evaluates to false
		if (this._output === undefined) {
			throw new Error(`Trying to access "output" before it was set.`)
		}
		return this._output;
	}

	public get outputFormat(): string {
		if (!this._outputFormat) {
			throw new Error(`Trying to access "outputFormat" before it was set.`)
		}
		return this._outputFormat;
	}

	public get language(): string {
		if (!this._language) {
			throw new Error(`Trying to access "language" before it was set.`)
		}
		return this._language;
	}

	public get shapeBaseURI(): string {
		if (!this._shapeBaseURI) {
			throw new Error(`Trying to access "shapeBaseURI" before it was set.`)
		}
		return this._shapeBaseURI;
	}

	public get mode(): GenerationMode {
		if (this._mode === undefined) {
			throw new Error(`Trying to access "mode" before it was set.`)
		}
		return this._mode;
	}

	public get constraint(): Constraint[] {
		if (!this._constraint) {
			throw new Error(`Trying to access "constraints" before it was set.`)
		}
		return this._constraint;
	}

	public get applicationProfileURL(): string {
		// Explicitly check for undefined, because value empty string ('') also evaluates to false
		if (this._applicationProfileURL === undefined) {
			throw new Error(`Trying to access "applicationProfileURL" before it was set.`)
		}
		return this._applicationProfileURL;
	}

	public get useUniqueURIs(): boolean {
		// Explicitly check for undefined, because when boolean is false, it evaluates to false
		if (this._useUniqueURIs === undefined) {
			throw new Error(`Trying to access "useUniqueURIs" before it was set.`)
		}
		return this._useUniqueURIs;
	}

	public get addConstraintMessages(): boolean {
		// Explicitly check for undefined, because when boolean is false, it evaluates to false
		if (this._addConstraintMessages === undefined) {
			throw new Error(`Trying to access "addConstraintMessages" before it was set.`)
		}
		return this._addConstraintMessages;
	}

	public get addConstraintRuleNumbers() {
		// Explicitly check for undefined, because value empty string ('') also evaluates to false
		if (this._addConstraintRuleNumbers === undefined) {
			throw new Error(`Trying to access "addConstraintRuleNumbers" before it was set.`)
		}
		return this._addConstraintRuleNumbers;
	}
}