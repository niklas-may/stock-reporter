import { z } from "zod";
import { logger } from "./logger";
import dotenv from "dotenv";

export type Config = {
  stock: StockOptions;
  output: OutputOptios;
  env: EnvVariables;
};

export type StockOptions = z.infer<typeof configValidator>;

export type OutputOptios = {
  out?: string;
  email?: string;
};

type EnvVariables = z.infer<typeof envValidator>;

export function createConfig(userConfig: StockOptions, output: OutputOptios = {}): Config {
  dotenv.config();

  const parsedConfig = configValidator.safeParse(userConfig);
  if (parsedConfig.error) {
    logger.error("Invalid Config.", parsedConfig.error);
    process.exit(1);
  }
  const stockOptions = {
    ...parsedConfig.data,
    start: new Date(parsedConfig.data.start).toISOString(),
    end: new Date(parsedConfig.data.end).toISOString(),
  };

  const parsedEnv = envValidator.safeParse(process.env);
  if (parsedEnv.error) {
    logger.error("Invalid Env.", parsedEnv.error);
    process.exit(1);
  }

  return {
    stock: stockOptions,
    output: output,
    env: parsedEnv.data,
  };
}

const configValidator = z.object({
  start: z.string().date(),
  end: z.string().date(),
  symbol: z.string(),
});

const envValidator = z.object({
  MAILJET_API_KEY: z.string(),
  MAILJET_API_SECRET: z.string(),
});
