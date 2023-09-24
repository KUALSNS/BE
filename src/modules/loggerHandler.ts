
import Slack from 'slack-node';
import { createRequire } from 'module'
import   TransportStream  from 'winston-transport';
import { createLogger, transports, format } from 'winston';
import { DATA_SOURCES } from '../config/auth.js';
import mysql from 'mysql2/promise';

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

class DatabaseTransport extends TransportStream {
  async log(info: { level : string, timestamp : Date, message : string}, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // MySQL 데이터베이스에 로그를 삽입합니다.
    try {
      const { level,  message } = info;
   
      const connection = await mysql.createConnection(DATA_SOURCES.development);
      await connection.connect();
      const escapedMessage = message.replace(/'/g, "''");
      const logInsert = `INSERT INTO error_logs (level, message) VALUES ('${level}', '${escapedMessage}'); `;
      await connection.query(logInsert);
      await connection.end();
      console.log('로그가 데이터베이스에 저장되었습니다.');
    } catch (error) {
      console.error('데이터베이스에 로그 저장 중 오류 발생');
    }
    callback();
  }
}

export const logger = createLogger({
  level: 'error', // 로그 레벨 설정 (이 예제에서는 error 레벨 이상만 저장)
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    // 커스텀 MySQL 트랜스포트 추가
    new DatabaseTransport(),
  ],
});

