const nodemailer = require('nodemailer');
const env = process.env;
const smtpTransport = nodemailer.createTransport({
  service: "naver",
  host: 'smtp.naver.com',  // SMTP
  port: 465,
  auth: {
    user: env.NODEMAILER_USER,
    pass: env.NODEMAILER_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports={
  smtpTransport
}