import axios from "axios";
import isNull from "lodash/isNull";
import { AbstractAdapter, adapterValidator } from "./adapter";
import { logger } from "./logger";

export interface StockReportResult {
  maxDrawdown: number;
  simpleReturn: number;
  prettyMaxDrawdown: string;
  prettySimpleReturn: string;
  startDate: string;
  endDate: string;
  symbol: string;
}

export class StockReport {
  private temp: {
    lastClose: number | null;
    start: number | null;
    end: number | null;
    high: number | null;
    low: number | null;
  } = { lastClose: null, start: null, end: null, high: null, low: null };

  constructor(public adapter: AbstractAdapter) {}

  async generate(): Promise<StockReportResult> {
    return new Promise((resolve, reject) => {
      axios
        .get(this.adapter.requestUrl.toString(), { ...this.adapter.requestConfig, responseType: "stream" })
        .then((res) => {
          const rawData = res.data;

          rawData
            .pipe(this.adapter.csvParser)
            .on("data", (inputData: any) => {
              this.onDataRow(inputData);
            })
            .on("end", () => {
              const result = this.onEnd();
              resolve(result);
            })
            .on("error", (e: any) => {
              reject(e);
            });
        });
    });
  }

  private onDataRow(rawData: any) {
    const { error, data } = adapterValidator.safeParse(rawData);

    if (error) {
      logger.error("Invalid csv row data shape:", error.message);
      logger.log("Row data recieved:", rawData);
      process.exit(1);
    }

    if (isNull(this.temp.start)) {
      this.temp.start = data.open;
    }

    if (isNull(this.temp.high)) {
      this.temp.high = data.adjClose;
    }

    if (isNull(this.temp.low)) {
      this.temp.low = (this.temp.high - data.adjClose) / this.temp.high;
    }

    if (data.adjClose > this.temp.high) {
      this.temp.high = data.adjClose;
    }

    const drawDown = (this.temp.high - data.adjClose) / this.temp.high;
    if (drawDown > this.temp.low) {
      this.temp.low = drawDown;
    }

    this.temp.lastClose = data.adjClose;
  }

  private onEnd(): StockReportResult {
    if (!this.temp.start || !this.temp.lastClose || !this.temp.low) throw new Error("Missing Data");

    const result: StockReportResult = {
      symbol: this.adapter.symbol,
      endDate: this.adapter.endDate,
      startDate: this.adapter.startDate,
      maxDrawdown: 0,
      simpleReturn: 0,
      prettyMaxDrawdown: "",
      prettySimpleReturn: "",
    };

    this.temp.end = this.temp.lastClose;
    result.simpleReturn = (this.temp.end - this.temp.start) / this.temp.start;
    result.maxDrawdown = this.temp.low;

    result.prettySimpleReturn = `${(result.simpleReturn * 100).toFixed(2)}%`;
    result.prettyMaxDrawdown = `${(result.maxDrawdown * 100).toFixed(2)}%`;

    return result;
  }
}
