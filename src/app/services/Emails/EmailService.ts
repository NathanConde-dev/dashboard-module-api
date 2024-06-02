import { MailService } from '@sendgrid/mail';

export class EmailService {
    private readonly sendgridApiKey: string;

    constructor(sendgridApiKey: string) {
        this.sendgridApiKey = sendgridApiKey;
    }

    public async sendEmailWithTemplate(to: string, templateId: string, dynamicTemplateData: Record<string, any>): Promise<void> {
        try {
            const mailService = new MailService();
            mailService.setApiKey(this.sendgridApiKey);

            const msg = {
                to,
                from: 'your@example.com', // Use o email cadastrado no SendGrid
                templateId,
                dynamicTemplateData,
            };

            await mailService.send(msg);
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Error sending email.');
        }
    }
}
