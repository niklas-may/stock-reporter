import { Config } from "./config";
import { FullStockReport } from "./report";

export type CreateWriter = (report: FullStockReport, config: Config) => Writer | undefined;
export type Writer = () => Promise<WriterReturn>;
export type WriterReturn = {
  status: "success" | "error";
  message: string;
  details?: any;
};
