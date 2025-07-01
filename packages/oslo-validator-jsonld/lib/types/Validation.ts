export interface InvalidEntry {
  uri: string;
  location: string;
};

export interface ValidationResult {
  isValid: boolean;
  invalidEntries: InvalidEntry[];
}
