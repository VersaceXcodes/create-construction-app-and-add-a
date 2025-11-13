import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import axios from 'axios';

// ============================================================================
// Type Definitions
// ============================================================================

interface CookiePreferences {
  strictly_necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieDetail {
  cookie_name: string;
  purpose: string;
  duration: string;
  provider: string;
}

interface CookieCategory {
  category_name: string;
  category_description: string;
  is_required: boolean;
  cookies: CookieDetail[];
}

interface ThirdPartyPartner {
  partner_name: string;
  partner_purpose: string;
  privacy_policy_url: string;
}

// ============================================================================
// Static Cookie Policy Content
// ============================================================================

const LAST_UPDATED = 'January 15, 2024';

const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    category_name: 'Strictly Necessary Cookies',
    category_description: 'These cookies are essential for the platform to function and cannot be disabled. They enable core functionality like authentication, shopping cart, and security features.',
    is_required: true,
    cookies: [
      {
        cookie_name: 'auth_token',
        purpose: 'Maintains user login session and authentication status',
        duration: '7 days',
        provider: 'BuildEasy (First-party)',
      },
      {
        cookie_name: 'session_id',
        purpose: 'Tracks user session for cart persistence and security',
        duration: 'Session',
        provider: 'BuildEasy (First-party)',
      },
      {
        cookie_name: 'cart_id',
        purpose: 'Identifies shopping cart and reserved items',
        duration: '30 days',
        provider: 'BuildEasy (First-party)',
      },
      {
        cookie_name: 'CSRF-TOKEN',
        purpose: 'Protects against cross-site request forgery attacks',
        duration: 'Session',
        provider: 'BuildEasy (First-party)',
      },
    ],
  },
  {
    category_name: 'Functional Cookies',
    category_description: 'These cookies enhance your experience by remembering your preferences, settings, and choices. They are optional and can be disabled.',
    is_required: false,
    cookies: [
      {
        cookie_name: 'user_location',
        purpose: 'Remembers your postal code for delivery estimates',
        duration: '90 days',
        provider: 'BuildEasy (First-party)',
      },
      {
        cookie_name: 'preferred_currency',
        purpose: 'Stores your currency preference',
        duration: '365 days',
        provider: 'BuildEasy (First-party)',
      },
      {
        cookie_name: 'ui_preferences',
        purpose: 'Remembers your view preferences (grid/list, sort order)',
        duration: '180 days',
        provider: 'BuildEasy (First-party)',
      },
      {
        cookie_name: 'language_preference',
        purpose: 'Stores your language selection',
        duration: '365 days',
        provider: 'BuildEasy (First-party)',
      },
    ],
  },
  {
    category_name: 'Analytics Cookies',
    category_description: 'These cookies help us understand how visitors use our platform. We use this information to improve user experience and platform performance.',
    is_required: false,
    cookies: [
      {
        cookie_name: '_ga',
        purpose: 'Google Analytics - tracks unique visitors and sessions',
        duration: '2 years',
        provider: 'Google Analytics (Third-party)',
      },
      {
        cookie_name: '_ga_*',
        purpose: 'Google Analytics - measures page views and interactions',
        duration: '2 years',
        provider: 'Google Analytics (Third-party)',
      },
      {
        cookie_name: '_gid',
        purpose: 'Google Analytics - distinguishes users',
        duration: '24 hours',
        provider: 'Google Analytics (Third-party)',
      },
      {
        cookie_name: '_gat',
        purpose: 'Google Analytics - throttles request rate',
        duration: '1 minute',
        provider: 'Google Analytics (Third-party)',
      },
    ],
  },
  {
    category_name: 'Marketing Cookies',
    category_description: 'These cookies are used to show you personalized advertisements and track campaign effectiveness. They require your explicit consent.',
    is_required: false,
    cookies: [
      {
        cookie_name: '_fbp',
        purpose: 'Facebook Pixel - tracks conversions and builds audiences',
        duration: '90 days',
        provider: 'Facebook (Third-party)',
      },
      {
        cookie_name: 'fr',
        purpose: 'Facebook - delivers and measures ad effectiveness',
        duration: '90 days',
        provider: 'Facebook (Third-party)',
      },
      {
        cookie_name: 'IDE',
        purpose: 'Google DoubleClick - serves targeted advertisements',
        duration: '1 year',
        provider: 'Google (Third-party)',
      },
    ],
  },
];

const THIRD_PARTY_PARTNERS: ThirdPartyPartner[] = [
  {
    partner_name: 'Google Analytics',
    partner_purpose: 'Website usage tracking and analytics to improve platform performance',
    privacy_policy_url: 'https://policies.google.com/privacy',
  },
  {
    partner_name: 'Stripe',
    partner_purpose: 'Secure payment processing for orders',
    privacy_policy_url: 'https://stripe.com/privacy',
  },
  {
    partner_name: 'Facebook',
    partner_purpose: 'Social media integration and targeted advertising',
    privacy_policy_url: 'https://www.facebook.com/privacy',
  },
];

// ============================================================================
// Cookie Policy Component
// ============================================================================

const UV_CookiePolicy: React.FC = () => {
  // CRITICAL: Individual selectors to avoid infinite loops
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  // Local component state
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>({
    strictly_necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [preferencesSavedSuccess, setPreferencesSavedSuccess] = useState(false);

  // ========================================================================
  // Load Current Cookie Preferences
  // ========================================================================

  useEffect(() => {
    loadCurrentCookiePreferences();
  }, [currentUser]);

  const loadCurrentCookiePreferences = () => {
    if (currentUser) {
      // For authenticated users, preferences would be in user object
      // Since the backend doesn't have cookie preference fields in user schema,
      // we'll check localStorage as fallback
      const stored = localStorage.getItem('cookieConsent');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCookiePreferences({
            strictly_necessary: true, // Always true
            functional: parsed.functional ?? false,
            analytics: parsed.analytics ?? false,
            marketing: parsed.marketing ?? false,
          });
        } catch (e) {
          console.error('Failed to parse cookie preferences:', e);
        }
      }
    } else {
      // Guest user - read from localStorage
      const stored = localStorage.getItem('cookieConsent');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCookiePreferences({
            strictly_necessary: true, // Always true
            functional: parsed.functional ?? false,
            analytics: parsed.analytics ?? false,
            marketing: parsed.marketing ?? false,
          });
        } catch (e) {
          console.error('Failed to parse cookie preferences:', e);
        }
      }
    }
  };

  // ========================================================================
  // Save Cookie Preferences
  // ========================================================================

  const saveCookiePreferences = async (preferences: CookiePreferences) => {
    setSavingPreferences(true);
    setPreferencesSavedSuccess(false);

    try {
      // Save to localStorage (works for both guest and authenticated)
      localStorage.setItem('cookieConsent', JSON.stringify({
        functional: preferences.functional,
        analytics: preferences.analytics,
        marketing: preferences.marketing,
        timestamp: new Date().toISOString(),
      }));

      // For authenticated users, could also save to backend
      // But since user_preferences schema doesn't have cookie fields,
      // we'll just use localStorage for now
      
      setCookiePreferences(preferences);
      setPreferencesSavedSuccess(true);
      
      // Apply cookie loading/blocking logic based on preferences
      applyCookiePreferences(preferences);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setPreferencesSavedSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save cookie preferences:', error);
    } finally {
      setSavingPreferences(false);
    }
  };

  // ========================================================================
  // Apply Cookie Preferences (Load/Block Scripts)
  // ========================================================================

  const applyCookiePreferences = (preferences: CookiePreferences) => {
    // Analytics cookies
    if (preferences.analytics) {
      // Load Google Analytics if not already loaded
      if (!window.gtag) {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
        document.head.appendChild(script);
      }
    } else {
      // Block or remove analytics scripts
      // Remove GA cookies if present
      document.cookie.split(';').forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim();
        if (cookieName.startsWith('_ga') || cookieName.startsWith('_gid')) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
    }

    // Marketing cookies
    if (preferences.marketing) {
      // Load marketing pixels if not already loaded
      // Facebook Pixel, etc.
    } else {
      // Block or remove marketing cookies
      document.cookie.split(';').forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim();
        if (cookieName.startsWith('_fbp') || cookieName === 'fr') {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
    }

    // Functional cookies are allowed/blocked similarly
  };

  // ========================================================================
  // Quick Action Handlers
  // ========================================================================

  const handleAcceptAll = async () => {
    const allAccepted: CookiePreferences = {
      strictly_necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    await saveCookiePreferences(allAccepted);
    setPreferencesModalOpen(false);
  };

  const handleRejectNonEssential = async () => {
    const onlyNecessary: CookiePreferences = {
      strictly_necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    await saveCookiePreferences(onlyNecessary);
    setPreferencesModalOpen(false);
  };

  const handleSavePreferences = async () => {
    await saveCookiePreferences(cookiePreferences);
    
    // Close modal after short delay to show success message
    setTimeout(() => {
      setPreferencesModalOpen(false);
    }, 1500);
  };

  const handlePrintPolicy = () => {
    window.print();
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <>
      {/* Main Cookie Policy Page */}
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
                <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
              </div>
              <button
                onClick={handlePrintPolicy}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Policy Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Introduction */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit our website. 
                They help us provide you with a better experience by remembering your preferences, understanding how you use our platform, 
                and improving our services.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Keep you signed in to your account</li>
                <li>Remember items in your shopping cart</li>
                <li>Understand how you navigate our platform</li>
                <li>Personalize your experience and show relevant content</li>
                <li>Improve our platform security and performance</li>
              </ul>
            </div>
          </section>

          {/* Types of Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              {COOKIE_CATEGORIES.map((category, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Category Header */}
                  <div className={`px-8 py-6 ${category.is_required ? 'bg-blue-50 border-b border-blue-100' : 'bg-gray-50 border-b border-gray-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {category.category_name}
                          </h3>
                          {category.is_required && (
                            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                              Always Active
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                          {category.category_description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cookie Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Cookie Name
                          </th>
                          <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Purpose
                          </th>
                          <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Provider
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {category.cookies.map((cookie, cookieIdx) => (
                          <tr key={cookieIdx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-8 py-4">
                              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-blue-600">
                                {cookie.cookie_name}
                              </code>
                            </td>
                            <td className="px-8 py-4 text-sm text-gray-700">
                              {cookie.purpose}
                            </td>
                            <td className="px-8 py-4 text-sm text-gray-600">
                              {cookie.duration}
                            </td>
                            <td className="px-8 py-4 text-sm text-gray-600">
                              {cookie.provider}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Managing Cookies */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Managing Your Cookie Preferences</h2>
            
            <div className="space-y-6">
              {/* Cookie Preferences Button */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Cookie Preferences
                    </h3>
                    <p className="text-gray-600">
                      You can control which cookies we use by managing your preferences below.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferencesModalOpen(true)}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Manage Preferences</span>
                  </button>
                </div>
              </div>

              {/* Browser Controls */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Browser Settings</h3>
                <p className="text-gray-700 mb-4">
                  You can also control cookies through your web browser settings. Here's how:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Chrome:</strong>{' '}
                      <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                        Managing cookies in Chrome
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Firefox:</strong>{' '}
                      <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                        Managing cookies in Firefox
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Safari:</strong>{' '}
                      <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                        Managing cookies in Safari
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Edge:</strong>{' '}
                      <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                        Managing cookies in Edge
                      </a>
                    </span>
                  </li>
                </ul>
                
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Disabling certain cookies may affect some features of our platform. 
                      For example, you won't be able to stay logged in or maintain items in your cart.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-gray-700 mb-6">
              We work with the following trusted partners who may set cookies on our platform:
            </p>
            
            <div className="space-y-4">
              {THIRD_PARTY_PARTNERS.map((partner, index) => (
                <div 
                  key={index}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{partner.partner_name}</h4>
                    <p className="text-sm text-gray-600">{partner.partner_purpose}</p>
                  </div>
                  <a
                    href={partner.privacy_policy_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 rounded-md hover:bg-blue-50 transition-all whitespace-nowrap"
                  >
                    Privacy Policy →
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* More Information */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">More Information</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                If you have questions about our cookie policy or privacy practices, please:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/contact"
                  className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">Contact Us</div>
                    <div className="text-xs text-gray-600">Get in touch</div>
                  </div>
                </Link>
                
                <Link
                  to="/privacy"
                  className="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">Privacy Policy</div>
                    <div className="text-xs text-gray-600">Read full policy</div>
                  </div>
                </Link>
                
                <button
                  onClick={() => setPreferencesModalOpen(true)}
                  className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">Update Preferences</div>
                    <div className="text-xs text-gray-600">Change settings</div>
                  </div>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Cookie Preferences Modal */}
      {preferencesModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
            onClick={() => !savingPreferences && setPreferencesModalOpen(false)}
          ></div>

          {/* Modal */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-xl z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900" id="modal-title">
                      Cookie Preferences
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Manage your cookie consent settings
                    </p>
                  </div>
                  <button
                    onClick={() => !savingPreferences && setPreferencesModalOpen(false)}
                    disabled={savingPreferences}
                    className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-8 py-6 space-y-6">
                {/* Success Message */}
                {preferencesSavedSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-green-800">
                      Your preferences have been saved successfully!
                    </p>
                  </div>
                )}

                {/* Strictly Necessary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">Strictly Necessary Cookies</h4>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          Always Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        These cookies are essential for the website to function and cannot be disabled.
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center cursor-not-allowed opacity-75">
                        <div className="w-5 h-5 bg-white rounded-full shadow-md transform translate-x-7"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Functional Cookies</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        These cookies remember your preferences and settings to enhance your experience.
                      </p>
                      <p className="text-xs text-gray-500">
                        Examples: Location preferences, language settings, view preferences
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setCookiePreferences(prev => ({
                          ...prev,
                          functional: !prev.functional,
                        }))
                      }
                      disabled={savingPreferences}
                      className="ml-4 focus:outline-none disabled:opacity-50"
                    >
                      <div className={`w-12 h-6 rounded-full transition-colors ${cookiePreferences.functional ? 'bg-green-600' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${cookiePreferences.functional ? 'translate-x-7' : 'translate-x-1'} mt-0.5`}></div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Analytics Cookies</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        These cookies help us understand how you use our platform so we can improve it.
                      </p>
                      <p className="text-xs text-gray-500">
                        Examples: Page views, session duration, conversion tracking
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setCookiePreferences(prev => ({
                          ...prev,
                          analytics: !prev.analytics,
                        }))
                      }
                      disabled={savingPreferences}
                      className="ml-4 focus:outline-none disabled:opacity-50"
                    >
                      <div className={`w-12 h-6 rounded-full transition-colors ${cookiePreferences.analytics ? 'bg-green-600' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${cookiePreferences.analytics ? 'translate-x-7' : 'translate-x-1'} mt-0.5`}></div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Marketing Cookies</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        These cookies enable personalized advertising and measure campaign effectiveness.
                      </p>
                      <p className="text-xs text-gray-500">
                        Examples: Ad targeting, remarketing, conversion tracking
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setCookiePreferences(prev => ({
                          ...prev,
                          marketing: !prev.marketing,
                        }))
                      }
                      disabled={savingPreferences}
                      className="ml-4 focus:outline-none disabled:opacity-50"
                    >
                      <div className={`w-12 h-6 rounded-full transition-colors ${cookiePreferences.marketing ? 'bg-green-600' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${cookiePreferences.marketing ? 'translate-x-7' : 'translate-x-1'} mt-0.5`}></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 rounded-b-xl">
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleRejectNonEssential}
                    disabled={savingPreferences}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    disabled={savingPreferences}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    {savingPreferences ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Preferences</span>
                    )}
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    disabled={savingPreferences}
                    className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_CookiePolicy;