import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendInvitation(email: string, token: string, firstName?: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const link = `${frontendUrl}/set-password?token=${token}`;
    const name = firstName || 'là';

    await this.resend.emails.send({
      from: 'Portail Client - Valentin Vinel <noreply@valentin-vinel.fr>',
      to: email,
      subject: 'Bienvenue sur votre portail client',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #111827; font-size: 24px; font-weight: 600;">Bienvenue ${name} 👋</h1>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Votre espace client a été créé. Cliquez sur le bouton ci-dessous pour définir votre mot de passe et accéder à vos projets.
          </p>
          <a href="${link}" style="display: inline-block; margin: 24px 0; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
            Activer mon compte
          </a>
          <p style="color: #9ca3af; font-size: 13px;">
            Ce lien expire dans 48 heures. Si vous n'attendiez pas cet email, vous pouvez l'ignorer.
          </p>
        </div>
      `,
    });
  }
}