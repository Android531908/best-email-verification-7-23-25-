// Mock Email Service for Development
// This service simulates email sending without requiring actual email provider configuration

class MockEmailService {
  static async sendVerificationEmail(emailData) {
    const { email, firstName, verificationToken, expiresAt } = emailData;
    
    try {
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the email details for development purposes
      console.log('=== MOCK EMAIL SENT ===');
      console.log(`To: ${email}`);
      console.log(`Subject: Verify Your Email Address - Welcome to Curio Tutors!`);
      console.log(`Verification URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${verificationToken}`);
      console.log(`Expires: ${new Date(expiresAt).toLocaleString()}`);
      console.log('========================');
      
      // Always return success for mock service
      return true;
    } catch (error) {
      console.error('Mock email service error:', error);
      return false;
    }
  }

  static generateHTMLTemplate(firstName, verificationUrl, expiresAt) {
    // Return a simple template for development
    return `
      <h1>Welcome to Curio Tutors, ${firstName}!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link expires on ${new Date(expiresAt).toLocaleString()}</p>
    `;
  }

  static generateTextTemplate(firstName, verificationUrl, expiresAt) {
    return `
Welcome to Curio Tutors, ${firstName}!

Please verify your email by visiting: ${verificationUrl}

This link expires on ${new Date(expiresAt).toLocaleString()}
    `;
  }
}

module.exports = { MockEmailService };