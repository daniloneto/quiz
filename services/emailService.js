const { SendEmailCommand } = require('@aws-sdk/client-ses');
const sesClient = require('../config/sesConfig');
const logger = require('../config/logger');

async function sendActivationEmail (email, token) {
  const params = {
    Source: 'naoresponda@certquiz.com.br',
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Subject: {
        Data: 'CertQuiz - Verificação de e-mail'
      },
      Body: {
        Html: {
          Data: `Ative sua conta CertQuiz. Digite o código quando solicitado: ${token}`
        }
      }
    }
  };

  try {
    const command = new SendEmailCommand(params);
    const data = await sesClient.send(command);
    logger.info(`Email de ativação enviado com sucesso: ${data.MessageId}`);
  } catch (err) {
    logger.error('Erro ao enviar email de ativação:', err);
  }
}

async function sendResetPasswordEmail (email, token) {
  const params = {
    Source: 'naoresponda@certquiz.com.br',
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Subject: {
        Data: 'CertQuiz - Redefinição de senha'
      },
      Body: {
        Html: {
          Data: `Digite o código quando solicitado: ${token}`
        }
      }
    }
  };

  try {
    const command = new SendEmailCommand(params);
    const data = await sesClient.send(command);
    logger.info(`Email de redefinição de senha enviado com sucesso: ${data.MessageId}`);
  } catch (err) {
    logger.error('Erro ao enviar email de redefinição de senha:', err);
  }
}

module.exports = {
  sendActivationEmail,
  sendResetPasswordEmail
};