import { run } from "./app";
import { defineConfig } from "./config";

main();

async function main() {
  const { start, end, symbol } = mockInput();
  const { config } = defineConfig({ start, end, symbol });

  await run(config);
}

function mockInput() {
  return {
    start: "2021-01-01",
    end: "2022-01-01",
    symbol: "AAPL",
  };
}
