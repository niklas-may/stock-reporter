import { type CsvRow } from "./csv";
import { type Config } from "./config";

import isNull from "lodash/isNull";
import { logger } from "./logger";

export interface StockReportResult {
  maxDrawdown: number;
  simpleReturn: number;
  startDate: string;
  endDate: string;
}

export interface FullStockReport extends StockReportResult {
  prettyMaxDrawdown: string;
  prettySimpleReturn: string;
  symbol: string;
}

export function createReport(data: CsvRow[]): StockReportResult {
  let start: number | null = null;
  let lastClose: number | null = null;
  let high: number | null = null;
  let maxDrawdown: number | null = null;

  for (const row of data) {
    if (isNull(start)) start = row.adjClose;
    if (isNull(high)) high = row.adjClose;
    if (isNull(maxDrawdown)) maxDrawdown = calcMaxDrawdown(row.adjClose, high);

    if (row.adjClose > high) high = row.adjClose;

    const drawDown = calcMaxDrawdown(row.adjClose, high);
    if (drawDown > maxDrawdown) maxDrawdown = drawDown;

    lastClose = row.adjClose;
  }

  if (isNull(start) || isNull(lastClose) || isNull(maxDrawdown)) {
    logger.error("Invalid Data.");
    process.exit(1);
  }

  const result: StockReportResult = {
    maxDrawdown: maxDrawdown || 0,
    simpleReturn: (lastClose - start) / start,
    startDate: data[0].date,
    endDate: data[data.length - 1].date,
  };

  return result;
}

export function decorateReport(report: StockReportResult, config: Config): FullStockReport {
  return {
    ...report,
    symbol: config.stock.symbol,
    prettyMaxDrawdown: readablePercentage(report.maxDrawdown),
    prettySimpleReturn: readablePercentage(report.maxDrawdown),
  };
}

function readablePercentage(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function calcMaxDrawdown(througPrice: number, peakPrice: number) {
  return (througPrice - peakPrice) / peakPrice;
}
