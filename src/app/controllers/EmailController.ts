import { Request, Response } from 'express';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendTestEmail = async (req: Request, res: Response): Promise<Response> => {
  const msg = {
    to: 'test@example.com', // Change to your recipient
    from: process.env.SENDGRID_FROM_EMAIL!, // Change to your verified sender
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent');
    return res.status(200).send({ message: 'Email sent successfully' });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const sendGridError = error as any; // Casting to any to access error.response.body
      console.error('Error sending email:', sendGridError.response.body);
      return res.status(500).send({ message: 'Error sending email', error: sendGridError.response.body });
    } else if (error instanceof Error) {
      console.error('Error sending email:', error.message);
      return res.status(500).send({ message: 'Error sending email', error: error.message });
    } else {
      console.error('Unknown error sending email:', error);
      return res.status(500).send({ message: 'Unknown error sending email' });
    }
  }
};
