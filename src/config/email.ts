const nodemailer = require('nodemailer');
const env = process.env;
const smtpTransport = nodemailer.createTransport({
  service: "Naver",
  auth: {
    user: env.EMAIL,
    pass: env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports={
  smtpTransport
}