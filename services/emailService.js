const { MailerSend, EmailParams, Recipient, Sender } = require('mailersend');

async function sendActivationEmail (email, token) {
  const mailersend = new MailerSend({ apiKey: process.env.MAILSEND_KEY });
  const sentFrom = new Sender('MS_InzujB@trial-0p7kx4xpqdvl9yjr.mlsender.net', 'CertQuiz');
  const recipients = [new Recipient(email, 'User')];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('CertQuiz - Verificação de e-mail')
    .setHtml(`Ative sua conta CertQuiz agora: <a href="${process.env.ORIGIN_URL}/api/v1/auth/confirm-email?token=${token}">${process.env.ORIGIN_URL}/confirm-email?token=${token}</a>`);

  await mailersend.email.send(emailParams);
}

async function sendResetPasswordEmail (email, token) {
  const mailersend = new MailerSend({ apiKey: process.env.MAILSEND_KEY });
  const sentFrom = new Sender('MS_InzujB@trial-0p7kx4xpqdvl9yjr.mlsender.net', 'CertQuiz');
  const recipients = [new Recipient(email, 'User')];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('CertQuiz - Redefinição de senha')
    .setHtml(`Clique no link para redefinir sua senha: <a href="${process.env.ORIGIN_URL}/reset.html?token=${token}">Redefinir Senha</a>`);

  await mailersend.email.send(emailParams);
}

module.exports = {
  sendActivationEmail,
  sendResetPasswordEmail,
};
