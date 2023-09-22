import * as redis from 'redis';
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import { smtpTransport } from "../config/email.js";
require('dotenv').config();
import { redisClient } from '../config/redis.js'; 

// const redisClient = redis.createClient({                                     // aws 
//   url: `redis://${process.env.AWS_REDIS_ENDPOINT}:${process.env.AWS_REDIS_PORT}`,
//   legacyMode: true
// });

// const redisClient = redis.createClient({
//   url: `redis://${process.env.REDISLAB}@${process.env.AWS_REDIS_ENDPOINT}:${process.env.AWS_REDIS_PORT}`,
//   legacyMode: true
// });


const generateRandom = function (min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const smtpSender = async function (email: string) {
  try {
    const verificationCode = generateRandom(100000, 999999);

    await redisClient.connect();

    //redis set email code - 3 minutes expire
    await redisClient.v4.set(email, verificationCode, 'EX', 60 * 3);
    //redis get email code
    const mailOptions = {
      from: "teamwritoner" + "@gmail.com",
      to: email,
      subject: 'Writon 서비스 이메일 인증 코드입니다.',
      text: `인증 코드 : ${verificationCode}`
    };
    const auth = await smtpTransport.sendMail(mailOptions);
    smtpTransport.close();
    console.log("here is email and auth")
    console.log(email + "       " + auth);
   // await redisClient.disconnect();
   
    
    return {
      status: 200,
      message: '이메일이 성공적으로 전송되었습니다.',
      responseData: {
        verificationCode: verificationCode
      }
    };
  } catch (error) {
 //   await redisClient.disconnect();
    return {
      status: 500,
      message: '이메일 전송에 실패하였습니다.',
      responseData: {
        error: error
      }
    }
  }finally {
    await redisClient.disconnect(); // 연결 종료
}

}

export const randomPasswordsmtpSender = async (email: string, randomPassword: string) => {
  try {
    console.log(randomPassword)

    const mailOptions = {
      from: "teamwritoner" + "@gmail.com",
      to: email,
      subject: 'Writon 서비스 이메일 인증 코드입니다.',
      text: `임시비밀번호 : ${randomPassword}`
    };
    await smtpTransport.sendMail(mailOptions);
    smtpTransport.close();
    return {
      status: 200,
      message: '이메일이 성공적으로 전송되었습니다.',
      responseData: {
        verificationCode: randomPassword
      }
    };
  } catch (error) {
    return {
      status: 500,
      message: '이메일 전송에 실패하였습니다.',
      responseData: {
        error: error
      }
    }
  }
}


