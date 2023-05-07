const express = require('express');
const router = express.Router();
const { smtpTransport } = require("../config/email");
require('dotenv').config();
const env = process.env;

const generateRandom = function (min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const smtpSender = async (email:string) => {
  const verificationCode = generateRandom(100000, 999999);

  const mailOptions = {
    from: env.EMAIL,
    to: email,
    subject: '이메일 인증 코드입니다.',
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


module.exports = router;