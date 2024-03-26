export enum Constraint {
  /**
   * Add an extra constraint that the value of a property can not be empty, otherwise generate an error
   */
  StringsNotEmpty,

  /**
   * Allow one value per language
   */
  UniqueLanguage,

  /**
   * Add constraint that the range of the property should be a sh:IRI of sh:Literal, depending on its type
   */
  NodeKind,

  /**
   * Add constraint rules for codelist
   */
  Codelist,
}