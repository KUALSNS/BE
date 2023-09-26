import * as redis from 'redis';
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('dotenv').config();
// const redisClient = redis.createClient({            // aws 
//     url: `redis://${process.env.AWS_REDIS_ENDPOINT}:${process.env.AWS_REDIS_PORT}`,
//     legacyMode: true
// });




// Redis 클라이언트 생성
const redisClient = redis.createClient({
    url: `redis://${process.env.REDISLAB}@${process.env.AWS_REDIS_ENDPOINT}:${process.env.AWS_REDIS_PORT}`,
    legacyMode: true,
    disableOfflineQueue: true, 
});

const connectToRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (error) {
        setTimeout(() => {
            redisClient.quit(); // 현재 연결 종료
            redisClient.connect(); // 다시 연결 시도
        }, 3000);
        console.error('Error connecting to Redis:');
    }
};

//connectToRedis();

export { redisClient };