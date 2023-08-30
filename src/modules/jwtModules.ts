import jwt from 'jsonwebtoken';
import type { JwtPayload } from "jsonwebtoken"
import * as redis from 'redis';

const secret = process.env.JSONSECRET!;
const redisClient = redis.createClient({
  url: `redis://${process.env.AWS_REDIS_ENDPOINT}:${process.env.AWS_REDIS_PORT}`,
  legacyMode: true
});


const sign = (userId: number, userRole: string) => {
  const payload = {
    id: userId,
    role: userRole,
  };
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: '2m',
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
      await redisClient.connect();
 console.log(userId);
    
    const data: string = await redisClient.v4.get(String(userId));
    console.log(data);

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



export { sign, refresh, decode, refreshVerify, verify }