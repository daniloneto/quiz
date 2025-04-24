const { SendEmailCommand } = require('@aws-sdk/client-ses');
const logger = require('../config/logger');

async function sendActivationEmail (email, token) {
  const mailersend = new MailerSend({ apiKey: process.env.MAILSEND_KEY });
  const sentFrom = new Sender('lkk.mlsender.net', 'CertQuiz');
  const recipients = [new Recipient(email, 'User')];
  logger.info(`Token enviado: ${token}`);
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('CertQuiz - Verificação de e-mail')
    .setHtml(`Ative sua conta CertQuiz. Digite o código quando solicitado: ${token}`);

  await mailersend.email.send(emailParams);
}

async function sendResetPasswordEmail (email, token) {
  const mailersend = new MailerSend({ apiKey: process.env.MAILSEND_KEY });
  const sentFrom = new Sender('ioiuoiu.mlsender.net', 'CertQuiz');
  const recipients = [new Recipient(email, 'User')];
  logger.info(`Token enviado: ${token}`);
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('CertQuiz - Redefinição de senha')
    .setHtml(`Digite o código quando solicitado: ${token}`);

  await mailersend.email.send(emailParams);
}

module.exports = {
  sendActivationEmail,
  sendResetPasswordEmail
};