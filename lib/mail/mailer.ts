import nodemailer from "nodemailer";

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in environment.`);
  }
  return value;
}

let transporter: nodemailer.Transporter | null = null;

export function getMailer() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host: required("SMTP_HOST"),
      port,
      secure: port === 465,
      auth: {
        user: required("SMTP_USER"),
        pass: required("SMTP_PASSWORD"),
      },
    });
  }
  return transporter;
}

export function mailFrom() {
  const user = process.env.SMTP_USER;
  if (!user) {
    throw new Error("Missing SMTP_USER in environment.");
  }
  return `"Enzama Looks" <${user}>`;
}
