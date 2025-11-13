import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import axios from 'axios';

// ============================================================================
// Types
// ============================================================================

interface PrivacySection {
  section_id: string;
  section_title: string;
  section_content: string;
  subsections?: {
    subsection_title: string;
    subsection_content: string;
  }[];
}

interface TOCItem {
  section_id: string;
  section_title: string;
  anchor: string;
}

// ============================================================================
// Static Privacy Policy Content
// ============================================================================

const PRIVACY_POLICY_CONTENT = {
  document_title: 'Privacy Policy',
  last_updated: '2024-01-15',
  effective_date: '2024-01-01',
  sections: [
    {
      section_id: 'introduction',
      section_title: '1. Introduction',
      section_content: 'BuildEasy Inc. ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our construction materials marketplace platform. By using BuildEasy, you consent to the data practices described in this policy. This policy applies to all users of our platform, including customers, suppliers, and visitors.',
      subsections: []
    },
    {
      section_id: 'information-we-collect',
      section_title: '2. Information We Collect',
      section_content: 'We collect several types of information from and about users of our platform:',
      subsections: [
        {
          subsection_title: '2.1 Information You Provide',
          subsection_content: 'We collect information that you voluntarily provide to us when you register for an account, make a purchase, communicate with us, or otherwise use our services. This includes: your name, email address, phone number, physical address, payment information (processed securely through third-party payment processors), business information for business accounts (company name, tax ID, business registration number), delivery preferences and special instructions, communication preferences, and any other information you choose to provide.'
        },
        {
          subsection_title: '2.2 Information From Your Device',
          subsection_content: 'When you access our platform, we automatically collect certain information about your device and usage, including: IP address, browser type and version, device type and identifiers, operating system, referring URLs, pages viewed and time spent on pages, search queries within our platform, date and time of your visit, cookies and similar tracking technologies, location data (with your permission), and crash reports and performance data.'
        },
        {
          subsection_title: '2.3 Information From Third Parties',
          subsection_content: 'We may receive information about you from third parties, including: social media platforms when you use social login features (Google, Apple, Facebook), payment processors regarding transaction details and fraud prevention, delivery carriers providing shipment tracking and delivery confirmation, analytics providers offering insights on platform usage, and marketing partners for promotional campaigns (with your consent).'
        },
        {
          subsection_title: '2.4 Sensitive Information',
          subsection_content: 'For business accounts, we may collect sensitive business information including tax identification numbers, business financial information for trade credit applications, business registration documents, and insurance certificates. We handle this information with enhanced security measures and restrict access to authorized personnel only.'
        }
      ]
    },
    {
      section_id: 'how-we-use',
      section_title: '3. How We Use Your Information',
      section_content: 'We use the information we collect for the following purposes:',
      subsections: [
        {
          subsection_title: '3.1 Provide Platform Services',
          subsection_content: 'To create and manage your account, process and fulfill your orders, facilitate communication between buyers and suppliers, handle payments and refunds, provide customer support, manage deliveries and shipment tracking, and process returns and disputes.'
        },
        {
          subsection_title: '3.2 Improve User Experience',
          subsection_content: 'To personalize your experience with tailored product recommendations, remember your preferences and settings, analyze platform usage to improve features, conduct research and development, test new features and functionality, and optimize our search and discovery tools.'
        },
        {
          subsection_title: '3.3 Communicate With You',
          subsection_content: 'To send order confirmations and shipping updates, respond to your inquiries and support requests, send administrative messages about your account, provide marketing communications if you opted in, notify you of platform updates and new features, and send safety and security alerts.'
        },
        {
          subsection_title: '3.4 Ensure Security and Prevent Fraud',
          subsection_content: 'To detect and prevent fraudulent transactions, verify user identities and business credentials, monitor for suspicious activity, protect against spam and abuse, enforce our Terms of Service, and maintain platform integrity and security.'
        },
        {
          subsection_title: '3.5 Comply With Legal Obligations',
          subsection_content: 'To respond to legal requests and court orders, comply with tax reporting requirements, resolve disputes and enforce agreements, meet regulatory compliance obligations, and protect our rights and the rights of others.'
        }
      ]
    },
    {
      section_id: 'how-we-share',
      section_title: '4. How We Share Your Information',
      section_content: 'We share your information with third parties only as described below:',
      subsections: [
        {
          subsection_title: '4.1 With Suppliers',
          subsection_content: 'When you place an order, we share your contact information and delivery address with the supplier fulfilling your order. This is necessary to complete the transaction and deliver your purchase. Suppliers are contractually obligated to protect your information and use it only for order fulfillment.'
        },
        {
          subsection_title: '4.2 With Service Providers',
          subsection_content: 'We work with trusted third-party service providers who perform services on our behalf, including: payment processors (Stripe, PayPal) for secure payment transactions, logistics and delivery partners for shipment and tracking, email service providers for transactional and marketing emails, SMS providers for text notifications, cloud hosting providers for data storage and processing, analytics providers for platform usage insights, and customer support tools for ticketing and live chat. These providers access your information only to perform their services and are bound by confidentiality agreements.'
        },
        {
          subsection_title: '4.3 For Legal Requirements',
          subsection_content: 'We may disclose your information when required by law or when we believe disclosure is necessary to: comply with legal process, subpoenas, or court orders; respond to lawful requests from government authorities; protect our rights, property, or safety and that of our users; enforce our Terms of Service; investigate fraud or security issues; and comply with tax and financial reporting obligations.'
        },
        {
          subsection_title: '4.4 Business Transfers',
          subsection_content: 'If BuildEasy is involved in a merger, acquisition, bankruptcy, or sale of assets, your information may be transferred as part of that transaction. We will notify you via email and/or prominent notice on our platform of any change in ownership or uses of your personal information, as well as any choices you may have regarding your information.'
        },
        {
          subsection_title: '4.5 With Your Consent',
          subsection_content: 'We may share your information for any other purpose with your explicit consent or at your direction. For example, if you choose to participate in promotions, contests, or surveys, we may share your information with sponsors or partners with your permission.'
        }
      ]
    },
    {
      section_id: 'data-security',
      section_title: '5. Data Security',
      section_content: 'We implement industry-standard security measures to protect your personal information:',
      subsections: [
        {
          subsection_title: '5.1 Security Measures',
          subsection_content: 'Encryption in transit: All data transmitted between your device and our servers is encrypted using TLS/SSL protocols. Encryption at rest: Sensitive data stored in our databases is encrypted using industry-standard encryption algorithms. Access controls: We restrict access to personal information to employees, contractors, and agents who need it to perform their job functions. Multi-factor authentication: Administrative access to our systems requires multi-factor authentication. Regular security audits: We conduct periodic security assessments and penetration testing to identify and address vulnerabilities. Secure payment processing: Payment card data is processed through PCI-DSS compliant payment gateways (we never store full payment card numbers). Monitoring and logging: We monitor our systems for security threats and maintain logs for security incident investigation.'
        },
        {
          subsection_title: '5.2 Important Disclaimer',
          subsection_content: 'While we strive to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your information. You are responsible for maintaining the confidentiality of your account credentials. Please notify us immediately if you believe your account has been compromised.'
        }
      ]
    },
    {
      section_id: 'your-rights',
      section_title: '6. Your Rights and Choices',
      section_content: 'You have certain rights regarding your personal information:',
      subsections: [
        {
          subsection_title: '6.1 Access and Correction',
          subsection_content: 'You have the right to access and review the personal information we hold about you. You can view and update most of your information directly through your account settings at any time. If you need assistance accessing or correcting your information, please contact us at privacy@buildeasy.com.'
        },
        {
          subsection_title: '6.2 Deletion Rights',
          subsection_content: 'You have the right to request deletion of your personal information, subject to certain exceptions. You can delete your account through your account settings, which will initiate the account deletion process. Please note that we may retain certain information as required by law or for legitimate business purposes (e.g., tax records, dispute resolution, fraud prevention). Even after account deletion, some information may remain in backup systems for a limited period.'
        },
        {
          subsection_title: '6.3 Opt-Out Rights',
          subsection_content: 'You can opt out of marketing communications by: clicking the "unsubscribe" link in promotional emails, adjusting your notification preferences in account settings, or contacting us directly at privacy@buildeasy.com. Please note that even if you opt out of marketing communications, you will still receive transactional emails related to your account and orders (order confirmations, shipping updates, etc.).'
        },
        {
          subsection_title: '6.4 Cookie Management',
          subsection_content: 'You can control cookies through your browser settings. Most browsers allow you to refuse cookies or alert you when cookies are being sent. However, some features of our platform may not function properly if you disable cookies. You can manage your cookie preferences using our cookie management tool accessible from the footer of every page.'
        },
        {
          subsection_title: '6.5 Data Portability',
          subsection_content: 'You have the right to receive a copy of your personal information in a machine-readable format. You can request a data export through your account settings under Privacy & Data. We will provide your data in JSON or CSV format within 30 days of your request. This includes your account information, order history, reviews, messages, and other data you\'ve provided to the platform.'
        }
      ]
    },
    {
      section_id: 'data-retention',
      section_title: '7. Data Retention',
      section_content: 'We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.',
      subsections: [
        {
          subsection_title: '7.1 Active Accounts',
          subsection_content: 'We retain your information as long as your account is active and for a reasonable period thereafter to provide you with services, maintain records, and comply with legal obligations.'
        },
        {
          subsection_title: '7.2 Retention After Deletion',
          subsection_content: 'After you delete your account, we may retain certain information for legal compliance purposes, including: financial records (typically 7 years for tax and accounting purposes), dispute and legal records, fraud prevention data, and records required by applicable laws and regulations. Retained data is anonymized where possible, removing direct personal identifiers.'
        },
        {
          subsection_title: '7.3 Anonymization',
          subsection_content: 'When we no longer need your personal information, we either delete it or anonymize it by removing identifying details. Anonymized data may be retained indefinitely for analytics, research, and platform improvement purposes.'
        }
      ]
    },
    {
      section_id: 'childrens-privacy',
      section_title: '8. Children\'s Privacy',
      section_content: 'BuildEasy is not intended for children under the age of 13 (or 16 in certain jurisdictions such as the European Union). We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at privacy@buildeasy.com and we will delete such information from our systems. If we discover we have collected information from a child without parental consent, we will delete that information promptly.'
    },
    {
      section_id: 'international-transfers',
      section_title: '9. International Data Transfers',
      section_content: 'BuildEasy operates in the United States, and your information may be stored and processed in the United States or other countries where our service providers operate. These countries may have different data protection laws than your country of residence. By using our platform, you consent to the transfer of your information to countries outside your country of residence. For users in the European Economic Area (EEA), we ensure that data transfers comply with GDPR requirements through: Standard Contractual Clauses approved by the European Commission, adequacy decisions recognizing certain countries as providing adequate data protection, and your explicit consent where required. We implement appropriate safeguards to protect your information regardless of where it is processed.'
    },
    {
      section_id: 'policy-changes',
      section_title: '10. Changes to This Privacy Policy',
      section_content: 'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will: notify you by email at the address associated with your account; display a prominent notice on our platform; update the "Last Updated" date at the top of this policy; and provide you with the opportunity to review the changes before they become effective. Your continued use of BuildEasy after the effective date of any changes constitutes your acceptance of the updated Privacy Policy. We encourage you to review this policy periodically to stay informed about how we protect your information.'
    },
    {
      section_id: 'contact-us',
      section_title: '11. Contact Us',
      section_content: 'If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:',
      subsections: [
        {
          subsection_title: 'Data Protection Officer',
          subsection_content: 'Email: privacy@buildeasy.com\nPhone: 1-800-BUILD-EASY (1-800-284-5332)\nMailing Address: BuildEasy Inc., Privacy Department, 123 Construction Way, Suite 500, San Francisco, CA 94102, United States'
        },
        {
          subsection_title: 'Response Time',
          subsection_content: 'We will respond to your privacy inquiries within 30 days. For urgent matters, please mark your communication as "Urgent Privacy Matter" in the subject line.'
        }
      ]
    }
  ] as PrivacySection[]
};

// ============================================================================
// Main Component
// ============================================================================

const UV_PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // CRITICAL: Individual selectors, no object destructuring
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  // Local state
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [cookiePreferencesModalOpen, setCookiePreferencesModalOpen] = useState(false);
  const [dataExportRequested, setDataExportRequested] = useState(false);
  const [dataExportLoading, setDataExportLoading] = useState(false);
  const [dataExportError, setDataExportError] = useState<string | null>(null);
  const [isMobileAccordion, setIsMobileAccordion] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Refs for intersection observer
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Generate table of contents
  const tableOfContents: TOCItem[] = PRIVACY_POLICY_CONTENT.sections.map(section => ({
    section_id: section.section_id,
    section_title: section.section_title,
    anchor: `#${section.section_id}`
  }));

  // Check if mobile for accordion behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileAccordion(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle URL hash on page load
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.substring(1); // Remove #
      const element = document.getElementById(sectionId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (isMobileAccordion) {
            setExpandedSections(prev => new Set(prev).add(sectionId));
          }
        }, 100);
      }
    }
  }, [location.hash, isMobileAccordion]);

  // Intersection Observer for active section highlighting
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Scroll to section handler
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (isMobileAccordion) {
        setExpandedSections(prev => new Set(prev).add(sectionId));
      }
      // Update URL hash without scrolling
      window.history.pushState(null, '', `#${sectionId}`);
    }
  };

  // Toggle section expansion (mobile accordion)
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Data export handler
  const handleDataExport = async () => {
    if (!currentUser || !authToken) {
      // Not authenticated, redirect to login
      navigate('/login?redirect=/privacy');
      return;
    }

    setDataExportLoading(true);
    setDataExportError(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/data-export`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setDataExportRequested(true);
      setDataExportLoading(false);
      
      // Show success message
      alert(`Data export requested successfully. You will receive an email at ${currentUser.email} with a download link within 24 hours.`);
    } catch (error) {
      setDataExportLoading(false);
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.response?.data?.message || 'Failed to request data export'
        : 'Failed to request data export';
      setDataExportError(errorMessage);
    }
  };

  // Navigate to account deletion
  const handleNavigateToAccountDeletion = () => {
    if (!currentUser) {
      navigate('/login?redirect=/account/settings%23delete');
    } else {
      navigate('/account/settings#delete');
    }
  };

  // Cookie preferences handler
  const handleOpenCookiePreferences = () => {
    setCookiePreferencesModalOpen(true);
  };

  const handleCloseCookiePreferences = () => {
    setCookiePreferencesModalOpen(false);
  };

  return (
    <>
      {/* Main Privacy Policy Page */}
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {PRIVACY_POLICY_CONTENT.document_title}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold">Last Updated:</span>{' '}
                    {new Date(PRIVACY_POLICY_CONTENT.last_updated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <span className="hidden sm:inline">•</span>
                  <p>
                    <span className="font-semibold">Effective Date:</span>{' '}
                    {new Date(PRIVACY_POLICY_CONTENT.effective_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handlePrint}
                className="hidden md:flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                aria-label="Print privacy policy"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Table of Contents - Desktop Sidebar */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Table of Contents
                </h2>
                <nav className="space-y-2">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.section_id}
                      onClick={() => scrollToSection(item.section_id)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === item.section_id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {item.section_title}
                    </button>
                  ))}
                </nav>

                {/* Quick Actions */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3">
                    Privacy Actions
                  </h3>
                  <div className="space-y-2">
                    {currentUser ? (
                      <>
                        <button
                          onClick={handleDataExport}
                          disabled={dataExportLoading || dataExportRequested}
                          className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {dataExportLoading ? 'Requesting...' : dataExportRequested ? '✓ Export Requested' : 'Download My Data'}
                        </button>
                        <button
                          onClick={handleNavigateToAccountDeletion}
                          className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        >
                          Delete My Account
                        </button>
                      </>
                    ) : (
                      <p className="text-xs text-blue-700">
                        <Link to="/login" className="underline hover:text-blue-800">
                          Log in
                        </Link>{' '}
                        to manage your privacy settings
                      </p>
                    )}
                    <button
                      onClick={handleOpenCookiePreferences}
                      className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      Manage Cookie Preferences
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Privacy Policy Content */}
            <main className="lg:col-span-9">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Mobile TOC Dropdown */}
                <div className="lg:hidden border-b border-gray-200 p-4">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-gray-900">
                      <span>Table of Contents</span>
                      <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <nav className="mt-4 space-y-2">
                      {tableOfContents.map((item) => (
                        <button
                          key={item.section_id}
                          onClick={() => scrollToSection(item.section_id)}
                          className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            activeSection === item.section_id
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {item.section_title}
                        </button>
                      ))}
                    </nav>
                  </details>
                </div>

                {/* Policy Content */}
                <div className="prose prose-blue max-w-none p-6 sm:p-8 lg:p-12">
                  {/* Introduction Paragraph */}
                  <div className="mb-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                    <p className="text-gray-700 leading-relaxed">
                      Your privacy is important to us. This Privacy Policy explains how BuildEasy collects, uses, 
                      and protects your personal information when you use our construction materials marketplace platform. 
                      Please read this policy carefully to understand our practices regarding your data.
                    </p>
                  </div>

                  {/* Sections */}
                  {PRIVACY_POLICY_CONTENT.sections.map((section, index) => (
                    <section
                      key={section.section_id}
                      id={section.section_id}
                      ref={el => { sectionRefs.current[section.section_id] = el; }}
                      className={`mb-12 scroll-mt-24 ${index !== 0 ? 'pt-8 border-t border-gray-200' : ''}`}
                    >
                      {/* Section Header */}
                      {isMobileAccordion ? (
                        <button
                          onClick={() => toggleSection(section.section_id)}
                          className="flex items-center justify-between w-full text-left group"
                        >
                          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {section.section_title}
                          </h2>
                          <svg 
                            className={`w-6 h-6 text-gray-500 transition-transform ${
                              expandedSections.has(section.section_id) ? 'rotate-180' : ''
                            }`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      ) : (
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          {section.section_title}
                        </h2>
                      )}

                      {/* Section Content (Collapsible on Mobile) */}
                      <div className={`${
                        isMobileAccordion && !expandedSections.has(section.section_id) 
                          ? 'hidden' 
                          : 'block'
                      }`}>
                        <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
                          {section.section_content}
                        </p>

                        {/* Subsections */}
                        {section.subsections && section.subsections.length > 0 && (
                          <div className="ml-4 space-y-6">
                            {section.subsections.map((subsection, subIndex) => (
                              <div key={subIndex}>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                  {subsection.subsection_title}
                                </h3>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                  {subsection.subsection_content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Special action buttons for specific sections */}
                        {section.section_id === 'your-rights' && currentUser && (
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700 mb-4">
                              Exercise your privacy rights:
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={handleDataExport}
                                disabled={dataExportLoading || dataExportRequested}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {dataExportLoading ? (
                                  <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Requesting...
                                  </span>
                                ) : dataExportRequested ? '✓ Export Requested' : 'Download My Data'}
                              </button>
                              <button
                                onClick={handleNavigateToAccountDeletion}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Delete My Account
                              </button>
                            </div>
                            {dataExportError && (
                              <p className="mt-3 text-sm text-red-600" role="alert">
                                {dataExportError}
                              </p>
                            )}
                          </div>
                        )}

                        {section.section_id === 'contact-us' && (
                          <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4">
                              Have Privacy Questions?
                            </h3>
                            <p className="text-sm text-blue-800 mb-4">
                              Our Data Protection team is here to help. Reach out to us:
                            </p>
                            <div className="space-y-2 text-sm">
                              <p className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href="mailto:privacy@buildeasy.com" className="text-blue-700 hover:text-blue-800 underline">
                                  privacy@buildeasy.com
                                </a>
                              </p>
                              <p className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-blue-800">1-800-BUILD-EASY (1-800-284-5332)</span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  ))}

                  {/* Footer Links */}
                  <div className="mt-16 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Related Legal Documents
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Link
                        to="/terms"
                        className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors group"
                      >
                        <svg className="w-5 h-5 text-blue-600 mr-3 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-blue-700">Terms of Service</p>
                          <p className="text-xs text-gray-600">Platform usage terms and conditions</p>
                        </div>
                      </Link>

                      <Link
                        to="/cookies"
                        className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors group"
                      >
                        <svg className="w-5 h-5 text-blue-600 mr-3 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-blue-700">Cookie Policy</p>
                          <p className="text-xs text-gray-600">How we use cookies and tracking</p>
                        </div>
                      </Link>

                      <Link
                        to="/accessibility"
                        className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors group"
                      >
                        <svg className="w-5 h-5 text-blue-600 mr-3 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-blue-700">Accessibility</p>
                          <p className="text-xs text-gray-600">Our commitment to accessibility</p>
                        </div>
                      </Link>

                      <Link
                        to="/contact"
                        className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors group"
                      >
                        <svg className="w-5 h-5 text-blue-600 mr-3 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-blue-700">Contact Us</p>
                          <p className="text-xs text-gray-600">Get in touch with our team</p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Mobile Quick Actions */}
                  <div className="lg:hidden mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-900 mb-3">
                      Privacy Actions
                    </h3>
                    <div className="space-y-2">
                      {currentUser ? (
                        <>
                          <button
                            onClick={handleDataExport}
                            disabled={dataExportLoading || dataExportRequested}
                            className="w-full px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {dataExportLoading ? 'Requesting...' : dataExportRequested ? '✓ Export Requested' : 'Download My Data'}
                          </button>
                          <button
                            onClick={handleNavigateToAccountDeletion}
                            className="w-full px-4 py-2 text-sm bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete My Account
                          </button>
                        </>
                      ) : (
                        <p className="text-sm text-blue-700 text-center">
                          <Link to="/login" className="underline hover:text-blue-800">
                            Log in
                          </Link>{' '}
                          to manage your privacy settings
                        </p>
                      )}
                      <button
                        onClick={handleOpenCookiePreferences}
                        className="w-full px-4 py-2 text-sm bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Manage Cookies
                      </button>
                      <button
                        onClick={handlePrint}
                        className="w-full px-4 py-2 text-sm border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Print Policy
                      </button>
                    </div>
                    {dataExportError && (
                      <p className="mt-3 text-sm text-red-600 text-center" role="alert">
                        {dataExportError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Back to Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10 hidden lg:block"
          aria-label="Back to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

      {/* Cookie Preferences Modal */}
      {cookiePreferencesModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseCookiePreferences}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Cookie Preferences
              </h2>
              <button
                onClick={handleCloseCookiePreferences}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close cookie preferences"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-6 leading-relaxed">
                We use cookies and similar technologies to improve your experience on BuildEasy. 
                You can manage your cookie preferences below.
              </p>

              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Necessary Cookies</h3>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                      Always Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Essential for the platform to function. These cookies enable core functionality 
                    like security, authentication, and accessibility features. Cannot be disabled.
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Functional Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Remember your preferences, settings, and choices to provide a personalized experience.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Help us understand how visitors use our platform to improve performance and user experience.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Marketing Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Used to deliver relevant advertising and track campaign effectiveness.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCloseCookiePreferences}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={handleCloseCookiePreferences}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <p className="mt-4 text-xs text-gray-500 text-center">
                For more information, see our{' '}
                <Link to="/cookies" className="text-blue-600 hover:text-blue-700 underline">
                  Cookie Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          nav, aside, button, .no-print {
            display: none !important;
          }
          
          .prose {
            max-width: 100% !important;
          }
          
          section {
            page-break-inside: avoid;
          }
          
          h1, h2, h3 {
            page-break-after: avoid;
          }
        }
      `}</style>
    </>
  );
};

export default UV_PrivacyPolicy;