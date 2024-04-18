const nodemailer = require("nodemailer");
const { env } = require("../config/env.js");

const emailService = async (options) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: false,
    auth: {
      user: env.NODEMAILER_GOOGLE_EMAIL,
      pass: env.NODEMAILER_APP_PASSWORD,
    },
  });

  const MailOptions = {
    from: `Shop game RABBIT <${env.GOOGLE_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  transport.sendMail(MailOptions);
};

module.exports = emailService;
