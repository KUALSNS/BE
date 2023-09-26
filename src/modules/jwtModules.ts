import jwt from 'jsonwebtoken';
import type { JwtPayload } from "jsonwebtoken"
import { redisClient } from '../config/redis.js'; 

const secret = process.env.JSONSECRET!;

const sign = (userId: number, userRole: string) => {
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
    const decoded = jwt.decode(token) as JwtPayload;

    return {
      message: "Ok",
      id: decoded.id,
      role: decoded.role,
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
    const data: string = await redisClient.v4.get(String(userId));

    if (token === data.split('Bearer ')[1]) { 

      jwt.verify(data.split('Bearer ')[1], secret);

      return { state: true, token : data};
    }
    return { state: false};

  } catch (err) {
    return { state: false };
  }
};



export { sign, refresh, decode, refreshVerify, verify }