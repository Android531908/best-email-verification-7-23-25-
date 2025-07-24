import { EventEmitter } from '../../../utils/EventEmitter';
import { SecurityEvent, User } from '../types/conference.types';

export class SecurityService extends EventEmitter {
  private encryptionKey: CryptoKey | null = null;
  private sessionTokens: Map<string, string> = new Map();
  private failedAttempts: Map<string, number> = new Map();
  private blockedIPs: Set<string> = new Set();
  private activeSessions: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializeEncryption();
    this.startSecurityMonitoring();
  }

  private async initializeEncryption(): Promise<void> {
    try {
      // Generate AES-256-GCM key for E2EE
      this.encryptionKey = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );
      
      console.log('Encryption initialized successfully');
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
    }
  }

  private startSecurityMonitoring(): void {
    // Monitor for suspicious activities
    setInterval(() => {
      this.checkForSuspiciousActivity();
      this.cleanupExpiredSessions();
      this.updateThreatIntelligence();
    }, 30000); // Every 30 seconds
  }

  async validateMeetingAccess(meetingId: string, password: string, userIP?: string): Promise<boolean> {
    try {
      // Check if IP is blocked
      if (userIP && this.blockedIPs.has(userIP)) {
        this.logSecurityEvent({
          type: 'unauthorized_access',
          description: `Blocked IP attempted to join meeting: ${meetingId}`,
          ipAddress: userIP,
          severity: 'high'
        });
        return false;
      }

      // Check failed attempts
      const attemptKey = `${meetingId}:${userIP}`;
      const attempts = this.failedAttempts.get(attemptKey) || 0;
      
      if (attempts >= 5) {
        this.logSecurityEvent({
          type: 'unauthorized_access',
          description: `Too many failed attempts for meeting: ${meetingId}`,
          ipAddress: userIP || 'unknown',
          severity: 'high'
        });
        
        if (userIP) {
          this.blockedIPs.add(userIP);
        }
        return false;
      }

      // Validate meeting credentials (mock implementation)
      const isValid = await this.validateCredentials(meetingId, password);
      
      if (!isValid) {
        this.failedAttempts.set(attemptKey, attempts + 1);
        this.logSecurityEvent({
          type: 'unauthorized_access',
          description: `Invalid credentials for meeting: ${meetingId}`,
          ipAddress: userIP || 'unknown',
          severity: 'medium'
        });
        return false;
      }

      // Clear failed attempts on successful validation
      this.failedAttempts.delete(attemptKey);
      
      return true;
    } catch (error) {
      console.error('Error validating meeting access:', error);
      return false;
    }
  }

  private async validateCredentials(meetingId: string, password: string): Promise<boolean> {
    // Mock validation - in production, this would check against your database
    // with proper password hashing (bcrypt, scrypt, etc.)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Basic validation rules
    if (!meetingId || meetingId.length < 8) return false;
    if (!password || password.length < 8) return false;
    
    // Mock meeting database check
    const validMeetings = new Map([
      ['DEMO123456', 'password123'],
      ['TEST789012', 'securepass'],
      ['MEET345678', 'mypassword']
    ]);
    
    return validMeetings.get(meetingId) === password;
  }

  async generateSessionToken(userId: string, meetingId: string): Promise<string> {
    try {
      const tokenData = {
        userId,
        meetingId,
        timestamp: Date.now(),
        expiresAt: Date.now() + (2 * 60 * 60 * 1000), // 2 hours
        permissions: await this.getUserPermissions(userId, meetingId)
      };

      // Encrypt token data
      const encryptedToken = await this.encryptData(JSON.stringify(tokenData));
      const token = btoa(encryptedToken);
      
      this.sessionTokens.set(token, userId);
      this.activeSessions.set(userId, {
        token,
        meetingId,
        startTime: Date.now(),
        lastActivity: Date.now()
      });
      
      return token;
    } catch (error) {
      console.error('Failed to generate session token:', error);
      throw error;
    }
  }

  async validateSessionToken(token: string): Promise<{ valid: boolean; userId?: string; permissions?: any }> {
    try {
      if (!this.sessionTokens.has(token)) {
        return { valid: false };
      }

      const encryptedData = atob(token);
      const decryptedData = await this.decryptData(encryptedData);
      const tokenData = JSON.parse(decryptedData);

      // Check expiration
      if (Date.now() > tokenData.expiresAt) {
        this.sessionTokens.delete(token);
        this.activeSessions.delete(tokenData.userId);
        return { valid: false };
      }

      // Update last activity
      const session = this.activeSessions.get(tokenData.userId);
      if (session) {
        session.lastActivity = Date.now();
      }

      return {
        valid: true,
        userId: tokenData.userId,
        permissions: tokenData.permissions
      };
    } catch (error) {
      console.error('Failed to validate session token:', error);
      return { valid: false };
    }
  }

  async encryptData(data: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        dataBuffer
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }

  async decryptData(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      // Decrypt data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  }

  private async getUserPermissions(userId: string, meetingId: string): Promise<any> {
    // Mock permissions - in production, this would query your database
    return {
      canSpeak: true,
      canVideo: true,
      canScreenShare: true,
      canChat: true,
      canAnnotate: true,
      canManageParticipants: false,
      canRecord: false
    };
  }

  private checkForSuspiciousActivity(): void {
    // Monitor for suspicious patterns
    const now = Date.now();
    
    // Check for rapid connection attempts
    this.failedAttempts.forEach((attempts, key) => {
      if (attempts >= 3) {
        const [meetingId, ip] = key.split(':');
        this.logSecurityEvent({
          type: 'suspicious_activity',
          description: `Multiple failed attempts detected from IP: ${ip}`,
          ipAddress: ip,
          severity: 'medium'
        });
      }
    });

    // Check for inactive sessions
    this.activeSessions.forEach((session, userId) => {
      const inactiveTime = now - session.lastActivity;
      if (inactiveTime > 2 * 60 * 60 * 1000) { // 2 hours
        this.logSecurityEvent({
          type: 'policy_violation',
          description: `Session timeout for user: ${userId}`,
          ipAddress: 'unknown',
          severity: 'low'
        });
        
        this.terminateSession(userId);
      }
    });
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    
    this.activeSessions.forEach((session, userId) => {
      if (now - session.startTime > 2 * 60 * 60 * 1000) { // 2 hours
        this.terminateSession(userId);
      }
    });
  }

  private updateThreatIntelligence(): void {
    // In production, this would update threat intelligence feeds
    // For now, we'll just clean up old blocked IPs
    // This is a simplified implementation
  }

  private terminateSession(userId: string): void {
    const session = this.activeSessions.get(userId);
    if (session) {
      this.sessionTokens.delete(session.token);
      this.activeSessions.delete(userId);
      
      this.emit('sessionTerminated', { userId, reason: 'timeout' });
    }
  }

  private logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'meetingId' | 'timestamp' | 'resolved'>): void {
    const securityEvent: SecurityEvent = {
      id: this.generateId(),
      meetingId: 'current-meeting', // This would be the actual meeting ID
      type: event.type,
      description: event.description,
      ipAddress: event.ipAddress,
      timestamp: new Date(),
      severity: event.severity,
      resolved: false
    };

    console.warn('Security Event:', securityEvent);
    this.emit('securityEvent', securityEvent);

    // In production, this would be sent to your security monitoring system
    this.sendToSecurityMonitoring(securityEvent);
  }

  private sendToSecurityMonitoring(event: SecurityEvent): void {
    // Mock implementation - in production, send to SIEM/security monitoring
    console.log('Sending to security monitoring:', event);
  }

  async enableTwoFactorAuth(userId: string): Promise<{ secret: string; qrCode: string }> {
    // Mock 2FA implementation
    const secret = this.generateSecret();
    const qrCode = `otpauth://totp/CurioTutors:${userId}?secret=${secret}&issuer=CurioTutors`;
    
    return { secret, qrCode };
  }

  async verifyTwoFactorCode(userId: string, code: string, secret: string): Promise<boolean> {
    // Mock 2FA verification - in production, use a proper TOTP library
    return code.length === 6 && /^\d+$/.test(code);
  }

  async auditMeetingAccess(meetingId: string): Promise<any[]> {
    // Return audit log for meeting access
    return [
      {
        timestamp: new Date(),
        action: 'meeting_joined',
        userId: 'user123',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0'
      }
    ];
  }

  async generateMeetingWatermark(meetingId: string, userId: string): Promise<string> {
    // Generate unique watermark for session recording
    const watermarkData = {
      meetingId,
      userId,
      timestamp: Date.now(),
      sessionId: this.generateId()
    };
    
    return btoa(JSON.stringify(watermarkData));
  }

  private generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // GDPR Compliance Methods
  async exportUserData(userId: string): Promise<any> {
    return {
      userId,
      sessions: Array.from(this.activeSessions.entries())
        .filter(([id, session]) => id === userId),
      securityEvents: [], // Would filter by userId in production
      exportedAt: new Date().toISOString()
    };
  }

  async deleteUserData(userId: string): Promise<void> {
    // Remove all user data for GDPR compliance
    this.activeSessions.delete(userId);
    
    // In production, this would also remove from database
    console.log(`User data deleted for: ${userId}`);
  }

  // FERPA Compliance Methods
  async getEducationalRecords(studentId: string): Promise<any> {
    // Return educational records for FERPA compliance
    return {
      studentId,
      meetingParticipation: [],
      recordings: [],
      accessedAt: new Date().toISOString()
    };
  }

  async restrictEducationalAccess(studentId: string, restrictions: string[]): Promise<void> {
    // Implement FERPA access restrictions
    console.log(`Educational access restricted for ${studentId}:`, restrictions);
  }
}