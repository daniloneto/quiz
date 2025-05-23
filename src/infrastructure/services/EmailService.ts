import { MailerSend, Sender, Recipient, EmailParams } from 'mailersend';
import logger from '../../config/logger';

/**
 * Service for sending emails via MailerSend.
 */
class EmailService {
  /**
   * @param apiKey Optional API key for MailerSend; falls back to env var.
   */
  private mailer: MailerSend;

  constructor(apiKey?: string) {
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

export default EmailService;