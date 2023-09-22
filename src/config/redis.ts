import * as redis from 'redis';
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config();
// const redisClient = redis.createClient({            // aws 
//     url: `redis://${process.env.AWS_REDIS_ENDPOINT}:${process.env.AWS_REDIS_PORT}`,
//     legacyMode: true
// });


export const redisClient = redis.createClient({
    url: `redis://${process.env.REDISLAB}@${process.env.AWS_REDIS_ENDPOINT}:${process.env.AWS_REDIS_PORT}`,
    legacyMode: true
});
