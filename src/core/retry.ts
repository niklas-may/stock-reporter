import { logger } from "./logger";

export async function retry<TData extends any, TError extends any>(
  fn: () => Promise<TData>,
  onErr: (error: any) => TError,
  interval = 600,
  retries = 3,
  currentRetry?: number
): Promise<TData | TError > {
  const retriesLeft = currentRetry ?? retries;

  try {
    const res = await fn();
    return res;
  } catch (error) {
    if (retriesLeft === 0) {
      return onErr(error);
    } else {
      const waitTime = interval * (retries - retriesLeft + 1);
      logger.warn(`Promise faild, retrying in ${waitTime}...`, error);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return retry(fn, onErr, interval, retries, retriesLeft - 1);
    }
  }
}

export async function flakeyPromise() {
  return new Promise((resolve, reject) => {
    if (Math.random() > 0.5) {
      resolve("Success");
    } else {
      reject("Failure");
    }
  });
}
