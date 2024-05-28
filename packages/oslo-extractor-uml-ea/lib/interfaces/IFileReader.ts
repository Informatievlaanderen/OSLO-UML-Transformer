import type { DataRegistry } from "../DataRegistry";

export interface IFileReader<T> {
  initDataRegistry: (path: string, registry: DataRegistry) => Promise<DataRegistry>;
  loadPackages: (database: T, registry: DataRegistry) => Promise<void>;
  loadElements: (database: T, registry: DataRegistry) => Promise<void>;
  loadAttributes: (database: T, registry: DataRegistry) => Promise<void>;
  loadElementConnectors: (database: T, registry: DataRegistry) => Promise<void>;
  loadDiagrams: (database: T, registry: DataRegistry) => Promise<void>;
}