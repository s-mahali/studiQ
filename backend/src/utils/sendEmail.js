import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, text }) => {
  const transporter = nodeMailer.createTransport({
    port: process.env.SMTP_PORT,
    host: process.env.SMTP_HOST,
    secure: false,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const options = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html: text,
  };

  await transporter.sendMail(options);
};
