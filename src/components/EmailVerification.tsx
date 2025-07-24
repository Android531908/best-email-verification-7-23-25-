import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, Clock } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onResendVerification: () => Promise<void>;
  onBackToLogin: () => void;
  onVerificationComplete: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onResendVerification,
  onBackToLogin,
  onVerificationComplete
}) => {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'checking' | 'verified' | 'expired' | 'error'>('pending');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(24 * 60 * 60); // 24 hours in seconds

  // Check for verification token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      verifyEmailToken(token);
    }
  }, []);

  // Countdown timer for verification expiry
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setVerificationStatus('expired');
    }
  }, [timeRemaining]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verifyEmailToken = async (token: string) => {
    setVerificationStatus('checking');
    
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setVerificationStatus('verified');
        setTimeout(() => {
          onVerificationComplete();
        }, 2000);
      } else {
        setVerificationStatus(result.expired ? 'expired' : 'error');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      await onResendVerification();
      setResendCooldown(60); // 60 second cooldown
      setTimeRemaining(24 * 60 * 60); // Reset to 24 hours
      setVerificationStatus('pending');
    } catch (error) {
      console.error('Resend verification error:', error);
      // Show user-friendly error message but don't break the UI
      setVerificationStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'pending':
        return <Mail className="h-16 w-16 text-blue-600" />;
      case 'checking':
        return <RefreshCw className="h-16 w-16 text-blue-600 animate-spin" />;
      case 'verified':
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case 'expired':
      case 'error':
        return <AlertCircle className="h-16 w-16 text-red-600" />;
      default:
        return <Mail className="h-16 w-16 text-blue-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'pending':
        return {
          title: 'Check Your Email',
          message: `We've sent a verification link to ${email}. Click the link in the email to verify your account.`,
          color: 'text-blue-800'
        };
      case 'checking':
        return {
          title: 'Verifying...',
          message: 'Please wait while we verify your email address.',
          color: 'text-blue-800'
        };
      case 'verified':
        return {
          title: 'Email Verified!',
          message: 'Your email has been successfully verified. Redirecting you to login...',
          color: 'text-green-800'
        };
      case 'expired':
        return {
          title: 'Verification Link Expired',
          message: 'The verification link has expired. Please request a new verification email.',
          color: 'text-red-800'
        };
      case 'error':
        return {
          title: 'Verification Failed',
          message: 'There was an error verifying your email. Please try again or request a new verification link.',
          color: 'text-red-800'
        };
      default:
        return {
          title: 'Email Verification',
          message: 'Please verify your email address.',
          color: 'text-blue-800'
        };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="fixed inset-0 w-full h-full flex relative overflow-hidden" style={{
      background: '#F5E6B8'
    }}>
      {/* Sidebar - hidden on verification page for focus */}
      <div className="hidden">
        <Sidebar activeItem="settings" userType="student" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-8">
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBackToLogin}
            className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors mr-4"
          >
            <ArrowLeft className="h-6 w-6" style={{ color: '#2D4A22' }} />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: '#2D4A22' }}>
            Email Verification
          </h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-200 text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>

          {/* Status Message */}
          <h2 className={`text-2xl font-bold mb-4 ${status.color}`}>
            {status.title}
          </h2>
          <p className="text-lg mb-6 text-gray-700">
            {status.message}
          </p>

          {/* Email Display */}
          <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
            <div className="flex items-center justify-center space-x-2">
              <Mail className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">{email}</span>
            </div>
          </div>

          {/* Time Remaining (for pending status) */}
          {verificationStatus === 'pending' && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  Link expires in: {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {(verificationStatus === 'pending' || verificationStatus === 'expired' || verificationStatus === 'error') && (
              <button
                onClick={handleResendVerification}
                disabled={resendCooldown > 0 || isResending}
                className="w-full text-white font-bold py-4 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  background: resendCooldown > 0 || isResending ? '#9CA3AF' : 'linear-gradient(135deg, #4A7C59 0%, #2D4A22 100%)',
                  borderRadius: '20px',
                  fontSize: '18px',
                  fontWeight: '700',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.1)',
                  border: '2px solid #1F3318'
                }}
              >
                {isResending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  'Resend Verification Email'
                )}
              </button>
            )}

            {verificationStatus === 'verified' && (
              <button
                onClick={onBackToLogin}
                className="w-full text-white font-bold py-4 transition-all duration-200 transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #4A7C59 0%, #2D4A22 100%)',
                  borderRadius: '20px',
                  fontSize: '18px',
                  fontWeight: '700',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.1)',
                  border: '2px solid #1F3318'
                }}
              >
                Continue to Login
              </button>
            )}

            <button
              onClick={onBackToLogin}
              className="w-full text-amber-800 font-semibold py-3 hover:text-amber-900 transition-colors"
            >
              Back to Login
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-sm text-gray-600">
            <p>Didn't receive the email? Check your spam folder or try resending.</p>
            <p className="mt-2">
              Need help? <a href="/support" className="text-green-600 hover:text-green-800 font-medium">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default EmailVerification;