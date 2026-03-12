// TODO: migrate to Microsoft Graph API for better reliability and OAuth2 auth
import nodemailer from "nodemailer";

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: "info@circulr.es",
        pass: process.env.OUTLOOK_PASSWORD,
      },
    });
  }
  return _transporter;
}

const FROM_EMAIL = "CIRCULR <info@circulr.es>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.OUTLOOK_PASSWORD) {
    console.warn("OUTLOOK_PASSWORD not set, skipping email:", subject);
    return null;
  }

  try {
    const info = await getTransporter().sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    return { id: info.messageId };
  } catch (error) {
    console.error("Email send failed:", error);
    return null;
  }
}
