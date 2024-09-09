#! /usr/bin/env node

import { defineCommand, runMain } from "citty";
import pkg from "../../package.json" assert { type: "json" };
import { defineConfig } from "./config";
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
      const { config, options } = defineConfig(
        {
          start: args.start,
          end: args.end,
          symbol: args.symbol,
        },
        {
          out: args.out,
          email: args.email,
        }
      );

      const result = await run(config, options);

      logger.box(
        `${config.symbol}: simple return: ${result.prettySimpleReturn}, max drawdown: ${result.prettyMaxDrawdown}`
      );

      if (options?.out) {
        logger.info(`Report saved to ${options.out}`);
      }
      if (options?.email) {
        logger.info(`Report sent to ${options.email}`);
      }
    } catch (e: any) {
      logger.error(e.message, e.cause);
    }
  },
});

runMain(main);
