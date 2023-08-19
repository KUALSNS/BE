
import Slack from 'slack-node';
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config();
const webhookUrl = process.env.SLACK_URL!;
const slack = new Slack();
slack.setWebhook(webhookUrl);


export const stream = {
  write: (message: string) => {
    slack.webhook({
      channel: "#백엔드-서버-로깅",
      username: "Writon-Logger",
      text: message
    },
    (err, response) => {})
  }
}