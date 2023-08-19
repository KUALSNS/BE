import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config();
const env = process.env;

const DATA_SOURCES = {
  development: {
    host: env.HOST!,
    user: env.USER!,
    password: env.PASSWORD!,
    port: 3306,
    database: env.DATABASE!,
  }
};

export { DATA_SOURCES } 