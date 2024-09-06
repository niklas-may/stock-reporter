#! /usr/bin/env node

import { createConsola } from "consola";
import { defineCommand, runMain } from "citty";
import { defineConfig } from "./config";
import { run } from "./app";

const logger = createConsola({ formatOptions: { date: false } }).withTag("recap-stock-report");

const main = defineCommand({
  meta: {
    name: "recap-stock-report",
    version: "0.0.1",
  },
  args: {
    symbol: {
      type: "string",
      description: "Stock Symbold name, e.g. 'AAPL'",
      required: true,
    },
    start: {
      type: "string",
      description: "Start date as an ISO String, e.g. '2021-01-01'",
      required: true,
    },
    end: {
      type: "string",
      description: "End date as an ISO String, e.g. '2021-01-01'",
      required: true,
    },
    out: {
      type: "string",
      description: "Output path for json file",
      required: false,
    },
    email: {
      type: "string",
      description: "Email address to send the report to ",
      required: false,
    },
  },
  async run({ args }) {
    logger.info("Welcome!");
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
      logger.success("Report generated successfully", "\n", JSON.stringify(result, null, 2));
    } catch (e: any) {
      logger.error(e.message, e.cause);
    }
  },
});

runMain(main);
