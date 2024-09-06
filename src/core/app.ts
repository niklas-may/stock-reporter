import { YahooAdapter } from "../adapters/yahoo-adapter";
import { Config, Options } from "./config";
import { StockReport, type StockReportResult } from "./stock-report";
import { FileWriter } from "../writers/file-writer";
import { IWriter } from "./writer";
import { EmailWriter } from "../writers/email-writer";

export async function run({ start, end, symbol }: Config, options?: Options): Promise<StockReportResult> {
  const adapter = new YahooAdapter({ symbol, period: { start, end } });
  const report = new StockReport(adapter);
  const result = await report.generate();

  const wirters: IWriter[] = [];

  if (options?.out) {
    const writer = new FileWriter(options.out, adapter.symbol);
    writer.setContent(result);
    wirters.push(writer);
  }

  if (options?.email) {
    const writer = new EmailWriter(options.email);
    writer.setContent(result);
    wirters.push(writer);
  }

  await Promise.all(wirters.map((writer) => writer.write()));

  return result;
}
