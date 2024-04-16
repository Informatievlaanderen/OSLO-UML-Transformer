export enum GenerationMode {
    /**
     * Generate one SHACL shape per class which includes all properties of the class
     */
    Grouped,

    /**
     * Generate one SHACL shape per entity (class and properties). 
     * For each constraint on the class or property, there is a separate SHACL shape
     */
    Individual
}