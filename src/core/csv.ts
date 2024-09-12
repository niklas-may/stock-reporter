import { type Config } from "./config";

import neatCsv from "neat-csv";
import camelCase from "lodash/camelCase";
import { retry } from "./retry";
import { logger } from "./logger";

export type CsvRow = {
  open: number;
  high: number;
  low: number;
  adjClose: number;
  date: string;
};

export async function loadCsv(config: Config) {
  const { stock } = config;
  const start = new Date(stock.start).getTime() / 1000;
  const end = new Date(stock.end).getTime() / 1000;

  const url = new URL(`https://query1.finance.yahoo.com/v7/finance/download/${stock.symbol}`);
  url.searchParams.append("period1", start.toString());
  url.searchParams.append("period2", end.toString());
  url.searchParams.append("interval", "1d");
  url.searchParams.append("events", "history");
  url.searchParams.append("includeAdjustedClose", "true");

  const fetcher = () => fetch(url.toString());
  const response = await retry(fetcher, errorHandler);

  const rawData = await response.text();
  const data = await neatCsv<CsvRow>(rawData, {
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

  return data;
}

function errorHandler(e: any) {
  logger.error("Failed to load CSV.", e.message);
  return process.exit(1);
}