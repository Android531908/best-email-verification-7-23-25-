import { EventEmitter } from '../../../utils/EventEmitter';
import { AnalyticsData, NetworkStats, Participant } from '../types/conference.types';

export class AnalyticsService extends EventEmitter {
  private sessionData: Map<string, any> = new Map();
  private performanceMetrics: Map<string, any> = new Map();
  private usageStats: Map<string, any> = new Map();
  private qualityMetrics: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializeAnalytics();
  }

  private initializeAnalytics(): void {
    // Start performance monitoring
    this.startPerformanceMonitoring();
    
    // Initialize quality metrics collection
    this.startQualityMonitoring();
    
    // Set up usage tracking
    this.startUsageTracking();
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 5000); // Every 5 seconds
  }

  private startQualityMonitoring(): void {
    setInterval(() => {
      this.collectQualityMetrics();
    }, 10000); // Every 10 seconds
  }

  private startUsageTracking(): void {
    setInterval(() => {
      this.collectUsageStats();
    }, 60000); // Every minute
  }

  trackMeetingJoin(meetingId: string, userId?: string): void {
    const sessionKey = `${meetingId}:${userId || 'anonymous'}`;
    
    this.sessionData.set(sessionKey, {
      meetingId,
      userId,
      joinTime: Date.now(),
      events: [],
      networkStats: [],
      qualityMetrics: []
    });

    this.logEvent(sessionKey, 'meeting_joined', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      platform: this.detectPlatform(),
      browserInfo: this.getBrowserInfo()
    });

    // Track usage statistics
    this.incrementUsageStat('total_joins');
    this.incrementUsageStat(`joins_${this.getTimeSlot()}`);
  }

  trackMeetingLeave(meetingId: string, userId?: string): void {
    const sessionKey = `${meetingId}:${userId || 'anonymous'}`;
    const session = this.sessionData.get(sessionKey);
    
    if (session) {
      const duration = Date.now() - session.joinTime;
      
      this.logEvent(sessionKey, 'meeting_left', {
        timestamp: Date.now(),
        duration,
        totalEvents: session.events.length
      });

      // Generate session analytics
      this.generateSessionAnalytics(sessionKey, session);
      
      // Clean up session data
      this.sessionData.delete(sessionKey);
    }

    this.incrementUsageStat('total_leaves');
  }

  trackMeetingCreate(meetingId: string, hostId?: string): void {
    this.logEvent(`${meetingId}:${hostId}`, 'meeting_created', {
      timestamp: Date.now(),
      meetingId,
      hostId
    });

    this.incrementUsageStat('total_meetings_created');
    this.incrementUsageStat(`meetings_created_${this.getTimeSlot()}`);
  }

  trackMediaToggle(action: 'audio_toggle' | 'video_toggle' | 'screen_share', enabled: boolean): void {
    this.sessionData.forEach((session, sessionKey) => {
      this.logEvent(sessionKey, action, {
        timestamp: Date.now(),
        enabled,
        device: this.getCurrentDevice()
      });
    });

    this.incrementUsageStat(`${action}_${enabled ? 'enabled' : 'disabled'}`);
  }

  trackChatMessage(messageLength: number, hasAttachment: boolean = false): void {
    this.sessionData.forEach((session, sessionKey) => {
      this.logEvent(sessionKey, 'chat_message_sent', {
        timestamp: Date.now(),
        messageLength,
        hasAttachment
      });
    });

    this.incrementUsageStat('total_chat_messages');
    if (hasAttachment) {
      this.incrementUsageStat('chat_messages_with_attachments');
    }
  }

  trackScreenShare(duration: number): void {
    this.sessionData.forEach((session, sessionKey) => {
      this.logEvent(sessionKey, 'screen_share_session', {
        timestamp: Date.now(),
        duration
      });
    });

    this.incrementUsageStat('total_screen_shares');
    this.addToAverageStat('average_screen_share_duration', duration);
  }

  trackRecording(duration: number, fileSize: number): void {
    this.sessionData.forEach((session, sessionKey) => {
      this.logEvent(sessionKey, 'recording_session', {
        timestamp: Date.now(),
        duration,
        fileSize
      });
    });

    this.incrementUsageStat('total_recordings');
    this.addToAverageStat('average_recording_duration', duration);
    this.addToAverageStat('average_recording_size', fileSize);
  }

  trackNetworkStats(stats: NetworkStats): void {
    this.sessionData.forEach((session, sessionKey) => {
      session.networkStats.push({
        timestamp: Date.now(),
        ...stats
      });
    });

    // Update global network metrics
    this.updateNetworkMetrics(stats);
  }

  trackConnectionQuality(quality: 'excellent' | 'good' | 'fair' | 'poor'): void {
    this.sessionData.forEach((session, sessionKey) => {
      session.qualityMetrics.push({
        timestamp: Date.now(),
        quality
      });
    });

    this.incrementUsageStat(`connection_quality_${quality}`);
  }

  trackError(errorType: string, errorMessage: string, context?: any): void {
    this.sessionData.forEach((session, sessionKey) => {
      this.logEvent(sessionKey, 'error_occurred', {
        timestamp: Date.now(),
        errorType,
        errorMessage,
        context
      });
    });

    this.incrementUsageStat(`errors_${errorType}`);
    this.incrementUsageStat('total_errors');
  }

  trackFeatureUsage(feature: string, action: string, metadata?: any): void {
    this.sessionData.forEach((session, sessionKey) => {
      this.logEvent(sessionKey, 'feature_used', {
        timestamp: Date.now(),
        feature,
        action,
        metadata
      });
    });

    this.incrementUsageStat(`feature_${feature}_${action}`);
  }

  private collectPerformanceMetrics(): void {
    const metrics = {
      timestamp: Date.now(),
      memory: this.getMemoryUsage(),
      cpu: this.getCPUUsage(),
      network: this.getNetworkPerformance(),
      webrtc: this.getWebRTCMetrics()
    };

    this.performanceMetrics.set(Date.now(), metrics);

    // Keep only last 100 entries
    if (this.performanceMetrics.size > 100) {
      const oldestKey = Math.min(...this.performanceMetrics.keys());
      this.performanceMetrics.delete(oldestKey);
    }
  }

  private collectQualityMetrics(): void {
    // Collect video/audio quality metrics
    const qualityData = {
      timestamp: Date.now(),
      videoQuality: this.assessVideoQuality(),
      audioQuality: this.assessAudioQuality(),
      connectionStability: this.assessConnectionStability()
    };

    this.qualityMetrics.set(Date.now(), qualityData);
  }

  private collectUsageStats(): void {
    const stats = {
      timestamp: Date.now(),
      activeSessions: this.sessionData.size,
      totalDataTransferred: this.calculateDataTransfer(),
      averageSessionDuration: this.calculateAverageSessionDuration(),
      peakConcurrentUsers: this.getPeakConcurrentUsers()
    };

    this.usageStats.set(Date.now(), stats);
  }

  private generateSessionAnalytics(sessionKey: string, session: any): void {
    const analytics: AnalyticsData = {
      meetingId: session.meetingId,
      duration: Date.now() - session.joinTime,
      participantCount: 1, // This would be calculated differently in a real implementation
      peakParticipants: 1,
      averageConnectionQuality: this.calculateAverageQuality(session.qualityMetrics),
      totalChatMessages: session.events.filter((e: any) => e.type === 'chat_message_sent').length,
      screenShareDuration: this.calculateScreenShareDuration(session.events),
      recordingDuration: this.calculateRecordingDuration(session.events),
      networkStats: this.calculateAverageNetworkStats(session.networkStats)
    };

    // Send analytics to backend
    this.sendAnalyticsToBackend(analytics);
  }

  private logEvent(sessionKey: string, eventType: string, data: any): void {
    const session = this.sessionData.get(sessionKey);
    if (session) {
      session.events.push({
        type: eventType,
        data,
        timestamp: Date.now()
      });
    }
  }

  private incrementUsageStat(statName: string): void {
    const current = this.usageStats.get(statName) || 0;
    this.usageStats.set(statName, current + 1);
  }

  private addToAverageStat(statName: string, value: number): void {
    const current = this.usageStats.get(statName) || { total: 0, count: 0 };
    current.total += value;
    current.count += 1;
    this.usageStats.set(statName, current);
  }

  private updateNetworkMetrics(stats: NetworkStats): void {
    const current = this.performanceMetrics.get('network') || {
      latencySum: 0,
      packetLossSum: 0,
      bandwidthSum: { upload: 0, download: 0 },
      sampleCount: 0
    };

    current.latencySum += stats.averageLatency;
    current.packetLossSum += stats.packetLoss;
    current.bandwidthSum.upload += stats.bandwidth.upload;
    current.bandwidthSum.download += stats.bandwidth.download;
    current.sampleCount += 1;

    this.performanceMetrics.set('network', current);
  }

  private getMemoryUsage(): any {
    if ('memory' in performance) {
      return {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  private getCPUUsage(): number {
    // Estimate CPU usage based on frame timing
    const start = performance.now();
    for (let i = 0; i < 100000; i++) {
      Math.random();
    }
    const end = performance.now();
    return end - start;
  }

  private getNetworkPerformance(): any {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  }

  private getWebRTCMetrics(): any {
    // This would collect actual WebRTC statistics in a real implementation
    return {
      packetsLost: Math.floor(Math.random() * 10),
      jitter: Math.random() * 50,
      roundTripTime: Math.random() * 200 + 50
    };
  }

  private assessVideoQuality(): string {
    // Mock video quality assessment
    const qualities = ['excellent', 'good', 'fair', 'poor'];
    return qualities[Math.floor(Math.random() * qualities.length)];
  }

  private assessAudioQuality(): string {
    // Mock audio quality assessment
    const qualities = ['excellent', 'good', 'fair', 'poor'];
    return qualities[Math.floor(Math.random() * qualities.length)];
  }

  private assessConnectionStability(): number {
    // Return stability score 0-100
    return Math.floor(Math.random() * 100);
  }

  private calculateDataTransfer(): number {
    // Mock data transfer calculation
    return Math.floor(Math.random() * 1000000); // Bytes
  }

  private calculateAverageSessionDuration(): number {
    let totalDuration = 0;
    let sessionCount = 0;

    this.sessionData.forEach(session => {
      totalDuration += Date.now() - session.joinTime;
      sessionCount++;
    });

    return sessionCount > 0 ? totalDuration / sessionCount : 0;
  }

  private getPeakConcurrentUsers(): number {
    // This would track the maximum concurrent users
    return this.sessionData.size;
  }

  private calculateAverageQuality(qualityMetrics: any[]): 'excellent' | 'good' | 'fair' | 'poor' {
    if (qualityMetrics.length === 0) return 'good';

    const qualityScores = qualityMetrics.map(metric => {
      switch (metric.quality) {
        case 'excellent': return 4;
        case 'good': return 3;
        case 'fair': return 2;
        case 'poor': return 1;
        default: return 3;
      }
    });

    const average = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;

    if (average >= 3.5) return 'excellent';
    if (average >= 2.5) return 'good';
    if (average >= 1.5) return 'fair';
    return 'poor';
  }

  private calculateScreenShareDuration(events: any[]): number {
    let totalDuration = 0;
    let startTime = 0;

    events.forEach(event => {
      if (event.type === 'screen_share_session') {
        totalDuration += event.data.duration;
      }
    });

    return totalDuration;
  }

  private calculateRecordingDuration(events: any[]): number {
    let totalDuration = 0;

    events.forEach(event => {
      if (event.type === 'recording_session') {
        totalDuration += event.data.duration;
      }
    });

    return totalDuration;
  }

  private calculateAverageNetworkStats(networkStats: any[]): NetworkStats {
    if (networkStats.length === 0) {
      return {
        averageLatency: 0,
        packetLoss: 0,
        jitter: 0,
        bandwidth: { upload: 0, download: 0 }
      };
    }

    const totals = networkStats.reduce((acc, stat) => ({
      latency: acc.latency + stat.averageLatency,
      packetLoss: acc.packetLoss + stat.packetLoss,
      jitter: acc.jitter + stat.jitter,
      uploadBandwidth: acc.uploadBandwidth + stat.bandwidth.upload,
      downloadBandwidth: acc.downloadBandwidth + stat.bandwidth.download
    }), {
      latency: 0,
      packetLoss: 0,
      jitter: 0,
      uploadBandwidth: 0,
      downloadBandwidth: 0
    });

    const count = networkStats.length;

    return {
      averageLatency: totals.latency / count,
      packetLoss: totals.packetLoss / count,
      jitter: totals.jitter / count,
      bandwidth: {
        upload: totals.uploadBandwidth / count,
        download: totals.downloadBandwidth / count
      }
    };
  }

  private sendAnalyticsToBackend(analytics: AnalyticsData): void {
    // In production, this would send data to your analytics backend
    console.log('Analytics data:', analytics);
    
    // Mock API call
    fetch('/api/analytics/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analytics)
    }).catch(error => {
      console.error('Failed to send analytics:', error);
    });
  }

  private detectPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('windows')) return 'Windows';
    if (userAgent.includes('mac')) return 'macOS';
    if (userAgent.includes('linux')) return 'Linux';
    if (userAgent.includes('android')) return 'Android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS';
    
    return 'Unknown';
  }

  private getBrowserInfo(): any {
    const userAgent = navigator.userAgent;
    
    return {
      userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      platform: navigator.platform,
      vendor: navigator.vendor
    };
  }

  private getCurrentDevice(): any {
    return {
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      devicePixelRatio: window.devicePixelRatio
    };
  }

  private getTimeSlot(): string {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  // Public methods for retrieving analytics
  getSessionAnalytics(sessionKey: string): any {
    return this.sessionData.get(sessionKey);
  }

  getPerformanceMetrics(): Map<string, any> {
    return this.performanceMetrics;
  }

  getUsageStatistics(): Map<string, any> {
    return this.usageStats;
  }

  getQualityMetrics(): Map<string, any> {
    return this.qualityMetrics;
  }

  generateReport(timeRange: { start: Date; end: Date }): any {
    // Generate comprehensive analytics report
    return {
      timeRange,
      summary: {
        totalSessions: this.usageStats.get('total_joins') || 0,
        totalMeetings: this.usageStats.get('total_meetings_created') || 0,
        averageSessionDuration: this.calculateAverageSessionDuration(),
        totalErrors: this.usageStats.get('total_errors') || 0
      },
      performance: this.getPerformanceSummary(),
      quality: this.getQualitySummary(),
      usage: this.getUsageSummary(),
      generatedAt: new Date()
    };
  }

  private getPerformanceSummary(): any {
    const networkMetrics = this.performanceMetrics.get('network');
    
    return {
      averageLatency: networkMetrics ? networkMetrics.latencySum / networkMetrics.sampleCount : 0,
      averagePacketLoss: networkMetrics ? networkMetrics.packetLossSum / networkMetrics.sampleCount : 0,
      averageBandwidth: networkMetrics ? {
        upload: networkMetrics.bandwidthSum.upload / networkMetrics.sampleCount,
        download: networkMetrics.bandwidthSum.download / networkMetrics.sampleCount
      } : { upload: 0, download: 0 }
    };
  }

  private getQualitySummary(): any {
    return {
      excellent: this.usageStats.get('connection_quality_excellent') || 0,
      good: this.usageStats.get('connection_quality_good') || 0,
      fair: this.usageStats.get('connection_quality_fair') || 0,
      poor: this.usageStats.get('connection_quality_poor') || 0
    };
  }

  private getUsageSummary(): any {
    return {
      totalChatMessages: this.usageStats.get('total_chat_messages') || 0,
      totalScreenShares: this.usageStats.get('total_screen_shares') || 0,
      totalRecordings: this.usageStats.get('total_recordings') || 0,
      audioToggles: (this.usageStats.get('audio_toggle_enabled') || 0) + (this.usageStats.get('audio_toggle_disabled') || 0),
      videoToggles: (this.usageStats.get('video_toggle_enabled') || 0) + (this.usageStats.get('video_toggle_disabled') || 0)
    };
  }
}