
import jwt from 'jsonwebtoken';
import type { JwtPayload } from "jsonwebtoken"
import * as redis from 'redis';
const secret = process.env.JSONSECRET!;
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
  legacyMode: true
});



const sign = (userId: string, userRole: number) => {
  const payload = {
    id: userId,
    role: userRole,
  };

  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: '1m',
  });
}

const refresh = () => {
  return jwt.sign({}, secret, {
    algorithm: 'HS256',
    expiresIn: '4m',
  });
}
const decode = (token: string) => {

  const decoded = jwt.decode(token) as JwtPayload;
  return {
    message: "Ok",
    id: decoded!.id,
    role: decoded!.role,
  }
}

const verify = (token: string) => {

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return {
      id: decoded!.id,
      role: decoded.role,
    };
  } catch (err) {
    return {
      state: false,
    };
  }
}

const refreshVerify = async (token: string, userId: number) => {
  try {
    await redisClient.connect();
    const data: string = await redisClient.v4.get(String(userId));
    if (typeof data === 'string') {
      if (token === data.split('Bearer ')[1]) {
          jwt.verify(data.split('Bearer ')[1], secret);
          return { state: true };
      } else {
        return { state: false };
      }
    }
  } catch (err) {
    return { state: false };
  } finally {
    await redisClient.disconnect();
  }
}





export { sign, refresh, decode, refreshVerify, verify }