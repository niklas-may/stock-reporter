import { type WriterReturn, type Writer } from "./writer";
import { createConfig, OutputOptios, StockOptions } from "./config";
import { createReport, decorateReport, type FullStockReport } from "./report";
import { createFileWriter } from "../writers/file-writer";
import { createEmailWriter } from "../writers/email-writer";
import { loadCsv } from "./csv";

export async function run(
  stockOptions: StockOptions,
  outputOptions: OutputOptios = {}
): Promise<{ report: FullStockReport; output: WriterReturn[] }> {
  
  const config = createConfig(stockOptions, outputOptions);
  const data = await loadCsv(config);
  const simpleReport = createReport(data);
  const report = decorateReport(simpleReport, config);

  const wirters: Writer[] = [createFileWriter(report, config), createEmailWriter(report, config)].filter((w) => !!w);
  const output = await Promise.all(wirters.map((write) => write()));

  return { report, output };
}
