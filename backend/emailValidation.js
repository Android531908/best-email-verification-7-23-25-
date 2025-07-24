// Backend Email Validation (Node.js/Express)
const dns = require('dns').promises;
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Disposable email domains list (expanded)
const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org',
  'throwaway.email', 'temp-mail.org', 'yopmail.com', 'maildrop.cc',
  'sharklasers.com', 'guerrillamailblock.com', 'getnada.com', 'tempail.com',
  'dispostable.com', 'fakeinbox.com', 'mailnesia.com', 'trashmail.com',
  '33mail.com', 'emailondeck.com', 'guerrillamail.org', 'guerrillamail.net',
  'guerrillamail.biz', 'spam4.me', 'grr.la', 'guerrillamail.de'
]);

class EmailValidationService {
  static validateEmailFormat(email) {
    const errors = [];
    
    if (!email || typeof email !== 'string') {
      errors.push('Email address is required');
      return { isValid: false, errors };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Length validation
    if (trimmedEmail.length < 5) {
      errors.push('Email must be at least 5 characters long');
    }
    if (trimmedEmail.length > 254) {
      errors.push('Email must not exceed 254 characters');
    }

    // Whitespace check
    if (/\s/.test(trimmedEmail)) {
      errors.push('Email address cannot contain whitespace characters');
    }

    // @ symbol validation
    const atCount = (trimmedEmail.match(/@/g) || []).length;
    if (atCount !== 1) {
      errors.push('Email address must contain exactly one @ symbol');
    }

    // RFC 5322 compliant regex
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(trimmedEmail)) {
      errors.push('Invalid email address format');
    }

    // Domain validation
    const parts = trimmedEmail.split('@');
    if (parts.length === 2) {
      const [localPart, domain] = parts;
      
      if (localPart.length > 64) {
        errors.push('Email username part is too long (max 64 characters)');
      }
      
      if (domain.length > 253) {
        errors.push('Email domain is too long');
      }

      // Check for disposable domains
      if (DISPOSABLE_DOMAINS.has(domain)) {
        errors.push('Disposable email addresses are not allowed');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedEmail: this.sanitizeEmail(trimmedEmail)
    };
  }

  static sanitizeEmail(email) {
    return email
      .trim()
      .toLowerCase()
      .replace(/[<>'"&]/g, '') // Remove XSS characters
      .substring(0, 254); // Ensure length limit
  }

  static async validateDomainMX(domain) {
    try {
      const mxRecords = await dns.resolveMx(domain);
      return {
        isValid: mxRecords && mxRecords.length > 0,
        mxRecords: mxRecords || []
      };
    } catch (error) {
      console.error(`MX lookup failed for domain ${domain}:`, error.message);
      return {
        isValid: false,
        error: 'Domain does not exist or has no mail servers'
      };
    }
  }

  static async validateEmailComplete(email) {
    // Basic format validation
    const formatValidation = this.validateEmailFormat(email);
    if (!formatValidation.isValid) {
      return formatValidation;
    }

    // Extract domain for MX validation
    const domain = formatValidation.sanitizedEmail.split('@')[1];
    
    // MX record validation
    const mxValidation = await this.validateDomainMX(domain);
    if (!mxValidation.isValid) {
      return {
        isValid: false,
        errors: [...formatValidation.errors, mxValidation.error || 'Invalid email domain'],
        sanitizedEmail: formatValidation.sanitizedEmail
      };
    }

    return {
      isValid: true,
      errors: [],
      sanitizedEmail: formatValidation.sanitizedEmail,
      mxRecords: mxValidation.mxRecords
    };
  }
}

class EmailVerificationService {
  static generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static async hashToken(token) {
    const saltRounds = 12;
    return await bcrypt.hash(token, saltRounds);
  }

  static async verifyToken(token, hashedToken) {
    return await bcrypt.compare(token, hashedToken);
  }

  static generateTokenExpiry() {
    const now = new Date();
    return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
  }

  static isTokenExpired(expiryDate) {
    return new Date() > new Date(expiryDate);
  }

  static async createVerificationRecord(userId, email) {
    const token = this.generateVerificationToken();
    const hashedToken = await this.hashToken(token);
    const expiresAt = this.generateTokenExpiry();

    // Store in database (pseudo-code - adapt to your database)
    const verificationRecord = {
      userId,
      email,
      token: hashedToken,
      expiresAt,
      createdAt: new Date(),
      verified: false
    };

    // await db.emailVerifications.create(verificationRecord);

    return {
      token, // Return unhashed token for email
      expiresAt
    };
  }

  static async verifyEmailToken(token) {
    try {
      // Find verification record (pseudo-code)
      // const record = await db.emailVerifications.findOne({ 
      //   where: { verified: false } 
      // });

      // For demo purposes, simulating database lookup
      const record = {
        token: '$2b$12$hashedTokenExample', // This would be the hashed token from DB
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
        userId: 'user123',
        email: 'user@example.com'
      };

      if (!record) {
        return {
          success: false,
          error: 'Invalid verification token',
          code: 'INVALID_TOKEN'
        };
      }

      if (this.isTokenExpired(record.expiresAt)) {
        return {
          success: false,
          error: 'Verification token has expired',
          code: 'TOKEN_EXPIRED',
          expired: true
        };
      }

      const isValidToken = await this.verifyToken(token, record.token);
      if (!isValidToken) {
        return {
          success: false,
          error: 'Invalid verification token',
          code: 'INVALID_TOKEN'
        };
      }

      // Update user and verification records
      // await db.users.update(
      //   { emailVerified: true, emailVerifiedAt: new Date() },
      //   { where: { id: record.userId } }
      // );
      // 
      // await db.emailVerifications.update(
      //   { verified: true, verifiedAt: new Date() },
      //   { where: { id: record.id } }
      // );

      return {
        success: true,
        userId: record.userId,
        email: record.email
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: 'Internal server error during verification',
        code: 'SERVER_ERROR'
      };
    }
  }
}

module.exports = {
  EmailValidationService,
  EmailVerificationService
};