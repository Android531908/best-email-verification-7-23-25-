// Express.js routes for email validation and verification
const express = require('express');
const rateLimit = require('express-rate-limit');
const { EmailValidationService, EmailVerificationService } = require('./emailValidation');
const { EmailService } = require('./emailService'); // Your email sending service
const router = express.Router();

// Rate limiting for email operations
const emailValidationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many email validation requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

const emailSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 email sends per hour
  message: {
    error: 'Too many verification emails sent, please try again later.',
    code: 'EMAIL_RATE_LIMIT_EXCEEDED'
  }
});

// Middleware for input sanitization
const sanitizeInput = (req, res, next) => {
  if (req.body.email) {
    req.body.email = EmailValidationService.sanitizeEmail(req.body.email);
  }
  next();
};

// Email domain validation endpoint
router.post('/validate-email-domain', emailValidationLimiter, sanitizeInput, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        isValid: false,
        errors: ['Email address is required'],
        code: 'MISSING_EMAIL'
      });
    }

    const validation = await EmailValidationService.validateEmailComplete(email);
    
    res.json({
      isValid: validation.isValid,
      errors: validation.errors || [],
      sanitizedEmail: validation.sanitizedEmail,
      mxRecords: validation.mxRecords || []
    });
  } catch (error) {
    console.error('Email validation error:', error);
    res.status(500).json({
      isValid: false,
      errors: ['Internal server error during email validation'],
      code: 'SERVER_ERROR'
    });
  }
});

// Send verification email endpoint
router.post('/send-verification-email', emailSendLimiter, sanitizeInput, async (req, res) => {
  try {
    const { email, firstName, userId } = req.body;

    if (!email || !firstName || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, firstName, userId',
        code: 'MISSING_FIELDS'
      });
    }

    // Validate email format and domain
    const emailValidation = await EmailValidationService.validateEmailComplete(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address',
        details: emailValidation.errors,
        code: 'INVALID_EMAIL'
      });
    }

    // Create verification record
    const verificationData = await EmailVerificationService.createVerificationRecord(
      userId, 
      emailValidation.sanitizedEmail
    );

    // Send verification email
    const emailData = {
      email: emailValidation.sanitizedEmail,
      firstName,
      verificationToken: verificationData.token,
      expiresAt: verificationData.expiresAt
    };

    const emailSent = await EmailService.sendVerificationEmail(emailData);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email',
        code: 'EMAIL_SEND_FAILED'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully',
      expiresAt: verificationData.expiresAt
    });

  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// Resend verification email endpoint
router.post('/resend-verification-email', emailSendLimiter, sanitizeInput, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required',
        code: 'MISSING_EMAIL'
      });
    }

    // Find user by email (pseudo-code)
    // const user = await db.users.findOne({ 
    //   where: { email: email, emailVerified: false } 
    // });

    // For demo purposes
    const user = {
      id: 'user123',
      firstName: 'John',
      email: email
    };

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found or email already verified',
        code: 'USER_NOT_FOUND'
      });
    }

    // Invalidate old verification tokens
    // await db.emailVerifications.update(
    //   { verified: true },
    //   { where: { userId: user.id, verified: false } }
    // );

    // Create new verification record
    const verificationData = await EmailVerificationService.createVerificationRecord(
      user.id, 
      user.email
    );

    // Send new verification email
    const emailData = {
      email: user.email,
      firstName: user.firstName,
      verificationToken: verificationData.token,
      expiresAt: verificationData.expiresAt
    };

    const emailSent = await EmailService.sendVerificationEmail(emailData);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email',
        code: 'EMAIL_SEND_FAILED'
      });
    }

    res.json({
      success: true,
      message: 'New verification email sent successfully',
      expiresAt: verificationData.expiresAt
    });

  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// Verify email token endpoint
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
        code: 'MISSING_TOKEN'
      });
    }

    // Sanitize token
    const sanitizedToken = token.replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);

    const verificationResult = await EmailVerificationService.verifyEmailToken(sanitizedToken);

    if (!verificationResult.success) {
      const statusCode = verificationResult.code === 'TOKEN_EXPIRED' ? 410 : 400;
      return res.status(statusCode).json(verificationResult);
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
      userId: verificationResult.userId
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during verification',
      code: 'SERVER_ERROR'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'email-verification'
  });
});

module.exports = router;