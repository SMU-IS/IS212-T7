import nodemailer from "nodemailer";

export class Mailer {
  private static instance: Mailer | null = null;
  private transporter: nodemailer.Transporter | null = null;

  private constructor() {}

  public static getInstance(): Mailer {
    if (!Mailer.instance) {
      Mailer.instance = new Mailer();
    }
    return Mailer.instance;
  }

  public getTransporter(): nodemailer.Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    this.transporter = nodemailer.createTransport({
      pool: true,
      host: String(process.env.SMTP_HOST),
      port: 587,
      secure: false,
      auth: {
        user: String(process.env.SMTP_AUTH_USER),
        pass: String(process.env.SMTP_AUTH_PASSWORD),
      },
    });

    this.transporter.verify((error: Error | null, success: boolean) => {
      if (error) {
        throw new Error(error.message);
      }
    });

    return this.transporter;
  }
}
export default Mailer;
