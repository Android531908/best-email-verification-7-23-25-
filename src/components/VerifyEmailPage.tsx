// Email Verification Page Component
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, RefreshCw, ArrowLeft, Mail } from 'lucide-react';
import { FirebaseAuthService } from '../services/firebaseAuthService';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // Get action code from URL parameters
        const mode = searchParams.get('mode');
        const oobCode = searchParams.get('oobCode');

        if (!mode || !oobCode) {
          setStatus('error');
          setError('Invalid verification link');
          return;
        }

        // Handle the Firebase action
        const result = await FirebaseAuthService.handleAuthAction(mode, oobCode);

        if (result.success) {
          setStatus('success');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
        } else {
          setStatus('error');
          setError('Verification failed');
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        
        if (error.message.includes('expired')) {
          setStatus('expired');
        } else {
          setStatus('error');
          setError(error.message || 'Verification failed');
        }
      }
    };

    handleVerification();
  }, [searchParams, navigate]);

  const handleBackToLogin = () => {
    navigate('/', { replace: true });
  };

  const getStatusContent = () => {
    switch (status) {
      case 'verifying':
        return {
          icon: <RefreshCw className="h-16 w-16 text-blue-600 animate-spin" />,
          title: 'Verifying Email...',
          message: 'Please wait while we verify your email address.',
          color: 'text-blue-800'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-600" />,
          title: 'Email Verified!',
          message: 'Your email has been successfully verified. Redirecting you to login...',
          color: 'text-green-800'
        };
      case 'expired':
        return {
          icon: <AlertCircle className="h-16 w-16 text-orange-600" />,
          title: 'Link Expired',
          message: 'This verification link has expired. Please request a new verification email.',
          color: 'text-orange-800'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-16 w-16 text-red-600" />,
          title: 'Verification Failed',
          message: error || 'There was an error verifying your email. Please try again.',
          color: 'text-red-800'
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="fixed inset-0 w-full h-full flex relative overflow-hidden" style={{
      background: '#F5E6B8'
    }}>
      <div className="flex-1 flex flex-col justify-center items-center px-8">
        <div className="relative z-10 w-full max-w-md">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={handleBackToLogin}
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
              {statusContent.icon}
            </div>

            {/* Status Message */}
            <h2 className={`text-2xl font-bold mb-4 ${statusContent.color}`}>
              {statusContent.title}
            </h2>
            <p className="text-lg mb-6 text-gray-700">
              {statusContent.message}
            </p>

            {/* Action Button */}
            {(status === 'error' || status === 'expired') && (
              <div className="space-y-4">
                <button
                  onClick={handleBackToLogin}
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
                  Back to Login
                </button>
              </div>
            )}

            {status === 'success' && (
              <div className="mt-6">
                <p className="text-sm text-gray-600">
                  Redirecting to login in 3 seconds...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;