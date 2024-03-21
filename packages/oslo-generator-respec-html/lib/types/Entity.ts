export interface Entity {
  id?: string;
  label?: string;
  definition?: string;
  usageNote?: string;
  parents?: string[];
  codelist?: string;
  minCount?: string;
  maxCount?: string;
  classes?: Entity[];
  datatypes?: Entity[];
  properties?: Entity[];
  domain?: string;
  assignedUri?: string;
};