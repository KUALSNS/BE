import * as redis from 'redis';

const express = require('express');
const router = express.Router();
const { smtpTransport } = require("../config/email");
require('dotenv').config();
const env = process.env;

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
  legacyMode: true
});

const generateRandom = function (min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const smtpSender = async function( email:string) {
  const verificationCode = generateRandom(100000, 999999);
  await redisClient.connect();

  //redis set email code
  await redisClient.v4.set(email, verificationCode, 'EX', 60 * 3);
  //redis get email code
  const data: string = await redisClient.v4.get(email);
  console.log(data);


  const mailOptions = {
    from: process.env.NODEMAILER_USER + "@naver.com",
    to: email,
    subject: 'Tarae 서비스 이메일 인증 코드입니다.',
    text: `인증 코드 : ${verificationCode}`
  };
  smtpTransport.sendMail(mailOptions, (error: any, responses: string) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + responses);
    }
    smtpTransport.close();
  });
  return {
    status: 200,
    message: '이메일이 성공적으로 전송되었습니다.',
    responseData: {
      verificationCode: verificationCode
    }
  };
}


module.exports.smtpSender = smtpSender;
