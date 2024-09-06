import type { AxiosRequestConfig } from "axios";
import csvParser from "csv-parser";
import { URL } from "url";
import { z } from "zod";

export abstract class AbstractAdapter {
  public symbol: string = "";
  public csvParser: ReturnType<typeof csvParser> = csvParser();
  public requestUrl = new URL("https://example.com");
  public requestConfig?: AxiosRequestConfig;
  public startDate: string;
  public endDate: string;

  constructor(config: AdapterCosntructorArgs) {
    this.symbol = config?.symbol;
    this.startDate = new Date(config?.period?.start).toISOString();
    this.endDate = new Date(config?.period?.end).toISOString();
  }
}

export type AdapterCosntructorArgs = {
  symbol: string;
  period: {
    start: string;
    end: string;
  };
};

export const adapterValidator = z.object({
  open: z.number(),
  high: z.number(),
  low: z.number(),
  adjClose: z.number(),
});
