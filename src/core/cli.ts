#! /usr/bin/env node

import { defineCommand, runMain } from "citty";
import pkg from "../../package.json" assert { type: "json" };
import { logger } from "./logger";
import { run } from "./app";

const main = defineCommand({
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
  args: {
    symbol: {
      type: "string",
      description: "Stock Symbol name, e.g. 'AAPL'",
      required: true,
    },
    start: {
      type: "string",
      description: "Start date as an ISO string, e.g. '2021-01-01'",
      required: true,
    },
    end: {
      type: "string",
      description: "End date as an ISO string, e.g. '2021-01-01'",
      required: true,
    },
    out: {
      type: "string",
      description: "Output path for json file",
      required: false,
    },
    email: {
      type: "string",
      description: "Email address to send the report to",
      required: false,
    },
  },
  async run({ args }) {
    logger.info("Generating stock report...");

    try {
      const stockOptions = {
        start: args.start,
        end: args.end,
        symbol: args.symbol,
      };
      const outputOptions = {
        out: args.out,
        email: args.email,
      };

      const { report, output } = await run(stockOptions, outputOptions);

      logger.box(
        `${report.symbol}: simple return: ${report.prettySimpleReturn}, max drawdown: ${report.prettyMaxDrawdown}`
      );

      for (const out of output) {
        if (out.status === "success") {
          logger.info(out.message);
        } else {
          logger.error(out.message, out.details);
        }
      }
    } catch (e: any) {
      logger.error(e.message, e.cause);
    }
  },
});

runMain(main);
