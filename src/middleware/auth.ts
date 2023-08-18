
import jwt from 'jsonwebtoken';
import type { JwtPayload } from "jsonwebtoken"
import * as redis from 'redis';
import { NextFunction, Request, Response } from 'express'
const secret = process.env.JSONSECRET!;
const redisClient = redis.createClient({
  url: `redis://${process.env.AWS_REDIS_ENDPOINT}:${process.env.AWS_REDIS_PORT}`,
  legacyMode: true
});


const sign = (userId: string, userRole: number) => {
  const payload = {
    id: userId,
    role: userRole,
  };
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: '30s',
  });
}

const refresh = () => {
  return jwt.sign({}, secret, {
    algorithm: 'HS256',
    expiresIn: '30d',
  });
}
const decode = (token: string) => {
  try {
    const decoded = jwt.decode(token, { complete: true }) as JwtPayload;
    console.log(decoded);
    return {
      message: "Ok",
      id: decoded.payload.id,
      role: decoded.payload.role,
    }
  }
  catch (err) {
    console.log(err);
  }

}

const verify = (token: string) => {

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return {
      state: true,
      id: decoded!.id,
      role: decoded!.role,
    };
  } catch (err) {
    return {
      state: false,
    };
  }
};

const refreshVerify = async (token: string, userId: number) => {
  try {
    await redisClient.connect();
    const data: string = await redisClient.v4.get(String(userId));

    if (token === data.split('Bearer ')[1]) {

      jwt.verify(data.split('Bearer ')[1], secret);

      await redisClient.disconnect();
      return { state: true };
    }
    await redisClient.disconnect();
    return { state: false };


  } catch (err) {
    await redisClient.disconnect();
    return { state: false };
  }
};

const verifyToken = (req: any, res: Response, next: NextFunction) => {
  try {
    const token: string = req.header("access") as string;
    const organized_token = token.substr(7);
    req.decoded = jwt.verify(organized_token, secret);
    return next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') { // 유효기간 초과
      return res.status(419).json({
        code: 419,
        message: '토큰이 만료되었습니다',
      });
    }
    return res.status(401).json({
      code: 401,
      message: '유효하지 않은 토큰입니다',
    });
  }
}





export { sign, refresh, decode, refreshVerify, verify, verifyToken }