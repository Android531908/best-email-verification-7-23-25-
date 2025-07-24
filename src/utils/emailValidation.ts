import React from 'react';

// Enhanced Email Validation with Provider Compatibility
export interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  provider?: string;
  normalizedEmail?: string;
}

export interface EmailProviderInfo {
  name: string;
  domains: string[];
  features: {
    plusAddressing: boolean;
    dotIgnoring: boolean;
    caseSensitive: boolean;
    maxLocalLength: number;
  };
  mxRequired: boolean;
}

export class EmailValidator {
  private static readonly MIN_LENGTH = 5;
  private static readonly MAX_LENGTH = 254; // RFC 5321 limit
  private static readonly ALLOWED_SPECIAL_CHARS = /^[a-zA-Z0-9._-]+$/;
  
  // Comprehensive email regex following RFC 5322 standards
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
  
  // Enhanced provider-specific configurations
  private static readonly EMAIL_PROVIDERS: Map<string, EmailProviderInfo> = new Map([
    ['gmail', {
      name: 'Gmail',
      domains: ['gmail.com', 'googlemail.com'],
      features: {
        plusAddressing: true,
        dotIgnoring: true,
        caseSensitive: false,
        maxLocalLength: 64
      },
      mxRequired: true
    }],
    ['outlook', {
      name: 'Microsoft Outlook',
      domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'],
      features: {
        plusAddressing: true,
        dotIgnoring: false,
        caseSensitive: false,
        maxLocalLength: 64
      },
      mxRequired: true
    }],
    ['yahoo', {
      name: 'Yahoo Mail',
      domains: ['yahoo.com', 'yahoo.co.uk', 'yahoo.ca', 'yahoo.com.au', 'ymail.com', 'rocketmail.com'],
      features: {
        plusAddressing: true,
        dotIgnoring: false,
        caseSensitive: false,
        maxLocalLength: 32
      },
      mxRequired: true
    }],
    ['apple', {
      name: 'Apple iCloud',
      domains: ['icloud.com', 'me.com', 'mac.com'],
      features: {
        plusAddressing: true,
        dotIgnoring: false,
        caseSensitive: false,
        maxLocalLength: 64
      },
      mxRequired: true
    }],
    ['protonmail', {
      name: 'ProtonMail',
      domains: ['protonmail.com', 'protonmail.ch', 'pm.me'],
      features: {
        plusAddressing: true,
        dotIgnoring: false,
        caseSensitive: false,
        maxLocalLength: 64
      },
      mxRequired: true
    }]
  ]);
  
  // Common disposable email domains to block
  private static readonly DISPOSABLE_DOMAINS = new Set([
    '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org',
    'throwaway.email', 'temp-mail.org', 'yopmail.com', 'maildrop.cc',
    'sharklasers.com', 'guerrillamailblock.com', 'getnada.com', 'tempail.com',
    'dispostable.com', 'fakeinbox.com', 'mailnesia.com', 'trashmail.com',
    '33mail.com', 'emailondeck.com', 'guerrillamail.org', 'guerrillamail.net'
  ]);

  // Educational domains that require special handling
  private static readonly EDUCATIONAL_DOMAINS = new Set([
    'edu', 'ac.uk', 'edu.au', 'edu.ca', 'ac.in', 'edu.sg'
  ]);

  static getEmailProvider(domain: string): EmailProviderInfo | null {
    const lowerDomain = domain.toLowerCase();
    
    for (const [key, provider] of this.EMAIL_PROVIDERS) {
      if (provider.domains.includes(lowerDomain)) {
        return provider;
      }
    }
    
    return null;
  }

  static normalizeEmail(email: string): string {
    const [localPart, domain] = email.toLowerCase().split('@');
    const provider = this.getEmailProvider(domain);
    
    if (!provider) {
      return email.toLowerCase();
    }
    
    let normalizedLocal = localPart;
    
    // Handle provider-specific normalization
    if (provider.features.plusAddressing) {
      // Remove plus addressing (everything after +)
      normalizedLocal = normalizedLocal.split('+')[0];
    }
    
    if (provider.features.dotIgnoring && domain === 'gmail.com') {
      // Gmail ignores dots in the local part
      normalizedLocal = normalizedLocal.replace(/\./g, '');
    }
    
    return `${normalizedLocal}@${domain}`;
  }

  static validateInternationalDomain(domain: string): { isValid: boolean; punycode?: string; error?: string } {
    try {
      // Check if domain contains non-ASCII characters
      if (!/^[\x00-\x7F]*$/.test(domain)) {
        // For browser compatibility, we'll do basic validation
        // In a real implementation, you'd use a punycode library
        if (domain.includes('xn--')) {
          // Already punycode encoded
          return { isValid: true, punycode: domain };
        }
        
        // Contains international characters but not encoded
        return { 
          isValid: false, 
          error: 'International domain names must be punycode encoded' 
        };
      }
      
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        error: 'Invalid international domain format' 
      };
    }
  }

  static validateEducationalDomain(domain: string): { isValid: boolean; warnings?: string[] } {
    const warnings: string[] = [];
    
    // Check if it's an educational domain
    const isEducational = this.EDUCATIONAL_DOMAINS.has(domain.split('.').pop() || '') ||
                         domain.endsWith('.edu') ||
                         domain.includes('.edu.') ||
                         domain.includes('.ac.');
    
    if (isEducational) {
      warnings.push('Educational email detected - may have additional verification requirements');
    }
    
    return { isValid: true, warnings };
  }

  static validate(email: string): EmailValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check if email is provided
    if (!email || email.trim() === '') {
      errors.push('Email address is required');
      return { isValid: false, errors };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check length constraints
    if (trimmedEmail.length < this.MIN_LENGTH) {
      errors.push(`Email must be at least ${this.MIN_LENGTH} characters long`);
    }
    
    if (trimmedEmail.length > this.MAX_LENGTH) {
      errors.push(`Email must not exceed ${this.MAX_LENGTH} characters`);
    }

    // Check for whitespace
    if (/\s/.test(trimmedEmail)) {
      errors.push('Email address cannot contain whitespace characters');
    }

    // Check for exactly one @ symbol
    const atCount = (trimmedEmail.match(/@/g) || []).length;
    if (atCount === 0) {
      errors.push('Email address must contain an @ symbol');
    } else if (atCount > 1) {
      errors.push('Email address must contain exactly one @ symbol');
    }

    // Check overall email format
    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      errors.push('Please enter a valid email address format');
    }

    // Extract and validate domain
    const parts = trimmedEmail.split('@');
    if (parts.length === 2) {
      const [localPart, domain] = parts;
      
      // Get provider info
      const provider = this.getEmailProvider(domain);
      
      // Validate local part
      if (!localPart || localPart.length === 0) {
        errors.push('Email address must have a username before the @ symbol');
      } else {
        // Provider-specific local part validation
        const maxLocalLength = provider?.features.maxLocalLength || 64;
        if (localPart.length > maxLocalLength) {
          errors.push(`Username part is too long for ${provider?.name || 'this provider'} (max ${maxLocalLength} characters)`);
        }
        
        if (!this.ALLOWED_SPECIAL_CHARS.test(localPart)) {
          errors.push('Email username can only contain letters, numbers, dots, underscores, and hyphens');
        }
      }

      // Validate domain
      if (!domain || domain.length === 0) {
        errors.push('Email address must have a domain after the @ symbol');
      } else if (domain.length > 253) {
        errors.push('Email domain is too long');
      } else {
        // International domain validation
        const intlValidation = this.validateInternationalDomain(domain);
        if (!intlValidation.isValid) {
          errors.push(intlValidation.error || 'Invalid international domain');
        }
        
        // Educational domain validation
        const eduValidation = this.validateEducationalDomain(domain);
        if (eduValidation.warnings) {
          warnings.push(...eduValidation.warnings);
        }
        
        // Check domain structure
        const domainParts = domain.split('.');
        if (domainParts.length < 2) {
          errors.push('Email domain must contain at least one dot (e.g., example.com)');
        } else {
          // Check each domain part
          for (const part of domainParts) {
            if (part.length === 0) {
              errors.push('Email domain cannot have empty parts');
              break;
            }
            if (part.length > 63) {
              errors.push('Email domain parts cannot exceed 63 characters');
              break;
            }
            if (!/^[a-zA-Z0-9-]+$/.test(part)) {
              errors.push('Email domain can only contain letters, numbers, and hyphens');
              break;
            }
            if (part.startsWith('-') || part.endsWith('-')) {
              errors.push('Email domain parts cannot start or end with hyphens');
              break;
            }
          }
          
          // Check top-level domain
          const tld = domainParts[domainParts.length - 1];
          if (tld.length < 2) {
            errors.push('Email domain must have a valid top-level domain (e.g., .com, .org)');
          }
        }

        // Check for disposable email domains
        if (this.DISPOSABLE_DOMAINS.has(domain)) {
          errors.push('Disposable email addresses are not allowed. Please use a permanent email address.');
        }
      }
    }

    // Prepare result
    const result: EmailValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      normalizedEmail: errors.length === 0 ? this.normalizeEmail(trimmedEmail) : undefined
    };

    // Add provider info if valid
    if (result.isValid && parts.length === 2) {
      const provider = this.getEmailProvider(parts[1]);
      if (provider) {
        result.provider = provider.name;
      }
    }

    return result;
  }

  static sanitize(email: string): string {
    // Remove dangerous characters and normalize
    return email
      .trim()
      .toLowerCase()
      .replace(/[<>'"&]/g, '') // Remove potential XSS characters
      .substring(0, this.MAX_LENGTH); // Ensure length limit
  }

  static async validateWithDNS(email: string): Promise<EmailValidationResult> {
    const basicValidation = this.validate(email);
    
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    // For frontend, return basic validation
    // DNS validation should be done on backend
    return {
      ...basicValidation,
      warnings: [
        ...(basicValidation.warnings || []),
        'Domain verification will be performed on the server'
      ]
    };
  }

  // Provider-specific validation methods
  static validateGmail(email: string): EmailValidationResult {
    const result = this.validate(email);
    
    if (result.isValid && email.includes('@gmail.com')) {
      // Gmail-specific validations
      const localPart = email.split('@')[0];
      
      // Check for consecutive dots
      if (localPart.includes('..')) {
        result.errors.push('Gmail addresses cannot contain consecutive dots');
        result.isValid = false;
      }
      
      // Check for dots at start/end
      if (localPart.startsWith('.') || localPart.endsWith('.')) {
        result.errors.push('Gmail addresses cannot start or end with dots');
        result.isValid = false;
      }
    }
    
    return result;
  }

  static validateOutlook(email: string): EmailValidationResult {
    const result = this.validate(email);
    
    if (result.isValid && (email.includes('@outlook.com') || email.includes('@hotmail.com'))) {
      // Outlook-specific validations
      const localPart = email.split('@')[0];
      
      // Outlook has stricter rules about consecutive special characters
      if (/[._-]{2,}/.test(localPart)) {
        result.warnings = result.warnings || [];
        result.warnings.push('Outlook may not accept consecutive special characters');
      }
    }
    
    return result;
  }
}

// Enhanced real-time email validation hook
export const useEmailValidation = (email: string, validateOnChange: boolean = true) => {
  const [validation, setValidation] = React.useState<EmailValidationResult>({ isValid: true, errors: [] });
  const [isValidating, setIsValidating] = React.useState(false);

  React.useEffect(() => {
    if (!validateOnChange || !email) {
      setValidation({ isValid: true, errors: [] });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      
      // Determine validation method based on provider
      let result: EmailValidationResult;
      
      if (email.includes('@gmail.com')) {
        result = EmailValidator.validateGmail(email);
      } else if (email.includes('@outlook.com') || email.includes('@hotmail.com')) {
        result = EmailValidator.validateOutlook(email);
      } else {
        result = await EmailValidator.validateWithDNS(email);
      }
      
      setValidation(result);
      setIsValidating(false);
    }, 500); // Debounce validation

    return () => clearTimeout(timeoutId);
  }, [email, validateOnChange]);

  return { validation, isValidating };
};

// Utility functions for different email providers
export const EmailProviderUtils = {
  // Check if email is from a major provider
  isMajorProvider: (email: string): boolean => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    
    const majorDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com'];
    return majorDomains.includes(domain);
  },
  
  // Get provider-specific help text
  getProviderHelpText: (email: string): string | null => {
    const domain = email.split('@')[1]?.toLowerCase();
    
    switch (domain) {
      case 'gmail.com':
        return 'Gmail tip: Dots in your email address are ignored, and you can use + for filtering';
      case 'outlook.com':
      case 'hotmail.com':
        return 'Outlook tip: You can create aliases to organize your email';
      case 'yahoo.com':
        return 'Yahoo tip: Use disposable addresses to protect your main inbox';
      default:
        return null;
    }
  },
  
  // Check if provider supports specific features
  supportsFeature: (email: string, feature: keyof EmailProviderInfo['features']): boolean => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    
    const provider = EmailValidator.getEmailProvider(domain);
    return provider?.features[feature] || false;
  }
};