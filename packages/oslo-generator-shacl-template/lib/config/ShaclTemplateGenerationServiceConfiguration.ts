import { IConfiguration, YargsParams } from "@oslo-flanders/core";
import type { GenerationMode } from "@oslo-generator-shacl-template/enums/GenerationMode";
import type { Constraint } from "@oslo-generator-shacl-template/enums/Constraint";
import { getConstraints, getGenerationMode } from "@oslo-generator-shacl-template/utils/utils";

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
	private _constraints: Constraint[] | undefined;

	/**
	 * The URL on which the application profile is published. This is needed to create references to terms on the application profile
	 */
	private _applicationProfileURL: string | undefined;

	/**
	 * Create unique HTTP URIs for the individual SHACL shapes using the labels
	 */
	private _useUniqueURIs: boolean | undefined;

	/**
	 * Add rules for codelists, if they are present
	 */
	private _addCodelistRules: boolean | undefined;

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
		this._language = <string>params.language;
		this._shapeBaseURI = <string>params.shapeBaseURI;
		this._mode = getGenerationMode(<string>params.mode);
		this._constraints = getConstraints(<string[]>params.constraints);
		this._applicationProfileURL = <string>params.applicationProfileURL;
		this._useUniqueURIs = <boolean>params.uniqueURIs;
		this._addCodelistRules = <boolean>params.addCodelistRules;
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
		if (!this._output) {
			throw new Error(`Trying to access "output" before it was set.`)
		}
		return this._output;
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
		if (!this._mode) {
			throw new Error(`Trying to access "mode" before it was set.`)
		}
		return this._mode;
	}

	public get constraints(): Constraint[] {
		if (!this._constraints) {
			throw new Error(`Trying to access "constraints" before it was set.`)
		}
		return this._constraints;
	}

	public get applicationProfileURL(): string {
		if (!this._applicationProfileURL) {
			throw new Error(`Trying to access "applicationProfileURL" before it was set.`)
		}
		return this._applicationProfileURL;
	}

	public get useUniqueURIs(): boolean {
		if (!this._useUniqueURIs) {
			throw new Error(`Trying to access "useUniqueURIs" before it was set.`)
		}
		return this._useUniqueURIs;
	}

	public get addCodelistRules(): boolean {
		if (!this._addCodelistRules) {
			throw new Error(`Trying to access "addCodelistRules" before it was set.`)
		}
		return this._addCodelistRules;
	}

	public get addConstraintMessages(): boolean {
		if (!this._addConstraintMessages) {
			throw new Error(`Trying to access "addConstraintMessages" before it was set.`)
		}
		return this._addConstraintMessages;
	}

	public get addConstraintRuleNumbers() {
		if (!this._addConstraintRuleNumbers) {
			throw new Error(`Trying to access "addConstraintRuleNumbers" before it was set.`)
		}
		return this._addConstraintRuleNumbers;
	}
}