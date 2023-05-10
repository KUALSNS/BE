import nodemailer = require('nodemailer');
require('dotenv').config();

const smtpTransport = nodemailer.createTransport({
  service: "naver",
  host: 'smtp.naver.com',  // SMTP
  port: 465,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports={
  smtpTransport
}