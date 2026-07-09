const nodemailer = require("nodemailer");

let transporter = null;
function getTransport() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransport();
  if (!t) {
    console.log(`[mail:stub] -> ${to} :: ${subject}`);
    return { stub: true };
  }
  return t.sendMail({
    from: process.env.SMTP_FROM || "no-reply@expenseflow.app",
    to, subject, html, text,
  });
}

module.exports = { sendMail };
