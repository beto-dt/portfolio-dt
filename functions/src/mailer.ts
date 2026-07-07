import nodemailer from 'nodemailer';

export const ADMIN_EMAIL = 'luis.atorred24@gmail.com';

/**
 * Sends a notification email to the admin inbox. Explicit SMTPS (TLS on 465) —
 * same endpoint the 'gmail' shorthand uses, spelled out so the transport is
 * verifiably encrypted (Sonar S5332).
 */
export function sendAdminEmail(pass: string, subject: string, text: string, replyTo?: string): Promise<unknown> {
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: ADMIN_EMAIL, pass },
  });
  return transport.sendMail({ from: `Portfolio <${ADMIN_EMAIL}>`, to: ADMIN_EMAIL, replyTo, subject, text });
}
