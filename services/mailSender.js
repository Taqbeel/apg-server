const { createTransport } = require('nodemailer');
const { MAIL_HOST, MAIL_USER, MAIL_PASS } = require('../config/config');

const mailSender = createTransport({
  host: MAIL_HOST,
  port: 587,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

module.exports = mailSender;