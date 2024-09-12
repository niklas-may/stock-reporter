import type { Config } from "../core/config";
import type { CreateWriter } from "../core/writer";

import Mailjet from "node-mailjet";
import { retry } from "../core/retry";
import { type FullStockReport } from "../core/report";

export const createEmailWriter: CreateWriter = (report: FullStockReport, config: Config) => {
  const { email } = config.output;
  if (!email) return undefined;

  const { start, symbol, end } = config.stock;
  const { prettyMaxDrawdown, prettySimpleReturn } = report;

  const content = `Your Stock Report for "${symbol}" from ${start} to ${end}:\nMax Drawdown: ${prettyMaxDrawdown}\nSimple Return: ${prettySimpleReturn}"`;

  const mailer = createMailer(email, content, config);
  const errorHandler = createErrorHandler(email);

  return () => retry(mailer, errorHandler);
};

function createMailer(email: string, content: string, config: Config) {
  const client = new Mailjet.Client({
    apiKey: config.env.MAILJET_API_KEY,
    apiSecret: config.env.MAILJET_API_SECRET,
  });

  const data = {
    Messages: [
      {
        From: {
          Email: "post@niklas-may.de",
        },
        To: [
          {
            Email: email,
          },
        ],
        Subject: "Your Stock Report",
        TextPart: content,
      },
    ],
  };
  return () =>
    client
      .post("send", { version: "v3.1" })
      .request(data)
      .then(() => ({
        status: "success" as const,
        message: `Email sent to ${email}`,
      }));
}

function createErrorHandler(email: string) {
  return (e: any) => ({
    status: "error" as const,
    message: `Failed to send email to ${email}`,
    details: e,
  });
}
