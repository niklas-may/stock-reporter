import { run } from "./app";
import { logger } from "./logger";

main();

async function main() {
  const input = mockInput();

  const { report, output } = await run(input, { out: "./playground" });

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
}

function mockInput() {
  return {
    start: "2021-01-01",
    end: "2022-01-01",
    symbol: "AAPL",
  };
}
