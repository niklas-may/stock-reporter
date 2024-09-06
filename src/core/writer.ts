export interface IWriter {
  setContent(any: any): void;
  write(): Promise<void>;
}
