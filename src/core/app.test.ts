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
    end: new Date(1640995200 * 1000).toISOString(),
    start: new Date(1609459200 * 1000).toISOString(),
    symbol: "AAPL",
  };
}
