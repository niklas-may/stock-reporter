import { type IWriter } from "../core/writer";
import { type StockReportResult } from "../core/stock-report";

import dotenv from "dotenv";
import Mailjet from "node-mailjet";

// TODO: Make .env available globally
dotenv.config();

export class EmailWriter implements IWriter {
  private content: any;
  private client = new Mailjet.Client({
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_API_SECRET,
  });

  constructor(public readonly email: string) {}

  setContent(content: StockReportResult) {
    this.content = `Your Stock Report for "${content.symbol}" from ${new Date(content.startDate).toLocaleDateString()} to ${new Date(content.endDate).toLocaleDateString()}:\nMax Drawdown: ${content.prettyMaxDrawdown}\nSimple Return: ${content.prettySimpleReturn}"`;
  }

  async write() {
    const data = {
      Messages: [
        {
          From: {
            Email: "post@niklas-may.de",
          },
          To: [
            {
              Email: this.email,
            },
          ],
          Subject: "Your Stock Report",
          TextPart: this.content,
        },
      ],
    };
    await this.client.post("send", { version: "v3.1" }).request(data);
  }
}
