import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

const initMailer = (): nodemailer.Transporter => {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    pool: true,
    host: String(process.env.SMTP_HOST),
    port: 587,
    secure: false,
    auth: {
      user: String(process.env.SMTP_AUTH_USER),
      pass: String(process.env.SMTP_AUTH_PASSWORD),
    },
  });

  // verify connection configuration
  transporter.verify((error: Error | null, success: boolean) => {
    if (error) {
      throw new Error(error.message);
    } else {
      // console.log("Server is ready to take our messages:", success);
    }
  });

  return transporter;
};

export default initMailer;