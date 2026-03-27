import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import logger from '../../config/logger';

/**
 * Service for sending emails via Amazon SES.
 */
class EmailService {
  private ses: SESClient;
  private fromAddress: string;

  constructor(options?: { region?: string; fromAddress?: string }) {
    const region = options?.region || process.env.AWS_REGION || 'us-east-1';
    this.fromAddress = options?.fromAddress || process.env.AWS_SES_FROM_ADDRESS || 'certquizz@gmail.com';
    this.ses = new SESClient({ region });
  }

  async sendActivationEmail(email: string, token: string): Promise<void> {
    const subject = 'CertQuiz - Verificação de e-mail';
    const htmlBody = `Ative sua conta CertQuiz. Digite o código quando solicitado: <b>${token}</b>`;
    await this.sendEmail({ to: email, subject, htmlBody });
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const subject = 'CertQuiz - Redefinição de senha';
    const htmlBody = `Digite o código quando solicitado: <b>${token}</b>`;
    await this.sendEmail({ to: email, subject, htmlBody });
  }

  private maskEmail(email: string): string {
    const [localPart = '', domain = ''] = email.split('@');
    if (!localPart || !domain) return '[redacted]';
    const visible = localPart.slice(0, 2);
    return `${visible}${'*'.repeat(Math.max(localPart.length - visible.length, 1))}@${domain}`;
  }

  private async sendEmail({ to, subject, htmlBody }: { to: string; subject: string; htmlBody: string }): Promise<void> {
    const command = new SendEmailCommand({
      Source: this.fromAddress,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: htmlBody, Charset: 'UTF-8' } }
      }
    });

    try {
      const result = await this.ses.send(command);
      logger.info(`Email sent via SES to ${this.maskEmail(to)}. MessageId=${result.MessageId}`);
    } catch (err) {
      logger.error('Failed to send email via SES', { error: err, to: this.maskEmail(to), subject });
      throw err;
    }
  }
}

export default EmailService;
