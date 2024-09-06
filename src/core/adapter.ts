import type { AxiosRequestConfig } from "axios";
import csvParser from "csv-parser";
import { URL } from "url";
import { z } from "zod";

export abstract class AbstractAdapter {
  public symbol: string = ""
  public csvParser: ReturnType<typeof csvParser> = csvParser();
  public requestUrl = new URL("https://example.com");
  public requestConfig?: AxiosRequestConfig;

  constructor(config: AdapterCosntructorArgs) {
    this.symbol = config?.symbol;
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
