import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const UV_Registration: React.FC = () => {
  // ============================================================================
  // Global State - CRITICAL: Use individual selectors to avoid infinite loops
  // ============================================================================
  
  const isAuthenticated = useAppStore(
    state => state.authentication_state.authentication_status.is_authenticated
  );
  const currentUser = useAppStore(
    state => state.authentication_state.current_user
  );
  const authError = useAppStore(
    state => state.authentication_state.error_message
  );
  const authLoading = useAppStore(
    state => state.authentication_state.authentication_status.is_loading
  );
  const registerUser = useAppStore(state => state.register_user);
  const clearAuthError = useAppStore(state => state.clear_auth_error);

  // ============================================================================
  // URL Parameters & Navigation
  // ============================================================================
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const redirectUrl = searchParams.get('redirect_url') || '/account/dashboard';
  const urlAccountType = searchParams.get('account_type') as 'personal' | 'business' | null;

  // ============================================================================
  // Local Form State
  // ============================================================================
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+1');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<'personal' | 'business'>(
    urlAccountType || 'personal'
  );
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [location, setLocation] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ============================================================================
  // Validation State
  // ============================================================================
  
  const [validationErrors, setValidationErrors] = useState<{
    email: string | null;
    phone: string | null;
    password: string | null;
    confirmPassword: string | null;
    name: string | null;
    companyName: string | null;
    location: string | null;
  }>({
    email: null,
    phone: null,
    password: null,
    confirmPassword: null,
    name: null,
    companyName: null,
    location: null,
  });

  const [touched, setTouched] = useState({
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    name: false,
  });

  // ============================================================================
  // Password Strength Calculation (Client-side)
  // ============================================================================
  
  const passwordStrength = useMemo(() => {
    if (!password) return 'weak';
    
    const hasMinLength = password.length >= 8;
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    // const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password); // unused
    
    if (!hasMinLength) return 'weak';
    if (hasMinLength && (hasLetters || hasNumbers)) return 'fair';
    if (hasMinLength && hasLetters && hasNumbers) return 'strong';
    return 'fair';
  }, [password]);

  const passwordRequirementsMet = useMemo(() => ({
    min_length: password.length >= 8,
    has_letters_numbers: /[a-zA-Z]/.test(password) && /[0-9]/.test(password),
  }), [password]);

  // ============================================================================
  // Redirect if Already Authenticated
  // ============================================================================
  
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, currentUser, redirectUrl, navigate]);

  // ============================================================================
  // Clear Auth Error on Mount
  // ============================================================================
  
  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  // ============================================================================
  // Field Validation Functions
  // ============================================================================
  
  const validateEmail = (value: string): string | null => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  };

  const validatePhone = (value: string): string | null => {
    if (!value || value === '+1') return 'Phone number is required';
    const phoneRegex = /^\+1[0-9]{10}$/;
    if (!phoneRegex.test(value)) return 'Please enter a valid US phone number';
    return null;
  };

  const validatePassword = (value: string): string | null => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
      return 'Password must contain both letters and numbers';
    }
    return null;
  };

  const validateConfirmPassword = (value: string): string | null => {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return null;
  };

  const validateName = (value: string): string | null => {
    if (!value.trim()) return 'Please enter your name';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    return null;
  };

  const validateCompanyName = (value: string): string | null => {
    if (accountType === 'business' && !value.trim()) {
      return 'Company name is required for business accounts';
    }
    return null;
  };

  const validateLocation = (value: string): string | null => {
    if (!value.trim()) return 'Location is required';
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(value.trim())) return 'Please enter a valid 5-digit ZIP code';
    return null;
  };

  // ============================================================================
  // Field Blur Handlers
  // ============================================================================
  
  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    const error = validateEmail(email);
    setValidationErrors(prev => ({ ...prev, email: error }));
  };

  const handlePhoneBlur = () => {
    setTouched(prev => ({ ...prev, phone: true }));
    const error = validatePhone(phone);
    setValidationErrors(prev => ({ ...prev, phone: error }));
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    const error = validatePassword(password);
    setValidationErrors(prev => ({ ...prev, password: error }));
  };
  
  const handleConfirmPasswordBlur = () => {
    setTouched(prev => ({ ...prev, confirmPassword: true }));
    const error = validateConfirmPassword(confirmPassword);
    setValidationErrors(prev => ({ ...prev, confirmPassword: error }));
  };

  const handleNameBlur = () => {
    setTouched(prev => ({ ...prev, name: true }));
    const error = validateName(name);
    setValidationErrors(prev => ({ ...prev, name: error }));
  };

  // ============================================================================
  // Form Change Handlers (Clear errors on change)
  // ============================================================================
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (touched.email) {
      const error = validateEmail(e.target.value);
      setValidationErrors(prev => ({ ...prev, email: error }));
    }
    clearAuthError();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Ensure +1 prefix
    if (!value.startsWith('+1')) {
      value = '+1' + value.replace(/[^0-9]/g, '');
    }
    setPhone(value);
    if (touched.phone) {
      const error = validatePhone(value);
      setValidationErrors(prev => ({ ...prev, phone: error }));
    }
    clearAuthError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (touched.password) {
      const error = validatePassword(e.target.value);
      setValidationErrors(prev => ({ ...prev, password: error }));
    }
    // Re-validate confirm password if it's been filled
    if (confirmPassword) {
      const confirmError = e.target.value !== confirmPassword ? 'Passwords do not match' : null;
      setValidationErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
    clearAuthError();
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (touched.confirmPassword) {
      const error = validateConfirmPassword(e.target.value);
      setValidationErrors(prev => ({ ...prev, confirmPassword: error }));
    }
    clearAuthError();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (touched.name) {
      const error = validateName(e.target.value);
      setValidationErrors(prev => ({ ...prev, name: error }));
    }
    clearAuthError();
  };

  // ============================================================================
  // Form Submission
  // ============================================================================
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();

    // Mark all fields as touched
    setTouched({
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      name: true,
    });

    // Validate all fields
    const errors = {
      email: validateEmail(email),
      phone: validatePhone(phone),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
      name: validateName(name),
      companyName: validateCompanyName(companyName),
      location: validateLocation(location),
    };

    setValidationErrors(errors);

    // Check if any errors exist
    const hasErrors = Object.values(errors).some(error => error !== null);
    
    if (hasErrors) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors).find(
        key => errors[key as keyof typeof errors] !== null
      );
      document.getElementById(firstErrorField || 'email')?.focus();
      return;
    }

    if (!termsAccepted) {
      alert('Please accept the Terms of Service and Privacy Policy to continue');
      return;
    }

    try {
      await registerUser({
        email,
        phone,
        password, // Plain text per DRD requirements
        name,
        role: 'customer', // Default role
        account_type: accountType,
      });

      // Success - user is now logged in via store
      // Redirect handled by useEffect above
      
    } catch (error) {
      // Error is set in store's authentication_state.error_message
      console.error('Registration error:', error);
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ============================================================================
  // Form Validation State
  // ============================================================================
  
  const isFormValid = useMemo(() => {
    const basicFieldsValid = 
      email.length > 0 &&
      phone.length > 3 &&
      password.length >= 8 &&
      confirmPassword === password &&
      name.trim().length >= 2 &&
      location.trim().length >= 5;
    
    const businessFieldsValid = accountType === 'personal' || 
      (accountType === 'business' && companyName.trim().length > 0);
    
    const noValidationErrors = !Object.values(validationErrors).some(err => err !== null);
    
    return basicFieldsValid && businessFieldsValid && termsAccepted && noValidationErrors;
  }, [email, phone, password, confirmPassword, name, location, accountType, companyName, termsAccepted, validationErrors]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
              <span className="text-2xl font-bold text-white">BE</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600 text-lg">
              Join thousands of satisfied customers
            </p>
          </div>

          {/* Main Registration Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 lg:p-8">
              {/* Error Message */}
              {authError && (
                <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4" role="alert" aria-live="polite">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-red-800 font-medium">{authError}</p>
                      {authError.includes('already registered') && (
                        <Link 
                          to="/login" 
                          className="text-red-700 underline text-sm mt-1 inline-block hover:text-red-900"
                        >
                          Log in instead
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Social Registration Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  onClick={() => alert('Google OAuth not yet implemented')}
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
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  onClick={() => alert('Apple OAuth not yet implemented')}
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </button>

                <button
                  type="button"
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  onClick={() => alert('Facebook OAuth not yet implemented')}
                >
                  <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or register with email</span>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    placeholder="John Doe"
                    autoComplete="name"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                      touched.name && validationErrors.name
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    } focus:outline-none`}
                  />
                  {touched.name && validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600" role="alert">{validationErrors.name}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    placeholder="john@example.com"
                    autoComplete="email"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                      touched.email && validationErrors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    } focus:outline-none`}
                  />
                  {touched.email && validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600" role="alert">{validationErrors.email}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                    placeholder="+15551234567"
                    autoComplete="tel"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                      touched.phone && validationErrors.phone
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    } focus:outline-none`}
                  />
                  {touched.phone && validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-600" role="alert">{validationErrors.phone}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Format: +1 followed by 10 digits</p>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={handlePasswordBlur}
                      placeholder="Enter a strong password"
                      autoComplete="new-password"
                      className={`w-full px-4 py-3 pr-12 rounded-lg border-2 transition-colors ${
                        touched.password && validationErrors.password
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      } focus:outline-none`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
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
                  
                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                              passwordStrength === 'fair' ? 'w-2/3 bg-orange-500' :
                              'w-full bg-green-500'
                            }`}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordStrength === 'weak' ? 'text-red-600' :
                          passwordStrength === 'fair' ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {passwordStrength === 'weak' ? 'Weak' :
                           passwordStrength === 'fair' ? 'Fair' :
                           'Strong'}
                        </span>
                      </div>
                      
                      {/* Password Requirements Checklist */}
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          {passwordRequirementsMet.min_length ? (
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className={passwordRequirementsMet.min_length ? 'text-green-700' : 'text-gray-600'}>
                            At least 8 characters
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          {passwordRequirementsMet.has_letters_numbers ? (
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className={passwordRequirementsMet.has_letters_numbers ? 'text-green-700' : 'text-gray-600'}>
                            Mix of letters and numbers
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {touched.password && validationErrors.password && (
                    <p className="mt-1 text-sm text-red-600" role="alert">{validationErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onBlur={handleConfirmPasswordBlur}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className={`w-full px-4 py-3 pr-12 rounded-lg border-2 transition-colors ${
                        touched.confirmPassword && validationErrors.confirmPassword
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      } focus:outline-none`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
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
                  {touched.confirmPassword && validationErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600" role="alert">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Account Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label
                      className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        accountType === 'personal'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountType"
                        value="personal"
                        checked={accountType === 'personal'}
                        onChange={(e) => setAccountType(e.target.value as 'personal')}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Personal Account</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          accountType === 'personal' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {accountType === 'personal' && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">For individual shoppers and DIY projects</p>
                    </label>

                    <label
                      className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        accountType === 'business'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountType"
                        value="business"
                        checked={accountType === 'business'}
                        onChange={(e) => setAccountType(e.target.value as 'business')}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Business Account</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          accountType === 'business' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {accountType === 'business' && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">For contractors, project managers, and companies</p>
                    </label>
                  </div>
                </div>

                {/* Business Fields (Conditional) */}
                {accountType === 'business' && (
                  <div className="space-y-4 border-l-4 border-blue-500 pl-4 animate-fadeIn">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="companyName"
                        type="text"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          const error = validateCompanyName(e.target.value);
                          setValidationErrors(prev => ({ ...prev, companyName: error }));
                        }}
                        placeholder="ABC Construction LLC"
                        autoComplete="organization"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-colors"
                      />
                      {validationErrors.companyName && (
                        <p className="mt-1 text-sm text-red-600" role="alert">{validationErrors.companyName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                        Tax ID <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      <input
                        id="taxId"
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="12-3456789"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-colors"
                      />
                      <p className="mt-1 text-xs text-gray-500">You can add this later in your account settings</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Location (ZIP Code) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      const error = validateLocation(e.target.value);
                      setValidationErrors(prev => ({ ...prev, location: error }));
                    }}
                    placeholder="90210"
                    autoComplete="postal-code"
                    maxLength={5}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                      validationErrors.location
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    } focus:outline-none`}
                  />
                  {validationErrors.location && (
                    <p className="mt-1 text-sm text-red-600" role="alert">{validationErrors.location}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">For delivery matching and supplier recommendations</p>
                </div>

                {/* Terms and Conditions */}
                <div>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      I agree to the{' '}
                      <Link to="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 underline font-medium">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 underline font-medium">
                        Privacy Policy
                      </Link>
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={!isFormValid || authLoading}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {authLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Login
                    </Link>
                  </p>
                </div>

                {/* Privacy Note */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    🔒 We respect your privacy. Your data is secure.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Registration;