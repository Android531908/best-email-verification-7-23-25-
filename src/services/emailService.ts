// Email Service for handling verification and communication
export interface VerificationEmailData {
  email: string;
  firstName: string;
  verificationToken: string;
  expiresAt: Date;
}

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export class EmailService {
  private static readonly API_BASE_URL = '/api';

  static async sendVerificationEmail(data: VerificationEmailData): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  static async resendVerificationEmail(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/resend-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      return false;
    }
  }

  static generateVerificationEmailTemplate(data: VerificationEmailData): EmailTemplate {
    const verificationUrl = `${window.location.origin}/verify?token=${data.verificationToken}`;
    const expiryTime = data.expiresAt.toLocaleString();

    const htmlContent = `
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
          .content {
            margin: 30px 0;
          }
          .greeting {
            font-size: 18px;
            color: #2D4A22;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            color: #555;
            margin-bottom: 30px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #4A7C59 0%, #2D4A22 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 18px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 6px 16px rgba(0,0,0,0.25);
          }
          .cta-button:hover {
            background: linear-gradient(135deg, #5A8C69 0%, #3D5A32 100%);
          }
          .alternative-link {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 14px;
          }
          .expiry-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
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
            <p class="greeting">Hello ${data.firstName},</p>
            
            <p class="message">
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
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <div class="alternative-link">${verificationUrl}</div>
            
            <div class="security-notice">
              <strong>🔒 Security Notice:</strong> If you didn't create an account with Curio Tutors, 
              please ignore this email. Your email address will not be added to our system.
            </div>
            
            <p>
              Once verified, you'll be able to:
              <ul>
                <li>Access personalized tutoring sessions</li>
                <li>Connect with expert tutors</li>
                <li>Track your learning progress</li>
                <li>Join our community of learners</li>
              </ul>
            </p>
            
            <p>
              If you have any questions or need assistance, please don't hesitate to 
              <a href="mailto:support@curiotutors.com" style="color: #4A7C59;">contact our support team</a>.
            </p>
          </div>
          
          <div class="footer">
            <p>
              <strong>Curio Tutors</strong><br>
              Where Learning Comes to Life<br>
              <a href="mailto:support@curiotutors.com" style="color: #4A7C59;">support@curiotutors.com</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #999;">
              This email was sent to ${data.email}. If you no longer wish to receive these emails, 
              you can <a href="#" style="color: #999;">unsubscribe here</a>.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Curio Tutors - Email Verification
      
      Hello ${data.firstName},
      
      Welcome to Curio Tutors! We're excited to have you join our learning community.
      
      To complete your registration and start your learning journey, please verify your email address by clicking the link below:
      
      ${verificationUrl}
      
      IMPORTANT: This verification link will expire on ${expiryTime}. Please verify your email within 24 hours of registration.
      
      If you didn't create an account with Curio Tutors, please ignore this email.
      
      Once verified, you'll be able to:
      - Access personalized tutoring sessions
      - Connect with expert tutors
      - Track your learning progress
      - Join our community of learners
      
      If you have any questions or need assistance, please contact our support team at support@curiotutors.com.
      
      Best regards,
      The Curio Tutors Team
      
      ---
      Curio Tutors - Where Learning Comes to Life
      support@curiotutors.com
    `;

    return {
      subject: 'Verify Your Email Address - Welcome to Curio Tutors!',
      htmlContent,
      textContent
    };
  }
}