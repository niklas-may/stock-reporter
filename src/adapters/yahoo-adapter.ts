import { AbstractAdapter, type AdapterCosntructorArgs } from "../core/adapter";

import csvParser from "csv-parser";
import camelCase from "lodash/camelCase";

export class YahooAdapter extends AbstractAdapter {
  private baseUrl = "https://query1.finance.yahoo.com/v7/finance/download";
  public csvParser;
  public requestUrl;

  constructor(config: AdapterCosntructorArgs) {
    super(config);

    this.requestUrl = this.getUrl(config);

    this.csvParser = csvParser({
      mapHeaders: ({ header }) => {
        return camelCase(header).trim();
      },
      mapValues: ({ header, value }) => {
        switch (header) {
          case "open":
          case "high":
          case "low":
          case "adjClose":
            return Math.round(value * 100);
          default:
            return value;
        }
      },
    });
  }

  private getUrl(config: AdapterCosntructorArgs) {
    const url = new URL(`${this.baseUrl}/${config.symbol}`);

    const start = new Date(config.period.start).getTime() / 1000;
    const end = new Date(config.period.end).getTime() / 1000;

    url.searchParams.append("period1", start.toString());
    url.searchParams.append("period2", end.toString());
    url.searchParams.append("interval", "1d");
    url.searchParams.append("events", "history");
    url.searchParams.append("includeAdjustedClose", "true");

    return url;
  }
}
