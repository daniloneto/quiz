const { MailerSend, Sender, Recipient, EmailParams } = require('mailersend');
const logger = require('../../config/logger');

/**
 * Service for sending emails via MailerSend.
 */
class EmailService {
  constructor(apiKey) {
    this.mailer = new MailerSend({ apiKey: apiKey || process.env.MAILSEND_KEY });
  }

  async sendActivationEmail(email, token) {
    const sentFrom = new Sender('lkk.mlsender.net', 'CertQuiz');
    const recipients = [new Recipient(email, 'User')];
    logger.info(`Token enviado: ${token}`);
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('CertQuiz - Verificação de e-mail')
      .setHtml(`Ative sua conta CertQuiz. Digite o código quando solicitado: ${token}`);
    await this.mailer.email.send(emailParams);
  }

  async sendResetPasswordEmail(email, token) {
    const sentFrom = new Sender('ioiuoiu.mlsender.net', 'CertQuiz');
    const recipients = [new Recipient(email, 'User')];
    logger.info(`Token enviado: ${token}`);
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('CertQuiz - Redefinição de senha')
      .setHtml(`Digite o código quando solicitado: ${token}`);
    await this.mailer.email.send(emailParams);
  }
}

module.exports = EmailService;