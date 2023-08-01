import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendForgotPasswordEmail(options: { message: string; to: string }) {
    const { message, to } = options;

    const fromName = this.configService.get<string>('SMTP_FROM_NAME');
    const fromEmail = this.configService.get<string>('SMTP_FROM_EMAIL');

    const mailOptions: Mail.Options = {
      from: `${fromName} > ${fromEmail}`,
      to,
      subject: 'Tourism Recommendation -> Password Recovery Email.',
      text: message,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
