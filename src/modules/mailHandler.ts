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
      subject: '[Writon] 요청하신 서비스 이메일 인증 번호를 안내해드립니다.',
      html: `
      <p>본 메일은 Writon 서비스의 회원가입을 위한 이메일 인증입니다.</p>
    
      <p>진행 중인 화면에 인증번호를 정확히 입력해주세요.</p>
    
      <p>인증번호는 메일 발송 시점부터 3분 동안 유효합니다.</p>
    
      <p><strong>** 인증 코드 **</strong> : ${verificationCode}</p>
      `
    };
    const auth = await smtpTransport.sendMail(mailOptions);
    smtpTransport.close();
    console.log("here is email and auth")
    console.log(email + "       " + auth);
   
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
      subject: '[Writon] 임시 비밀번호 안내',
      html: `
      <p>안녕하세요, 라이톤 입니다. </p>
    
      <p>회원님의 임시 비밀번호는 다음과 같습니다.</p>
    
      <p>개인정보 보호를 위해 로그인 후 새로운 비밀번호로 변경해주시기 바랍니다.</p>

      <strong>임시비밀번호</strong>  : ${randomPassword}
      `
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


