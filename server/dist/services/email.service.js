"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendInvitationEmail = void 0;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const sendInvitationEmail = async (data) => {
    const { to, projectName, inviterName, invitationLink, expiresAt } = data;
    const expirationDate = new Date(expiresAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    try {
        const { data: emailData, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
            to: [to],
            subject: `You've been invited to join ${projectName} on AsyncFlow`,
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">AsyncFlow</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">You've been invited!</h2>
                            
                            <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Hello <strong>${to}</strong>,
                            </p>

                            <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                <strong>${inviterName}</strong> has invited you to join the project <strong>${projectName}</strong> on AsyncFlow.
                            </p>
                            
                            <p style="margin: 0 0 32px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                AsyncFlow is a project management platform where written communication is the primary driver of progress. Join the team to collaborate on tasks, share updates, and leverage AI-powered insights.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 0 0 32px;">
                                        <a href="${invitationLink}" 
                                           style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                                            Accept Invitation
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 16px; color: #718096; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0 0 32px; color: #667eea; font-size: 14px; word-break: break-all;">
                                ${invitationLink}
                            </p>
                            
                            <!-- Expiration Notice -->
                            <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                    ⏰ This invitation expires on <strong>${expirationDate}</strong>
                                </p>
                            </div>
                            
                            <p style="margin: 0; color: #a0aec0; font-size: 13px; line-height: 1.6;">
                                If you didn't expect this invitation, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.6;">
                                © ${new Date().getFullYear()} AsyncFlow. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        });
        if (error) {
            console.error('Error sending invitation email:', error);
            throw error;
        }
        console.log('Invitation email sent successfully:', emailData);
        return emailData;
    }
    catch (error) {
        console.error('Failed to send invitation email:', error);
        throw error;
    }
};
exports.sendInvitationEmail = sendInvitationEmail;
const sendPasswordResetEmail = async (data) => {
    const { to, resetLink } = data;
    try {
        const { data: emailData, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
            to: [to],
            subject: 'Reset your AsyncFlow password',
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">AsyncFlow</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                            
                            <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Hello,
                            </p>

                            <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                We received a request to reset your password for your AsyncFlow account. If you didn't make this request, you can safely ignore this email.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 24px 0 32px;">
                                        <a href="${resetLink}" 
                                           style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 16px; color: #718096; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0 0 32px; color: #667eea; font-size: 14px; word-break: break-all;">
                                ${resetLink}
                            </p>
                            
                            <p style="margin: 0; color: #a0aec0; font-size: 13px; line-height: 1.6;">
                                This link will expire in 1 hour.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.6;">
                                © ${new Date().getFullYear()} AsyncFlow. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        });
        if (error) {
            console.error('Error sending password reset email:', error);
            throw error;
        }
        console.log('Password reset email sent successfully:', emailData);
        return emailData;
    }
    catch (error) {
        console.error('Failed to send password reset email:', error);
        throw error;
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
