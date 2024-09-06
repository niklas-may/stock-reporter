import { AbstractAdapter, adapterValidator } from "./adapter";
import axios from "axios";
import isNull from "lodash/isNull";

export interface StockReportResult {
  maxDrawdown: number;
  simpleReturn: number;
  prettyMaxDrawdown: string;
  prettySimpleReturn: string;
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

  private result: StockReportResult = {
    maxDrawdown: 0,
    simpleReturn: 0,
    prettyMaxDrawdown: "",
    prettySimpleReturn: "",
    symbol: "",
  };

  constructor(private config: AbstractAdapter) {
    this.result.symbol = this.config.symbol;
  }

  async generate(): Promise<any> {
    return new Promise((resolve, reject) => {
      axios
        .get(this.config.requestUrl.toString(), { ...this.config.requestConfig, responseType: "stream" })
        .then((res) => {
          const rawData = res.data;

          rawData
            .pipe(this.config.csvParser)
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
      throw new Error(error.message);
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

  private onEnd() {
    if (!this.temp.start || !this.temp.lastClose || !this.temp.low) throw new Error("Missing Data");

    this.temp.end = this.temp.lastClose;
    this.result.simpleReturn = (this.temp.end - this.temp.start) / this.temp.start;
    this.result.maxDrawdown = this.temp.low;

    this.result.prettySimpleReturn = `${(this.result.simpleReturn * 100).toFixed(2)}%`;
    this.result.prettyMaxDrawdown = `${(this.result.maxDrawdown * 100).toFixed(2)}%`;

    return this.result;
  }
}
