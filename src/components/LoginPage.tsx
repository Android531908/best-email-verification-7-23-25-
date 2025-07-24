import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowLeft, Mail, CheckCircle, Shield, AlertTriangle, Check, X, ChevronDown, Loader } from 'lucide-react';
import { EmailValidator, useEmailValidation } from '../utils/emailValidation';
import EmailVerification from './EmailVerification';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

interface LoginPageProps {
  onLogin: (userData?: { firstName: string }) => void;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  bgColor: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('');
  const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'sent' | 'success'>('email');
  const [resetLoading, setResetLoading] = useState(false);
  const [signUpStep, setSignUpStep] = useState(1);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  // Firebase Auth hook
  const { signUp, signIn, sendPasswordReset, error: authError, loading: authLoading, clearError } = useFirebaseAuth();
  
  // Email validation hook
  const { validation: emailValidation, isValidating } = useEmailValidation(email, isSignUp && signUpStep === 1);

  // Calculate password strength
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    
    let label = '';
    let color = '';
    let bgColor = '';

    if (score === 0) {
      label = 'Enter password';
      color = '#6B7280';
      bgColor = '#F3F4F6';
    } else if (score <= 2) {
      label = 'Weak';
      color = '#EF4444';
      bgColor = '#FEE2E2';
    } else if (score <= 3) {
      label = 'Fair';
      color = '#F59E0B';
      bgColor = '#FEF3C7';
    } else if (score <= 4) {
      label = 'Good';
      color = '#10B981';
      bgColor = '#D1FAE5';
    } else {
      label = 'Strong';
      color = '#059669';
      bgColor = '#A7F3D0';
    }

    return { score, label, color, bgColor, requirements };
  };

  const passwordStrength = calculatePasswordStrength(password);
  const confirmPasswordMatch = password === confirmPassword && confirmPassword.length > 0;

  // Profession options
  const professionOptions = [
    'NP Student',
    'Practicing NP',
    'Faculty / Educator',
    'Other'
  ];

  const validateSignUpForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (signUpStep === 1) {
      if (!firstName.trim()) newErrors.firstName = 'First name is required';
      if (!lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!email.trim()) newErrors.email = 'Email is required';
      else if (!emailValidation.isValid) {
        newErrors.email = emailValidation.errors[0] || 'Email is invalid';
      }
      if (!profession.trim()) newErrors.profession = 'Profession is required';
    } else if (signUpStep === 2) {
      if (!username.trim()) newErrors.username = 'Username is required';
      else if (username.length < 3) newErrors.username = 'Username must be at least 3 characters';
      if (!password) newErrors.password = 'Password is required';
      else if (passwordStrength.score < 3) newErrors.password = 'Password must be stronger (at least Fair)';
      if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUpNext = () => {
    if (validateSignUpForm()) {
      setSignUpStep(2);
    }
  };

  const handleSignUpBack = () => {
    setSignUpStep(1);
    setErrors({});
  };

  const handleProfessionSelect = (selectedProfession: string) => {
    setProfession(selectedProfession);
    setShowProfessionDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && !validateSignUpForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    clearError();
    
    try {
      if (isSignUp) {
        // Firebase registration
        const result = await signUp({
          email: EmailValidator.sanitize(email),
          password,
          firstName,
          lastName,
          profession
        });
        
        if (result.needsVerification) {
          setRegisteredEmail(EmailValidator.sanitize(email));
          setShowEmailVerification(true);
        } else {
          // User is already verified, proceed to dashboard
          onLogin({ firstName });
        }
      } else {
        // Firebase sign in
        const result = await signIn(username, password);
        
        if (!result.user.emailVerified) {
          // User needs to verify email
          setRegisteredEmail(result.user.email || '');
          setShowEmailVerification(true);
        } else {
          // User is verified, proceed to dashboard
          onLogin({ firstName: result.profile.firstName });
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(authError || error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const success = await FirebaseAuthService.resendEmailVerification();
      if (!success) {
        throw new Error('Failed to resend verification email');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend verification email');
    }
  };

  const handleVerificationComplete = () => {
    setShowEmailVerification(false);
    onLogin({ firstName: firstName || 'New User' });
  };

  const handleBackToLogin = () => {
    setShowEmailVerification(false);
    setIsSignUp(false);
    resetForm();
  };

  const handleFaceId = async () => {
    setIsLoading(true);
    // Simulate Face ID authentication
    setTimeout(() => {
      setIsLoading(false);
      onLogin({ firstName: 'Alex' });
    }, 2000);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError('');
    
    try {
      const success = await sendPasswordReset(resetEmail);
      if (success) {
        setResetStep('sent');
        setTimeout(() => {
          setResetStep('success');
        }, 3000);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
      setResetLoading(false);
      return;
    }
    
    setResetLoading(false);
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetStep('email');
    setResetLoading(false);
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setProfession('');
    setErrors({});
    setSignUpStep(1);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  // Show email verification screen
  if (showEmailVerification) {
    return (
      <EmailVerification
        email={registeredEmail}
        onResendVerification={handleResendVerification}
        onBackToLogin={handleBackToLogin}
        onVerificationComplete={handleVerificationComplete}
      />
    );
  }

  // Forgot Password Flow
  if (showForgotPassword) {
    return (
      <div className="fixed inset-0 w-full h-full flex flex-col justify-center items-center px-8 relative overflow-hidden" style={{
        background: '#F5E6B8'
      }}>
        <div className="relative z-10 w-full max-w-sm">
          <div className="flex items-center mb-8">
            <button
              onClick={resetForgotPassword}
              className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors mr-4"
            >
              <ArrowLeft className="h-6 w-6" style={{ color: '#2D4A22' }} />
            </button>
            <h1 className="text-2xl font-bold" style={{ color: '#2D4A22' }}>
              Reset Password
            </h1>
          </div>

          {resetStep === 'email' && (
            <>
              <div className="mb-8 text-center">
                <p className="text-lg" style={{ color: '#8B4513' }}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="w-full space-y-6">
                <div className="relative">
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                    <Mail className="h-6 w-6" style={{ color: '#B8860B' }} />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full py-6 pl-16 pr-6 text-xl font-medium transition-all duration-200 focus:outline-none"
                    style={{
                      backgroundColor: '#F5E6B8',
                      border: '3px solid #2D4A22',
                      borderRadius: '30px',
                      color: '#2D4A22',
                      fontSize: '20px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'
                    }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading || authLoading}
                  className="w-full text-white font-bold py-6 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{
                    background: 'linear-gradient(135deg, #4A7C59 0%, #2D4A22 100%)',
                    borderRadius: '30px',
                    fontSize: '22px',
                    fontWeight: '700',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.1)',
                    border: '2px solid #1F3318'
                  }}
                >
                  {resetLoading || authLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending Reset Link...</span>
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          )}

          {resetStep === 'sent' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#2D4A22' }}>
                Check Your Email
              </h2>
              <p className="text-lg mb-6" style={{ color: '#8B4513' }}>
                We've sent a password reset link to:
              </p>
              <p className="text-xl font-semibold mb-8" style={{ color: '#2D4A22' }}>
                {resetEmail}
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                <span style={{ color: '#8B4513' }}>Processing...</span>
              </div>
            </div>
          )}
          
          {/* Firebase Auth Error */}
          {authError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-200 text-sm">{authError}</span>
              </div>
            </div>
          )}

          {resetStep === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#2D4A22' }}>
                Reset Link Sent!
              </h2>
              <p className="text-lg mb-8" style={{ color: '#8B4513' }}>
                Please check your email and follow the instructions to reset your password.
              </p>
              <button
                onClick={resetForgotPassword}
                className="w-full text-white font-bold py-6 transition-all duration-200 transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #4A7C59 0%, #2D4A22 100%)',
                  borderRadius: '30px',
                  fontSize: '22px',
                  fontWeight: '700',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.1)',
                  border: '2px solid #1F3318'
                }}
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-6 py-8 relative login-container page-content scrollable-area" style={{
      background: '#F5E6B8'
    }}>
      <div className="relative z-10 w-full max-w-sm mx-auto pb-20">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-6 mb-6">
            <div className="flex-shrink-0">
              <img 
                src="/src/assets/Company Logo copy copy.jpeg"
                alt="Curio Tutors Logo"
                className="w-32 h-32 object-contain"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                  borderRadius: '16px'
                }}
              />
            </div>
            
            <div className="text-left">
              <div className="text-5xl font-black leading-none mb-1">
                <span style={{ color: '#8B4513', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Curio</span>
              </div>
              <div className="text-5xl font-black leading-none">
                <span style={{ color: '#2D4A22', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Tutors</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Header */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#2D4A22' }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-lg" style={{ color: '#8B4513' }}>
            {isSignUp ? 'Join Curio Tutors today' : 'Sign in to continue learning'}
          </p>
        </div>

        {/* Sign Up Form */}
        {isSignUp ? (
          <form onSubmit={signUpStep === 1 ? (e) => { e.preventDefault(); handleSignUpNext(); } : handleSubmit} className="w-full space-y-4">
            {signUpStep === 1 ? (
              <>
                {/* Step 1: Personal Information */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#2D4A22' }}>
                    Personal Information
                  </h3>
                </div>

                {/* First Name */}
                <div className="relative">
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                    <User className="h-6 w-6" style={{ color: '#B8860B' }} />
                  </div>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full py-6 pl-16 pr-6 text-xl font-medium transition-all duration-200 focus:outline-none ${
                      errors.firstName ? 'border-red-500' : ''
                    }`}
                    style={{
                      backgroundColor: '#F5E6B8',
                      border: `3px solid ${errors.firstName ? '#ef4444' : '#2D4A22'}`,
                      borderRadius: '30px',
                      color: '#2D4A22',
                      fontSize: '20px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'
                    }}
                    required
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-2 ml-4">{errors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="relative">
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                    <User className="h-6 w-6" style={{ color: '#B8860B' }} />
                  </div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full py-6 pl-16 pr-6 text-xl font-medium transition-all duration-200 focus:outline-none ${
                      errors.lastName ? 'border-red-500' : ''
                    }`}
                    style={{
                      backgroundColor: '#F5E6B8',
                      border: `3px solid ${errors.lastName ? '#ef4444' : '#2D4A22'}`,
                      borderRadius: '30px',
                      color: '#2D4A22',
                      fontSize: '20px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'
                    }}
                    required
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-2 ml-4">{errors.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                    {isValidating ? (
                      <Loader className="h-6 w-6 animate-spin" style={{ color: '#B8860B' }} />
                    ) : (
                      <Mail className="h-6 w-6" style={{ color: '#B8860B' }} />
                    )}
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full py-6 pl-16 pr-6 text-xl font-medium transition-all duration-200 focus:outline-none ${
                      errors.email || (!emailValidation.isValid && email.length > 0) ? 'border-red-500' : 
                      emailValidation.isValid && email.length > 0 ? 'border-green-500' : ''
                    }`}
                    style={{
                      backgroundColor: '#F5E6B8',
                      border: `3px solid ${
                        errors.email || (!emailValidation.isValid && email.length > 0) ? '#ef4444' : 
                        emailValidation.isValid && email.length > 0 ? '#10b981' : '#2D4A22'
                      }`,
                      borderRadius: '30px',
                      color: '#2D4A22',
                      fontSize: '20px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'
                    }}
                    required
                  />
                  
                  {/* Email validation feedback */}
                  {email.length > 0 && !isValidating && (
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                      {emailValidation.isValid ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                  
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2 ml-4">{errors.email}</p>
                  )}
                  
                  {!errors.email && !emailValidation.isValid && email.length > 0 && !isValidating && (
                    <div className="mt-2 ml-4">
                      {emailValidation.errors.map((error, index) => (
                        <p key={index} className="text-red-500 text-sm">{error}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Profession */}
                <div className="relative">
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                    <User className="h-6 w-6" style={{ color: '#B8860B' }} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProfessionDropdown(!showProfessionDropdown)}
                    className={`w-full py-6 pl-16 pr-6 text-xl font-medium transition-all duration-200 focus:outline-none ${
                      errors.profession ? 'border-red-500' : ''
                    }`}
                    style={{
                      backgroundColor: '#F5E6B8',
                      border: `3px solid ${errors.profession ? '#ef4444' : '#2D4A22'}`,
                      borderRadius: '30px',
                      color: '#2D4A22',
                      fontSize: '20px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'
                    }}
                  />
                  <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10">
                    <ChevronDown className={`h-6 w-6 transition-transform duration-200 ${showProfessionDropdown ? 'rotate-180' : ''}`} style={{ color: '#B8860B' }} />
                  </div>
                  <span className="absolute left-16 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: profession ? '#2D4A22' : '#8B4513' }}>
                    {profession || 'Select your profession'}
                  </span>
                  
                  {/* Dropdown Menu */}
                  {showProfessionDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-amber-200 rounded-2xl shadow-lg z-20 overflow-hidden">
                      {professionOptions.map((option, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleProfessionSelect(option)}
                          className="w-full px-6 py-4 text-left text-lg font-medium text-amber-900 hover:bg-amber-50 transition-colors duration-200 border-b border-amber-100 last:border-b-0"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {errors.profession && (
                    <p className="text-red-500 text-sm mt-2 ml-4">{errors.profession}</p>
                  )}
                </div>

                {/* Next Button */}
                <button
                  type="submit"
                  className="w-full text-white font-bold py-6 transition-all duration-200 transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #4A7C59 0%, #2D4A22 100%)',
                    borderRadius: '30px',
                    fontSize: '22px',
            disabled={isJoining || authLoading || !devicePermissions.camera || !devicePermissions.microphone}
                    boxShadow: '0 6px 16px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.1)',
                    border: '2px solid #1F3318'
            {isJoining || authLoading ? (
                >
                  Next Step
                <span>{authLoading ? 'Authenticating...' : 'Joining Session...'}</span>
              </>
            ) : (
              <>
                {/* Step 2: Account Setup */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleSignUpBack}
                    className="flex items-center space-x-2 text-amber-800 hover:text-amber-900 mb-3"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#2D4A22' }}>
                    Account Setup
                  </h3>
                </div>

                {/* Username */}
                <div className="relative">
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                    <User className="h-6 w-6" style={{ color: '#B8860B' }} />
                  </div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full py-6 pl-16 pr-6 text-xl font-medium transition-all duration-200 focus:outline-none ${
                      errors.username ? 'border-red-500' : ''
                    }`}
                    style={{
                      backgroundColor: '#F5E6B8',
                      border: `3px solid ${errors.username ? '#ef4444' : '#2D4A22'}`,
                      borderRadius: '30px',
                      color: '#2D4A22',
                      fontSize: '20px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'
                    }}
                    required
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-2 ml-4">{errors.username}</p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <div className="mb-2">
                    <label className="text-sm font-medium" style={{ color: '#2D4A22' }}>
                      Password
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full py-6 pl-16 pr-16 text-xl font-medium transition-all duration-200 focus:outline-none ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                    style={{
                      backgroundColor: '#F5E6B8',
                      border: `3px solid ${errors.password ? '#ef4444' : '#2D4A22'}`,
                      borderRadius: '30px',
                      color: '#2D4A22',
                      fontSize: '20px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)',
                      paddingLeft: '24px',
                      paddingRight: '24px'
                    }}
                    required
                  />
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-3 p-3 rounded-xl border" style={{ 
                      backgroundColor: passwordStrength.bgColor,
                      borderColor: passwordStrength.color 
                    }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" style={{ color: passwordStrength.color }} />
                          <span className="text-sm font-medium" style={{ color: passwordStrength.color }}>
                            Password Strength: {passwordStrength.label}
                          </span>
                        </div>
                        <div className="text-xs" style={{ color: passwordStrength.color }}>
                          {passwordStrength.score}/5
                        </div>
                      </div>
                      
                      {/* Strength Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(passwordStrength.score / 5) * 100}%`,
                            backgroundColor: passwordStrength.color 
                          }}
                        />
                      </div>
                      
                      {/* Requirements Checklist */}
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        <div className="flex items-center space-x-2">
                          {passwordStrength.requirements.length ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                          <span className={passwordStrength.requirements.length ? 'text-green-700' : 'text-red-600'}>
                            At least 8 characters
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {passwordStrength.requirements.uppercase ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                          <span className={passwordStrength.requirements.uppercase ? 'text-green-700' : 'text-red-600'}>
                            One uppercase letter
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {passwordStrength.requirements.lowercase ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                          <span className={passwordStrength.requirements.lowercase ? 'text-green-700' : 'text-red-600'}>
                            One lowercase letter
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {passwordStrength.requirements.number ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                          <span className={passwordStrength.requirements.number ? 'text-green-700' : 'text-red-600'}>
                            One number
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {passwordStrength.requirements.special ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                          <span className={passwordStrength.requirements.special ? 'text-green-700' : 'text-red-600'}>
                            One special character (!@#$%^&*)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-2 ml-4">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <div className="mb-2">
                    <label className="text-sm font-medium" style={{ color: '#2D4A22' }}>
                      Confirm Password
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full py-6 pl-16 pr-16 text-xl font-medium transition-all duration-200 focus:outline-none ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                    style={{
                      backgroundColor: '#F5E6B8',
                      border: `3px solid ${errors.confirmPassword ? '#ef4444' : '#2D4A22'}`,
                      borderRadius: '30px',
                      color: '#2D4A22',
                      fontSize: '20px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)',
                      paddingLeft: '24px',
                      paddingRight: '24px'
                    }}
                    required
                  />
                  
                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <div className={`mt-3 p-3 rounded-lg flex items-center space-x-2 ${
                      confirmPasswordMatch 
                        ? 'bg-green-100 border border-green-300' 
                        : 'bg-red-100 border border-red-300'
                    }`}>
                      {confirmPasswordMatch ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-700 font-medium">Passwords don't match</span>
                        </>
                      )}
                    </div>
                  )}
                  
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-2 ml-4">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={isLoading || authLoading || (email.length > 0 && !emailValidation.isValid)}
                  className="w-full text-white font-bold py-6 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{
                    background: 'linear-gradient(135deg, #4A7C59 0%, #2D4A22 100%)',
                    borderRadius: '30px',
                    fontSize: '22px',
                    fontWeight: '700',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.1)',
                    border: '2px solid #1F3318'
                  }}
                >
                  {isLoading || authLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </>
            )}
          </form>
        ) : (
          /* Login Form */
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Username Field */}
            <div className="relative">
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                <User className="h-6 w-6" style={{ color: '#B8860B' }} />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-6 pl-16 pr-6 text-xl font-medium transition-all duration-200 focus:outline-none"
                style={{
                  backgroundColor: '#F5E6B8',
                  border: '3px solid #2D4A22',
                  borderRadius: '30px',
                  color: '#2D4A22',
                  fontSize: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'
                }}
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                <Lock className="h-6 w-6" style={{ color: '#B8860B' }} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-6 pl-16 pr-16 text-xl font-medium transition-all duration-200 focus:outline-none"
                style={{
                  backgroundColor: '#F5E6B8',
                  border: '3px solid #2D4A22',
                  borderRadius: '30px',
                  color: '#2D4A22',
                  fontSize: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 z-10 p-2 hover:bg-white/20 rounded-lg group"
                style={{ color: '#2D4A22' }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
                <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading || authLoading}
              className="w-full text-white font-bold py-6 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: 'linear-gradient(135deg, #4A7C59 0%, #2D4A22 100%)',
                borderRadius: '30px',
                fontSize: '22px',
                fontWeight: '700',
                boxShadow: '0 6px 16px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.1)',
                border: '2px solid #1F3318'
              }}
            >
              {isLoading || authLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Face ID Button */}
            <button
              type="button"
              onClick={handleFaceId}
              disabled={isLoading || authLoading}
              className="w-full text-white font-bold py-6 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: 'linear-gradient(135deg, #E6A532 0%, #CD853F 100%)',
                borderRadius: '30px',
                fontSize: '22px',
                fontWeight: '700',
                boxShadow: '0 6px 16px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.1)',
                border: '2px solid #B8860B'
              }}
            >
              {isLoading || authLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Face ID'
              )}
            </button>
          </form>
        )}

        {/* Footer Links */}
        <div className="flex flex-col items-center w-full mt-8 mb-8 space-y-4">
          {!isSignUp && (
            <button 
              onClick={() => setShowForgotPassword(true)}
              className="text-xl font-semibold transition-colors duration-200 hover:underline p-2" 
              style={{ color: '#2D4A22' }}
            >
              Forgot Password?
            </button>
          )}
          
          {/* Sign Up / Sign In Toggle */}
          <div className="text-center p-2">
            <span className="text-lg" style={{ color: '#8B4513' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              onClick={toggleMode}
              className="text-lg font-bold transition-colors duration-200 hover:underline p-1"
              style={{ color: '#2D4A22' }}
            >
              {isSignUp ? 'Sign In' : 'Sign up'}
            </button>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-8 mb-12">
          <p className="text-xl font-bold" style={{ color: '#8B4513' }}>
            {isSignUp ? 'Join thousands of learners today!' : ''}
          </p>
        </div>

        {/* Extra spacing for mobile scrolling */}
        <div className="h-32"></div>
      </div>
    </div>
  );
};

export default LoginPage;