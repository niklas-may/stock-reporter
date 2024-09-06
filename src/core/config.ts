import { z } from "zod";

export type Config = z.infer<typeof configValidator>;
export type Options = {
  out?: string;
  email?: string;
};

export function defineConfig(userConfig: Config, options?: Options): { config: Config; options: Options } {
  const { data, error } = configValidator.safeParse(userConfig);

  if (error) {
    throw new Error("Ooops, something was wraong with you input.", { cause: error });
  }

  return { config: data, options: options || {} };
}

// TODO: Check if this realy validates ISO date strings.
const configValidator = z.object({
  start: z.string().date(),
  end: z.string().date(),
  symbol: z.string(),
});
