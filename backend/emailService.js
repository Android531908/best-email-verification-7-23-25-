// Backend Email Service using SendGrid (can be adapted for other providers)
const sgMail = require('@sendgrid/mail');
const AWS = require('aws-sdk'); // For AWS SES alternative
const { MockEmailService } = require('./mockEmailService');

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Configure AWS SES (alternative)
const ses = new AWS.SES({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

class EmailService {
  static async sendVerificationEmail(emailData) {
    const { email, firstName, verificationToken, expiresAt } = emailData;
    
    try {
      // Choose email provider based on configuration
      if (process.env.EMAIL_PROVIDER === 'sendgrid') {
        return await this.sendWithSendGrid(emailData);
      } else if (process.env.EMAIL_PROVIDER === 'aws-ses') {
        return await this.sendWithAWSSES(emailData);
      } else {
        // Use mock service for development when no provider is configured
        console.log('No email provider configured, using mock service for development');
        return await MockEmailService.sendVerificationEmail(emailData);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      // Fallback to mock service if configured provider fails
      console.log('Email provider failed, falling back to mock service');
      return await MockEmailService.sendVerificationEmail(emailData);
    }
  }

  static async sendWithSendGrid(emailData) {
    const { email, firstName, verificationToken, expiresAt } = emailData;
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;
    
    const msg = {
      to: email,
      from: {
        email: process.env.FROM_EMAIL || 'noreply@curiotutors.com',
        name: 'Curio Tutors'
      },
      subject: 'Verify Your Email Address - Welcome to Curio Tutors!',
      html: this.generateHTMLTemplate(firstName, verificationUrl, expiresAt),
      text: this.generateTextTemplate(firstName, verificationUrl, expiresAt),
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: false
        },
        openTracking: {
          enable: true
        }
      },
      mailSettings: {
        sandboxMode: {
          enable: process.env.NODE_ENV !== 'production'
        }
      }
    };

    try {
      await sgMail.send(msg);
      console.log(`Verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('SendGrid error:', error);
      if (error.response) {
        console.error('SendGrid response:', error.response.body);
      }
      return false;
    }
  }

  static async sendWithAWSSES(emailData) {
    const { email, firstName, verificationToken, expiresAt } = emailData;
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;
    
    const params = {
      Source: process.env.FROM_EMAIL || 'noreply@curiotutors.com',
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Subject: {
          Data: 'Verify Your Email Address - Welcome to Curio Tutors!',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: this.generateHTMLTemplate(firstName, verificationUrl, expiresAt),
            Charset: 'UTF-8'
          },
          Text: {
            Data: this.generateTextTemplate(firstName, verificationUrl, expiresAt),
            Charset: 'UTF-8'
          }
        }
      },
      Tags: [
        {
          Name: 'EmailType',
          Value: 'EmailVerification'
        }
      ]
    };

    try {
      const result = await ses.sendEmail(params).promise();
      console.log(`Verification email sent to ${email}, MessageId: ${result.MessageId}`);
      return true;
    } catch (error) {
      console.error('AWS SES error:', error);
      return false;
    }
  }

  static generateHTMLTemplate(firstName, verificationUrl, expiresAt) {
    const expiryTime = new Date(expiresAt).toLocaleString();
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Curio Tutors</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #F5E6B8 0%, #E6A532 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #2D4A22;
          }
          .title {
            color: #2D4A22;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
          }
          .subtitle {
            color: #8B4513;
            font-size: 18px;
            margin: 10px 0 0 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #4A7C59 0%, #2D4A22 100%);
            color: white !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 18px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 6px 16px rgba(0,0,0,0.25);
          }
          .expiry-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
          .security-notice {
            background-color: #e7f3ff;
            border: 1px solid #b3d9ff;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #0066cc;
            font-size: 14px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">CT</div>
            <h1 class="title">Curio Tutors</h1>
            <p class="subtitle">Where Learning Comes to Life</p>
          </div>
          
          <div class="content">
            <p style="font-size: 18px; color: #2D4A22; margin-bottom: 20px;">Hello ${firstName},</p>
            
            <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
              Welcome to Curio Tutors! We're excited to have you join our learning community. 
              To complete your registration and start your learning journey, please verify your email address.
            </p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="cta-button">Verify My Email Address</a>
            </div>
            
            <div class="expiry-notice">
              <strong>⏰ Important:</strong> This verification link will expire on ${expiryTime}. 
              Please verify your email within 24 hours of registration.
            </div>
            
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin: 20px 0; word-break: break-all; font-family: monospace; font-size: 14px;">
              ${verificationUrl}
            </div>
            
            <div class="security-notice">
              <strong>🔒 Security Notice:</strong> If you didn't create an account with Curio Tutors, 
              please ignore this email. Your email address will not be added to our system.
            </div>
          </div>
          
          <div class="footer">
            <p>
              <strong>Curio Tutors</strong><br>
              Where Learning Comes to Life<br>
              <a href="mailto:support@curiotutors.com" style="color: #4A7C59;">support@curiotutors.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static generateTextTemplate(firstName, verificationUrl, expiresAt) {
    const expiryTime = new Date(expiresAt).toLocaleString();
    
    return `
Curio Tutors - Email Verification

Hello ${firstName},

Welcome to Curio Tutors! We're excited to have you join our learning community.

To complete your registration and start your learning journey, please verify your email address by clicking the link below:

${verificationUrl}

IMPORTANT: This verification link will expire on ${expiryTime}. Please verify your email within 24 hours of registration.

If you didn't create an account with Curio Tutors, please ignore this email.

If you have any questions or need assistance, please contact our support team at support@curiotutors.com.

Best regards,
The Curio Tutors Team

---
Curio Tutors - Where Learning Comes to Life
support@curiotutors.com
    `;
  }
}

module.exports = { EmailService };