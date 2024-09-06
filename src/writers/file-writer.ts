import { type IWriter } from "../core/writer";
import { existsSync, promises } from "node:fs";

export class FileWriter implements IWriter {
  private content: any;
  private path: string;

  constructor(path: string, name: string) {
    this.path = `${path}/${name}.json`;
  }

  setContent(content: Record<string, any>) {
    this.content = JSON.stringify(content, null, 2);
  }

  async write() {
    return promises.writeFile(this.path, this.content);
  }
}
