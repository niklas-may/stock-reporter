import { retry } from "../core/retry";
import { type CreateWriter } from "../core/writer";
import { promises } from "node:fs";
import { FullStockReport } from "../core/report";
import { type Config } from "../core/config";

export const createFileWriter: CreateWriter = (report: FullStockReport, config: Config) => {
  const {
    output: { out },
    stock: { symbol },
  } = config;
  
  if (!out) return undefined;

  const path = `${out}/${symbol}.json`;
  const writer = () => writeToFile(path, report);
  const errorHandler = createErrorHandler(path);

  return () => retry(writer, errorHandler);
};

async function writeToFile(path: string, report: Record<string, any>) {
  const content = JSON.stringify(report, null, 2);
  return promises.writeFile(path, content).then(() => ({
    status: "success" as const,
    message: `File written to ${path}`,
  }));
}

function createErrorHandler(path: string) {
  return (e: any) => ({
    status: "error" as const,
    message: `Failed to write file to ${path}`,
    details: e,
  });
}
