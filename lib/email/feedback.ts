import { Resend } from 'resend';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

let resend: Resend;
function getResend() {
  if (!resend) {
    resend = new Resend(env.RESEND_API_KEY);
  }
  return resend;
}

interface FeedbackEmailParams {
  userName: string;
  userEmail: string;
  message: string;
}

export async function sendFeedbackEmail({ userName, userEmail, message }: FeedbackEmailParams) {
  const to = env.FEEDBACK_EMAIL_TO;
  if (!to) {
    throw new Error('FEEDBACK_EMAIL_TO environment variable is not set');
  }

  // Strip newlines/carriage returns to prevent email header injection
  const safeName = userName.replace(/[\r\n]/g, '').slice(0, 100);

  logger.info('email/feedback', 'Sending feedback email', { userName: safeName });

  const sendStart = Date.now();
  const { error } = await getResend().emails.send({
    from: 'MyPaperPop <onboarding@resend.dev>',
    to,
    subject: `[MyPaperPop Feedback] from ${safeName}`,
    text: `Feedback from ${safeName} (${userEmail}):\n\n${message}`,
    replyTo: userEmail,
  });
  const sendDuration = Date.now() - sendStart;

  if (error) {
    logger.error('email/feedback', 'Failed to send feedback email', {
      userName,
      userEmail,
      duration: sendDuration,
      resendError: error.message,
      resendStatusCode: error.statusCode,
    });
    throw new Error(`Failed to send feedback email: ${error.message}`);
  }

  logger.info('email/feedback', 'Feedback email sent', { duration: sendDuration });
}
