import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import axios, { AxiosError } from 'axios';

// ============================================================================
// Type Definitions
// ============================================================================

interface ValidationErrors {
  email_or_phone: string | null;
  new_password: string | null;
  confirm_new_password: string | null;
  verification_code: string | null;
}

type PasswordStrength = 'weak' | 'fair' | 'strong';
type ResetMethod = 'email' | 'sms';

// ============================================================================
// Utility Functions
// ============================================================================

const isValidEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

const isValidPhone = (value: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  return phoneRegex.test(value.replace(/[\s()-]/g, ''));
};

const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (password.length < 8) return 'weak';
  
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length >= 12 && hasLetters && hasNumbers && hasSpecialChars) {
    return 'strong';
  }
  if (password.length >= 8 && hasLetters && hasNumbers) {
    return 'fair';
  }
  return 'weak';
};

// ============================================================================
// Main Component
// ============================================================================

const UV_PasswordReset: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // CRITICAL: Individual selectors to avoid infinite loops (unused but may be needed for redirect)
  // const currentUser = useAppStore(state => state.authentication_state.current_user);

  // ========================================================================
  // Local State Variables (matching datamap exactly)
  // ========================================================================
  
  const [reset_step, setResetStep] = useState<1 | 2 | 3 | 4>(1);
  const [email_or_phone, setEmailOrPhone] = useState('');
  const [reset_token_from_url, setResetTokenFromUrl] = useState<string | null>(null);
  const [new_password, setNewPassword] = useState('');
  const [confirm_new_password, setConfirmNewPassword] = useState('');
  const [password_strength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [verification_code, setVerificationCode] = useState('');
  const [reset_method, setResetMethod] = useState<ResetMethod>('email');
  const [submitting, setSubmitting] = useState(false);
  const [reset_error, setResetError] = useState<string | null>(null);
  const [reset_success, setResetSuccess] = useState(false);
  const [resend_cooldown, setResendCooldown] = useState(0);
  const [verification_attempts] = useState(0);
  const [show_password, setShowPassword] = useState(false);
  const [show_confirm_password, setShowConfirmPassword] = useState(false);
  
  const [validation_errors, setValidationErrors] = useState<ValidationErrors>({
    email_or_phone: null,
    new_password: null,
    confirm_new_password: null,
    verification_code: null,
  });

  // ========================================================================
  // Initialize from URL Parameters
  // ========================================================================

  useEffect(() => {
    const token = searchParams.get('reset_token');
    const step = searchParams.get('step');
    
    if (token) {
      setResetTokenFromUrl(token);
      setResetStep(3); // Jump to password creation step
    } else if (step === 'confirm') {
      setResetStep(2);
    }
  }, [searchParams]);

  // ========================================================================
  // Resend Cooldown Timer
  // ========================================================================

  useEffect(() => {
    if (resend_cooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resend_cooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resend_cooldown]);

  // ========================================================================
  // Password Strength Calculation (Real-time)
  // ========================================================================

  useEffect(() => {
    if (new_password) {
      const strength = calculatePasswordStrength(new_password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength('weak');
    }
  }, [new_password]);

  // ========================================================================
  // API Actions
  // ========================================================================

  const requestPasswordReset = async () => {
    // Clear previous errors
    setResetError(null);
    setValidationErrors(prev => ({ ...prev, email_or_phone: null }));

    // Validate input format
    if (!email_or_phone.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        email_or_phone: 'Please enter your email or phone number',
      }));
      return;
    }

    const is_email = isValidEmail(email_or_phone);
    const is_phone = isValidPhone(email_or_phone);

    if (!is_email && !is_phone) {
      setValidationErrors(prev => ({
        ...prev,
        email_or_phone: 'Please enter a valid email address or phone number',
      }));
      return;
    }

    // Determine reset method
    const method: ResetMethod = is_email ? 'email' : 'sms';
    setResetMethod(method);
    setSubmitting(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      
      await axios.post(
        `${API_BASE_URL}/api/auth/password-reset/request`,
        { email: email_or_phone },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Success - transition to Step 2
      setResetStep(2);
      setResendCooldown(60); // Start cooldown
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      setResetError(
        axiosError.response?.data?.message || 
        axiosError.response?.data?.error || 
        'Failed to send reset instructions. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const verifyResetCode = async () => {
    // NOTE: Backend endpoint missing - implement when available
    setResetError('SMS verification is not yet available. Please use email reset.');
    // Would implement:
    // POST /api/auth/verify-reset-code
    // { verification_code, phone: email_or_phone }
  };

  const confirmPasswordReset = async () => {
    // Clear previous errors
    setResetError(null);
    setValidationErrors({
      email_or_phone: null,
      new_password: null,
      confirm_new_password: null,
      verification_code: null,
    });

    // Validate password
    if (!new_password) {
      setValidationErrors(prev => ({
        ...prev,
        new_password: 'Password is required',
      }));
      return;
    }

    if (new_password.length < 8) {
      setValidationErrors(prev => ({
        ...prev,
        new_password: 'Password must be at least 8 characters',
      }));
      return;
    }

    const hasLetters = /[a-zA-Z]/.test(new_password);
    const hasNumbers = /[0-9]/.test(new_password);

    if (!hasLetters || !hasNumbers) {
      setValidationErrors(prev => ({
        ...prev,
        new_password: 'Password must contain both letters and numbers',
      }));
      return;
    }

    // Validate password match
    if (new_password !== confirm_new_password) {
      setValidationErrors(prev => ({
        ...prev,
        confirm_new_password: 'Passwords do not match',
      }));
      return;
    }

    // Validate token
    if (!reset_token_from_url) {
      setResetError('Invalid reset link. Please request a new password reset.');
      return;
    }

    setSubmitting(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      
      await axios.post(
        `${API_BASE_URL}/api/auth/password-reset/confirm`,
        {
          reset_token: reset_token_from_url,
          new_password: new_password,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Success - transition to Step 4
      setResetSuccess(true);
      setResetStep(4);

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.response?.data?.error ||
                          'Failed to reset password';
      
      if (errorMessage.toLowerCase().includes('expired') || 
          errorMessage.toLowerCase().includes('invalid')) {
        setResetError('This reset link has expired or is invalid. Please request a new one.');
      } else {
        setResetError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resendResetEmail = async () => {
    if (resend_cooldown > 0) return;

    setSubmitting(true);
    setResetError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      
      await axios.post(
        `${API_BASE_URL}/api/auth/password-reset/request`,
        { email: email_or_phone },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setResendCooldown(60); // Reset cooldown
    } catch (error) {
      setResetError('Failed to resend. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================================================
  // Validation Handlers
  // ========================================================================

  const validateEmailOrPhone = useCallback(() => {
    if (!email_or_phone.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        email_or_phone: null,
      }));
      return;
    }

    const is_email = isValidEmail(email_or_phone);
    const is_phone = isValidPhone(email_or_phone);

    if (!is_email && !is_phone) {
      setValidationErrors(prev => ({
        ...prev,
        email_or_phone: 'Please enter a valid email address or phone number',
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        email_or_phone: null,
      }));
    }
  }, [email_or_phone]);

  const validatePasswordMatch = useCallback(() => {
    if (!confirm_new_password) {
      setValidationErrors(prev => ({
        ...prev,
        confirm_new_password: null,
      }));
      return;
    }

    if (new_password !== confirm_new_password) {
      setValidationErrors(prev => ({
        ...prev,
        confirm_new_password: 'Passwords do not match',
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        confirm_new_password: null,
      }));
    }
  }, [new_password, confirm_new_password]);

  // ========================================================================
  // Render Functions
  // ========================================================================

  const getPasswordStrengthColor = () => {
    switch (password_strength) {
      case 'weak': return 'bg-red-500';
      case 'fair': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
    }
  };

  const getPasswordStrengthWidth = () => {
    switch (password_strength) {
      case 'weak': return 'w-1/3';
      case 'fair': return 'w-2/3';
      case 'strong': return 'w-full';
    }
  };

  // ========================================================================
  // Main Render
  // ========================================================================

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Progress Indicator */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Step {reset_step} of 4
                </span>
                <span className="text-sm text-gray-500">
                  {reset_step === 1 && 'Request Reset'}
                  {reset_step === 2 && 'Verify'}
                  {reset_step === 3 && 'New Password'}
                  {reset_step === 4 && 'Complete'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(reset_step / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Step Content */}
            <div className="p-8">
              {/* ============================================================ */}
              {/* STEP 1: REQUEST RESET */}
              {/* ============================================================ */}
              {reset_step === 1 && (
                <>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Reset Your Password
                    </h1>
                    <p className="text-gray-600">
                      Enter your email or phone number to receive reset instructions
                    </p>
                  </div>

                  {/* Back to Login Link */}
                  <div className="mb-6">
                    <Link
                      to="/login"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to login
                    </Link>
                  </div>

                  {/* Error Message */}
                  {reset_error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-700">{reset_error}</p>
                      </div>
                    </div>
                  )}

                  {/* Email/Phone Input */}
                  <div className="mb-6">
                    <label htmlFor="email_or_phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Email or Phone Number
                    </label>
                    <input
                      id="email_or_phone"
                      type="text"
                      value={email_or_phone}
                      onChange={(e) => {
                        setEmailOrPhone(e.target.value);
                        setValidationErrors(prev => ({ ...prev, email_or_phone: null }));
                        setResetError(null);
                      }}
                      onBlur={validateEmailOrPhone}
                      placeholder="name@example.com or +1234567890"
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                        validation_errors.email_or_phone
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      }`}
                      autoFocus
                    />
                    {validation_errors.email_or_phone && (
                      <p className="mt-2 text-sm text-red-600" role="alert">
                        {validation_errors.email_or_phone}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      We'll send you a {isValidEmail(email_or_phone) ? 'reset link via email' : 'verification code via SMS'}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={requestPasswordReset}
                    disabled={submitting || !email_or_phone.trim()}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium text-base hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      isValidEmail(email_or_phone) ? 'Send Reset Link' : 'Send Reset Code'
                    )}
                  </button>
                </>
              )}

              {/* ============================================================ */}
              {/* STEP 2: CONFIRMATION */}
              {/* ============================================================ */}
              {reset_step === 2 && (
                <>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      {reset_method === 'email' ? (
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Check Your {reset_method === 'email' ? 'Email' : 'Phone'}
                    </h1>
                    <p className="text-gray-600">
                      {reset_method === 'email' ? (
                        <>
                          We've sent a reset link to<br />
                          <span className="font-medium text-gray-900">{email_or_phone}</span>
                        </>
                      ) : (
                        <>
                          We've sent a verification code to<br />
                          <span className="font-medium text-gray-900">{email_or_phone}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-900">
                      {reset_method === 'email' ? (
                        <>
                          <strong>Next steps:</strong> Click the link in your email to reset your password. 
                          The link expires in 24 hours.
                        </>
                      ) : (
                        <>
                          <strong>Next steps:</strong> Enter the 6-digit code sent to your phone below.
                          The code expires in 15 minutes.
                        </>
                      )}
                    </p>
                  </div>

                  {/* SMS Code Entry (if SMS method) */}
                  {reset_method === 'sms' && (
                    <div className="mb-6">
                      <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                      </label>
                      <input
                        id="verification_code"
                        type="text"
                        maxLength={6}
                        value={verification_code}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setVerificationCode(value);
                          setValidationErrors(prev => ({ ...prev, verification_code: null }));
                        }}
                        placeholder="Enter 6-digit code"
                        className={`w-full px-4 py-3 rounded-lg border-2 text-center text-2xl tracking-widest font-mono transition-all duration-200 ${
                          validation_errors.verification_code
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                        }`}
                        autoFocus
                      />
                      {validation_errors.verification_code && (
                        <p className="mt-2 text-sm text-red-600" role="alert">
                          {validation_errors.verification_code}
                        </p>
                      )}
                      {verification_attempts > 0 && (
                        <p className="mt-2 text-sm text-yellow-600">
                          {3 - verification_attempts} attempt{3 - verification_attempts !== 1 ? 's' : ''} remaining
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={verifyResetCode}
                        disabled={submitting || verification_code.length !== 6 || verification_attempts >= 3}
                        className="w-full mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {submitting ? 'Verifying...' : 'Verify Code'}
                      </button>
                    </div>
                  )}

                  {/* Resend Section */}
                  <div className="text-center mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      Didn't receive it?
                    </p>
                    {resend_cooldown > 0 ? (
                      <p className="text-sm text-gray-500">
                        Resend available in <span className="font-medium">{resend_cooldown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={resendResetEmail}
                        disabled={submitting}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                      >
                        Resend {reset_method === 'email' ? 'link' : 'code'}
                      </button>
                    )}
                  </div>

                  {/* Return to Login */}
                  <div className="text-center mt-4">
                    <Link
                      to="/login"
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Return to login
                    </Link>
                  </div>
                </>
              )}

              {/* ============================================================ */}
              {/* STEP 3: CREATE NEW PASSWORD */}
              {/* ============================================================ */}
              {reset_step === 3 && (
                <>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Create New Password
                    </h1>
                    <p className="text-gray-600">
                      Choose a strong password to secure your account
                    </p>
                  </div>

                  {/* Error Message */}
                  {reset_error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm text-red-700 font-medium">{reset_error}</p>
                          {reset_error.toLowerCase().includes('expired') && (
                            <button
                              type="button"
                              onClick={() => setResetStep(1)}
                              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Request a new reset link
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* New Password Input */}
                  <div className="mb-6">
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="new_password"
                        type={show_password ? 'text' : 'password'}
                        value={new_password}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setValidationErrors(prev => ({ ...prev, new_password: null }));
                          setResetError(null);
                        }}
                        placeholder="Enter new password"
                        className={`w-full px-4 py-3 rounded-lg border-2 pr-12 transition-all duration-200 ${
                          validation_errors.new_password
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                        }`}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!show_password)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {show_password ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {validation_errors.new_password && (
                      <p className="mt-2 text-sm text-red-600" role="alert">
                        {validation_errors.new_password}
                      </p>
                    )}
                  </div>

                  {/* Password Strength Indicator */}
                  {new_password && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Password strength:
                        </span>
                        <span className={`text-sm font-medium capitalize ${
                          password_strength === 'weak' ? 'text-red-600' :
                          password_strength === 'fair' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {password_strength}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()} ${getPasswordStrengthWidth()}`}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Password Requirements Checklist */}
                  <div className="mb-6 bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Password requirements:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        {new_password.length >= 8 ? (
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={`text-sm ${new_password.length >= 8 ? 'text-green-700' : 'text-gray-600'}`}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center">
                        {/[a-zA-Z]/.test(new_password) && /[0-9]/.test(new_password) ? (
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={`text-sm ${/[a-zA-Z]/.test(new_password) && /[0-9]/.test(new_password) ? 'text-green-700' : 'text-gray-600'}`}>
                          Contains letters and numbers
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="mb-6">
                    <label htmlFor="confirm_new_password" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm_new_password"
                        type={show_confirm_password ? 'text' : 'password'}
                        value={confirm_new_password}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value);
                          setValidationErrors(prev => ({ ...prev, confirm_new_password: null }));
                          setResetError(null);
                        }}
                        onBlur={validatePasswordMatch}
                        placeholder="Re-enter new password"
                        className={`w-full px-4 py-3 rounded-lg border-2 pr-12 transition-all duration-200 ${
                          validation_errors.confirm_new_password
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!show_confirm_password)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {show_confirm_password ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {validation_errors.confirm_new_password && (
                      <p className="mt-2 text-sm text-red-600" role="alert">
                        {validation_errors.confirm_new_password}
                      </p>
                    )}
                  </div>

                  {/* Reset Password Button */}
                  <button
                    type="button"
                    onClick={confirmPasswordReset}
                    disabled={
                      submitting ||
                      !new_password ||
                      !confirm_new_password ||
                      new_password !== confirm_new_password ||
                      new_password.length < 8
                    }
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium text-base hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting Password...
                      </span>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </>
              )}

              {/* ============================================================ */}
              {/* STEP 4: SUCCESS CONFIRMATION */}
              {/* ============================================================ */}
              {reset_step === 4 && reset_success && (
                <>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                      <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                      Password Reset Successful!
                    </h1>
                    
                    <p className="text-gray-600 mb-8 text-lg">
                      Your password has been updated successfully.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                      <p className="text-sm text-blue-900">
                        For security, all active sessions have been logged out. 
                        Please sign in with your new password.
                      </p>
                    </div>

                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium text-base hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Go to Login
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>

                    <p className="mt-4 text-sm text-gray-500">
                      Redirecting automatically in 3 seconds...
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Security Notice */}
          {reset_step < 4 && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                {reset_step === 1 && (
                  <>
                    Secure password reset powered by BuildEasy.<br />
                    Your information is protected and never shared.
                  </>
                )}
                {reset_step === 2 && (
                  <>
                    Didn't request this? You can safely ignore this message.<br />
                    Your password will not be changed without verification.
                  </>
                )}
                {reset_step === 3 && (
                  <>
                    Choose a strong password you haven't used before.<br />
                    This keeps your account secure.
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_PasswordReset;