import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const UV_Login: React.FC = () => {
  // ============================================================================
  // CRITICAL: Individual Zustand Selectors (NO object destructuring)
  // ============================================================================
  
  const isAuthenticated = useAppStore(
    state => state.authentication_state.authentication_status.is_authenticated
  );
  const isLoading = useAppStore(
    state => state.authentication_state.authentication_status.is_loading
  );
  const currentUser = useAppStore(
    state => state.authentication_state.current_user
  );
  const errorMessage = useAppStore(
    state => state.authentication_state.error_message
  );
  const loginUser = useAppStore(state => state.login_user);
  const clearAuthError = useAppStore(state => state.clear_auth_error);

  // ============================================================================
  // Navigation & URL Parameters
  // ============================================================================
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  // ============================================================================
  // Local Component State
  // ============================================================================
  
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email_or_phone: string | null;
    password: string | null;
  }>({
    email_or_phone: null,
    password: null,
  });
  const [submitting, setSubmitting] = useState(false);

  // ============================================================================
  // Redirect Logic - If Already Authenticated
  // ============================================================================
  
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Determine dashboard based on user role
      const dashboardMap: Record<string, string> = {
        customer: '/account/dashboard',
        supplier: '/supplier/dashboard',
        admin: '/admin/dashboard',
      };
      const targetUrl = redirectUrl || dashboardMap[currentUser.role] || '/';
      navigate(targetUrl, { replace: true });
    }
  }, [isAuthenticated, currentUser, redirectUrl, navigate]);

  // ============================================================================
  // Clear Errors When User Starts Typing
  // ============================================================================
  
  useEffect(() => {
    if (errorMessage) {
      clearAuthError();
    }
  }, [emailOrPhone, password]);

  // ============================================================================
  // Email/Phone Format Validation
  // ============================================================================
  
  const validateEmailOrPhone = (value: string): boolean => {
    // Email validation (RFC 5322 simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Phone validation (E.164 format)
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    
    // Remove common phone formatting characters for validation
    const cleanedValue = value.replace(/[\s()-]/g, '');
    
    return emailRegex.test(value) || phoneRegex.test(cleanedValue);
  };

  const handleEmailOrPhoneBlur = () => {
    if (emailOrPhone && !validateEmailOrPhone(emailOrPhone)) {
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
  };

  // ============================================================================
  // Form Submission Handler
  // ============================================================================
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset validation errors
    setValidationErrors({
      email_or_phone: null,
      password: null,
    });

    // Client-side validation
    if (!emailOrPhone) {
      setValidationErrors(prev => ({
        ...prev,
        email_or_phone: 'Email or phone number is required',
      }));
      return;
    }

    if (!validateEmailOrPhone(emailOrPhone)) {
      setValidationErrors(prev => ({
        ...prev,
        email_or_phone: 'Please enter a valid email address or phone number',
      }));
      return;
    }

    if (!password) {
      setValidationErrors(prev => ({
        ...prev,
        password: 'Password is required',
      }));
      return;
    }

    if (password.length < 8) {
      setValidationErrors(prev => ({
        ...prev,
        password: 'Password must be at least 8 characters',
      }));
      return;
    }

    setSubmitting(true);

    try {
      // CRITICAL: Call global store login function (handles API call internally)
      await loginUser(emailOrPhone, password);
      // Success - useEffect above will handle redirect
    } catch (error) {
      // Error is set in store's error_message and displayed automatically
      setSubmitting(false);
      // Clear password for security
      setPassword('');
    }
  };

  // ============================================================================
  // Social Login Handlers
  // ============================================================================
  
  const handleSocialLogin = (provider: 'google' | 'apple' | 'facebook') => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const redirectPath = redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : '';
    window.location.href = `${baseUrl}/api/auth/${provider}${redirectPath}`;
  };

  // ============================================================================
  // Component Render
  // ============================================================================
  
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Main Login Card */}
          <div className="bg-white shadow-2xl shadow-gray-200/50 rounded-2xl overflow-hidden">
            {/* Header Section */}
            <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100">
              {/* BuildEasy Logo */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">BE</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Sign in to your BuildEasy account
              </p>
            </div>

            <div className="px-8 py-6">
              {/* Error Display Area */}
              {errorMessage && (
                <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3" role="alert" aria-live="assertive">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                    {errorMessage.toLowerCase().includes('locked') && (
                      <p className="text-xs text-red-600 mt-1">
                        Please try again in 15 minutes or{' '}
                        <Link to="/password-reset" className="underline hover:no-underline font-medium">
                          reset your password
                        </Link>
                      </p>
                    )}
                    {errorMessage.toLowerCase().includes('suspended') && (
                      <p className="text-xs text-red-600 mt-1">
                        Please{' '}
                        <Link to="/contact" className="underline hover:no-underline font-medium">
                          contact support
                        </Link>{' '}
                        for assistance
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Social Login Section */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={submitting || isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('apple')}
                  disabled={submitting || isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={submitting || isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>
              </div>

              {/* OR Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or sign in with email</span>
                </div>
              </div>

              {/* Email/Phone Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Email or Phone Number Field */}
                <div>
                  <label htmlFor="email-or-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Email or Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email-or-phone"
                      name="email-or-phone"
                      type="text"
                      autoComplete="email"
                      required
                      autoFocus
                      value={emailOrPhone}
                      onChange={(e) => {
                        setEmailOrPhone(e.target.value);
                        if (validationErrors.email_or_phone) {
                          setValidationErrors(prev => ({ ...prev, email_or_phone: null }));
                        }
                      }}
                      onBlur={handleEmailOrPhoneBlur}
                      placeholder="you@example.com or +1234567890"
                      aria-invalid={validationErrors.email_or_phone !== null}
                      aria-describedby={validationErrors.email_or_phone ? "email-error" : undefined}
                      className={`block w-full pl-12 pr-12 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 transition-all duration-200 placeholder-gray-400 ${
                        validationErrors.email_or_phone
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                      disabled={submitting || isLoading}
                    />
                    {emailOrPhone && validateEmailOrPhone(emailOrPhone) && !validationErrors.email_or_phone && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {validationErrors.email_or_phone && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {validationErrors.email_or_phone && (
                    <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
                      {validationErrors.email_or_phone}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (validationErrors.password) {
                          setValidationErrors(prev => ({ ...prev, password: null }));
                        }
                      }}
                      placeholder="Enter your password"
                      aria-invalid={validationErrors.password !== null}
                      aria-describedby={validationErrors.password ? "password-error" : undefined}
                      className={`block w-full pl-12 pr-12 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 transition-all duration-200 placeholder-gray-400 ${
                        validationErrors.password
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                      disabled={submitting || isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-700 transition-colors focus:outline-none"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p id="password-error" className="mt-2 text-sm text-red-600" role="alert">
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me and Forgot Password Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
                      Remember me
                      <span 
                        className="ml-1 text-gray-400 cursor-help" 
                        title="Keep me signed in for 30 days"
                        aria-label="Keep me signed in for 30 days"
                      >
                        ⓘ
                      </span>
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      to="/password-reset"
                      className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Login Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || isLoading || !emailOrPhone || !password}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:hover:shadow-lg"
                  >
                    {submitting || isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer - Create Account Section */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>

          {/* Legal Links */}
          <p className="mt-6 text-center text-xs text-gray-500 leading-relaxed">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default UV_Login;