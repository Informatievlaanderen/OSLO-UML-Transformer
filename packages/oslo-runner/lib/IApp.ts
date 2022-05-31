export interface IApp {
  init: () => Promise<void>;
  start: () => Promise<void>;
}
