import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import axios, { AxiosError } from 'axios';
import { 
  CheckCircle, 
  AlertCircle, 
  Keyboard, 
  Eye, 
  Monitor, 
  Smartphone,
  Mail,
  Phone,
  Printer,
  X
} from 'lucide-react';

const UV_AccessibilityStatement: React.FC = () => {
  // ============================================================================
  // Global State (Individual Selectors - Critical for avoiding infinite loops)
  // ============================================================================
  
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  // ============================================================================
  // Local State
  // ============================================================================
  
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmittedSuccess, setFeedbackSubmittedSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  
  const [feedbackFormData, setFeedbackFormData] = useState({
    issue_type: '',
    issue_description: '',
    page_url: '',
    user_name: '',
    user_email: '',
    user_phone: ''
  });

  // ============================================================================
  // Static Content (Since no backend endpoint exists)
  // ============================================================================
  
  const statementContent = {
    document_title: 'Accessibility Statement',
    last_updated: 'December 2024',
    commitment_statement: 'BuildEasy is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.',
    conformance_status: {
      standard: 'Web Content Accessibility Guidelines (WCAG) 2.1',
      level: 'Level AA',
      assessment_date: 'November 2024',
      next_review_date: 'November 2025'
    },
    accessibility_features: [
      {
        feature_name: 'Keyboard Navigation',
        feature_description: 'All functionality is accessible via keyboard alone. Use Tab to navigate through interactive elements, Enter or Space to activate buttons and links, and Escape to close modals and dialogs.'
      },
      {
        feature_name: 'Screen Reader Support',
        feature_description: 'We use semantic HTML structure, ARIA labels on complex widgets, and descriptive alt text on images. Tested with NVDA, JAWS, and VoiceOver screen readers.'
      },
      {
        feature_name: 'Visual Design',
        feature_description: 'High contrast text meeting WCAG AA minimums (4.5:1 ratio), resizable text supporting up to 200% zoom without loss of functionality, and color is not used as the only indicator (supplemented with icons and text).'
      },
      {
        feature_name: 'Focus Indicators',
        feature_description: 'Clear visible outlines on all interactive elements using 3px brand color borders with sufficient contrast.'
      },
      {
        feature_name: 'Mobile Accessibility',
        feature_description: 'Touch targets are minimum 44x44 pixels, responsive design works on all screen sizes, and gestures have alternatives for users who cannot perform them.'
      }
    ],
    known_limitations: [
      {
        limitation_description: 'Third-party embedded content (e.g., YouTube videos) may not be fully accessible.',
        workaround: 'We provide links to content providers\' accessibility information.'
      },
      {
        limitation_description: 'PDF documents uploaded by suppliers may not be accessible.',
        workaround: 'We encourage suppliers to provide accessible versions and can help upon request.'
      },
      {
        limitation_description: 'Some supplier-uploaded product images may lack descriptive alt text.',
        workaround: 'We encourage suppliers to provide descriptions and moderate flagged content.'
      }
    ],
    feedback_section: {
      contact_email: 'accessibility@buildeasy.com',
      contact_phone: '1-800-BUILD-EZ (1-800-284-5339)',
      response_time: '5 business days'
    },
    formal_complaints: {
      process_description: 'If you wish to file a formal complaint regarding accessibility, you may contact the relevant authority in your jurisdiction. However, we encourage you to contact us directly first so we can address your concerns promptly.',
      authorities: [
        {
          name: 'U.S. Department of Health and Human Services',
          office: 'Office for Civil Rights',
          contact: '1-800-368-1019, OCRMail@hhs.gov'
        },
        {
          name: 'UK Equality and Human Rights Commission',
          office: 'Equality Advisory and Support Service',
          contact: '0808 800 0082, www.equalityadvisoryservice.com'
        }
      ]
    },
    technologies_used: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'ARIA 1.2', 'React 18'],
    testing_approach: 'Our accessibility conformance is evaluated through a combination of self-assessment by our development team using automated tools (aXe, WAVE) and manual testing with keyboards and screen readers, external expert review by accessibility consultants annually, and user testing with people with disabilities.'
  };

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleOpenFeedbackForm = () => {
    // Prepopulate user data if authenticated
    if (currentUser) {
      setFeedbackFormData(prev => ({
        ...prev,
        user_name: currentUser.name || '',
        user_email: currentUser.email || '',
        page_url: window.location.href
      }));
    } else {
      setFeedbackFormData(prev => ({
        ...prev,
        page_url: window.location.href
      }));
    }
    
    setFeedbackFormOpen(true);
    setFeedbackSubmittedSuccess(false);
    setFeedbackError(null);
  };

  const handleCloseFeedbackForm = () => {
    setFeedbackFormOpen(false);
    setFeedbackFormData({
      issue_type: '',
      issue_description: '',
      page_url: '',
      user_name: '',
      user_email: '',
      user_phone: ''
    });
    setFeedbackError(null);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!feedbackFormData.issue_type || !feedbackFormData.issue_description) {
      setFeedbackError('Please select an issue type and provide a description.');
      return;
    }
    
    if (!currentUser && !feedbackFormData.user_email) {
      setFeedbackError('Please provide your email address so we can respond.');
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      
      // Construct support ticket payload
      const ticketPayload = {
        user_id: currentUser?.user_id || null,
        category: 'technical', // Using existing enum value (accessibility may not exist yet)
        subject: `Accessibility Issue: ${feedbackFormData.issue_type}`,
        description: `
ACCESSIBILITY ISSUE REPORT

Issue Type: ${feedbackFormData.issue_type}

Description:
${feedbackFormData.issue_description}

Page URL: ${feedbackFormData.page_url || window.location.href}

Contact Information:
Name: ${feedbackFormData.user_name || currentUser?.name || 'Not provided'}
Email: ${feedbackFormData.user_email || currentUser?.email || 'Not provided'}
Phone: ${feedbackFormData.user_phone || 'Not provided'}

Submitted: ${new Date().toISOString()}
        `.trim(),
        priority: 'high',
        related_order_id: null
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/support/tickets`,
        ticketPayload,
        { headers }
      );

      const createdTicket = response.data;
      
      setTicketNumber(createdTicket.ticket_number || createdTicket.ticket_id || 'N/A');
      setFeedbackSubmittedSuccess(true);
      setSubmittingFeedback(false);
      
      // Reset form
      setFeedbackFormData({
        issue_type: '',
        issue_description: '',
        page_url: '',
        user_name: '',
        user_email: '',
        user_phone: ''
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      const errorMessage = 
        axiosError.response?.data?.error || 
        axiosError.response?.data?.message || 
        'Failed to submit feedback. Please try again or email us directly.';
      
      setFeedbackError(errorMessage);
      setSubmittingFeedback(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      {/* Main Container */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {statementContent.document_title}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Last Updated: {statementContent.last_updated}
                </p>
              </div>
              
              <button
                onClick={handlePrint}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-blue-100"
                aria-label="Print accessibility statement"
              >
                <Printer className="w-5 h-5" />
                <span className="font-medium">Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            {/* Commitment Statement */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-8" aria-labelledby="commitment-heading">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-green-600" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="commitment-heading" className="text-2xl font-semibold text-gray-900 mb-4">
                    Our Commitment
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {statementContent.commitment_statement}
                  </p>
                </div>
              </div>
            </section>

            {/* Conformance Status */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-8" aria-labelledby="conformance-heading">
              <h2 id="conformance-heading" className="text-2xl font-semibold text-gray-900 mb-6">
                Conformance Status
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Standard
                  </h3>
                  <p className="text-blue-800 font-medium">
                    {statementContent.conformance_status.standard}
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Level
                  </h3>
                  <p className="text-green-800 font-medium">
                    {statementContent.conformance_status.level}
                  </p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">
                    Last Assessment
                  </h3>
                  <p className="text-purple-800 font-medium">
                    {statementContent.conformance_status.assessment_date}
                  </p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-6 border-2 border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">
                    Next Review
                  </h3>
                  <p className="text-orange-800 font-medium">
                    {statementContent.conformance_status.next_review_date}
                  </p>
                </div>
              </div>
            </section>

            {/* Accessibility Features */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-8" aria-labelledby="features-heading">
              <h2 id="features-heading" className="text-2xl font-semibold text-gray-900 mb-6">
                Accessibility Features
              </h2>
              
              <div className="space-y-6">
                {statementContent.accessibility_features.map((feature, index) => (
                  <article 
                    key={index}
                    className="border-l-4 border-blue-600 pl-6 py-2"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-3">
                      {feature.feature_name === 'Keyboard Navigation' && <Keyboard className="w-6 h-6 text-blue-600" aria-hidden="true" />}
                      {feature.feature_name === 'Screen Reader Support' && <Eye className="w-6 h-6 text-blue-600" aria-hidden="true" />}
                      {feature.feature_name === 'Visual Design' && <Monitor className="w-6 h-6 text-blue-600" aria-hidden="true" />}
                      {feature.feature_name === 'Focus Indicators' && <CheckCircle className="w-6 h-6 text-blue-600" aria-hidden="true" />}
                      {feature.feature_name === 'Mobile Accessibility' && <Smartphone className="w-6 h-6 text-blue-600" aria-hidden="true" />}
                      <span>{feature.feature_name}</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {feature.feature_description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* Known Limitations */}
            <section className="bg-yellow-50 rounded-xl shadow-lg border-2 border-yellow-200 p-8" aria-labelledby="limitations-heading">
              <div className="flex items-start space-x-4 mb-6">
                <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h2 id="limitations-heading" className="text-2xl font-semibold text-gray-900">
                    Known Limitations
                  </h2>
                  <p className="text-gray-700 mt-2">
                    We are transparent about areas where we are still improving:
                  </p>
                </div>
              </div>
              
              <ul className="space-y-4" role="list">
                {statementContent.known_limitations.map((limitation, index) => (
                  <li key={index} className="bg-white rounded-lg p-4 border border-yellow-200">
                    <p className="text-gray-900 font-medium mb-2">
                      {limitation.limitation_description}
                    </p>
                    {limitation.workaround && (
                      <p className="text-gray-700 text-sm">
                        <strong className="text-yellow-800">Workaround:</strong> {limitation.workaround}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            {/* Feedback and Contact */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-8" aria-labelledby="feedback-heading">
              <h2 id="feedback-heading" className="text-2xl font-semibold text-gray-900 mb-4">
                Report Accessibility Issues
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                We welcome your feedback on the accessibility of BuildEasy. Please let us know if you encounter accessibility barriers. 
                We typically respond within <strong className="text-blue-600">{statementContent.feedback_section.response_time}</strong>.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <a
                  href={`mailto:${statementContent.feedback_section.contact_email}`}
                  className="flex items-center justify-center space-x-3 px-6 py-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <Mail className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  <span className="font-medium text-blue-900">Email Us</span>
                </a>
                
                <a
                  href={`tel:${statementContent.feedback_section.contact_phone.replace(/\D/g, '')}`}
                  className="flex items-center justify-center space-x-3 px-6 py-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-green-100"
                >
                  <Phone className="w-5 h-5 text-green-600" aria-hidden="true" />
                  <span className="font-medium text-green-900">Call Us</span>
                </a>
                
                <button
                  onClick={handleOpenFeedbackForm}
                  className="flex items-center justify-center space-x-3 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-100"
                >
                  <AlertCircle className="w-5 h-5" aria-hidden="true" />
                  <span className="font-medium">Report Issue</span>
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong>Phone accessibility:</strong> TTY users can dial 711 for relay services.
                </p>
              </div>
            </section>

            {/* Technologies Used */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-8" aria-labelledby="technologies-heading">
              <h2 id="technologies-heading" className="text-2xl font-semibold text-gray-900 mb-4">
                Technologies We Rely On
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                BuildEasy is designed to work with the following assistive technologies:
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {statementContent.technologies_used.map((tech, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  Tested With:
                </h3>
                <ul className="space-y-2 text-blue-800" role="list">
                  <li>• NVDA with Firefox on Windows</li>
                  <li>• JAWS with Chrome and Internet Explorer on Windows</li>
                  <li>• VoiceOver with Safari on macOS and iOS</li>
                </ul>
              </div>
            </section>

            {/* Assessment Approach */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-8" aria-labelledby="assessment-heading">
              <h2 id="assessment-heading" className="text-2xl font-semibold text-gray-900 mb-4">
                Assessment Approach
              </h2>
              
              <p className="text-gray-700 leading-relaxed">
                {statementContent.testing_approach}
              </p>
            </section>

            {/* Formal Complaints (Jurisdictional) */}
            {statementContent.formal_complaints && (
              <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-8" aria-labelledby="complaints-heading">
                <h2 id="complaints-heading" className="text-2xl font-semibold text-gray-900 mb-4">
                  Formal Complaints Process
                </h2>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  {statementContent.formal_complaints.process_description}
                </p>
                
                <div className="space-y-4">
                  {statementContent.formal_complaints.authorities.map((authority, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {authority.name}
                      </h3>
                      <p className="text-sm text-gray-700 mb-1">
                        {authority.office}
                      </p>
                      <p className="text-sm text-gray-600">
                        Contact: {authority.contact}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Back to Site Navigation */}
            <div className="flex justify-center pt-6">
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        </main>

        {/* Footer Links */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav aria-label="Legal pages navigation">
              <ul className="flex flex-wrap justify-center gap-6 text-sm" role="list">
                <li>
                  <Link to="/terms" className="text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1">
                    Help Center
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </footer>
      </div>

      {/* Feedback Form Modal */}
      {feedbackFormOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCloseFeedbackForm}
            aria-hidden="true"
          ></div>
          
          {/* Modal */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 transform transition-all">
              {/* Close Button */}
              <button
                onClick={handleCloseFeedbackForm}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-100"
                aria-label="Close feedback form"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Success State */}
              {feedbackSubmittedSuccess ? (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto" aria-hidden="true" />
                  </div>
                  
                  <h3 id="feedback-modal-title" className="text-2xl font-bold text-gray-900 mb-4">
                    Thank You for Your Feedback!
                  </h3>
                  
                  <p className="text-gray-700 mb-2">
                    Your accessibility feedback helps us improve for everyone.
                  </p>
                  
                  {ticketNumber && (
                    <p className="text-sm text-gray-600 mb-6">
                      Reference Number: <strong className="text-blue-600">#{ticketNumber}</strong>
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-600 mb-6">
                    We'll respond within {statementContent.feedback_section.response_time}.
                  </p>
                  
                  <button
                    onClick={handleCloseFeedbackForm}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {/* Form */}
                  <h3 id="feedback-modal-title" className="text-2xl font-bold text-gray-900 mb-6">
                    Report Accessibility Issue
                  </h3>
                  
                  {feedbackError && (
                    <div 
                      className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg"
                      role="alert"
                      aria-live="polite"
                    >
                      <p className="text-sm font-medium">{feedbackError}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmitFeedback} className="space-y-6">
                    {/* Issue Type */}
                    <div>
                      <label htmlFor="issue-type" className="block text-sm font-semibold text-gray-900 mb-2">
                        Issue Type <span className="text-red-600" aria-label="required">*</span>
                      </label>
                      <select
                        id="issue-type"
                        required
                        value={feedbackFormData.issue_type}
                        onChange={(e) => {
                          setFeedbackError(null);
                          setFeedbackFormData(prev => ({ ...prev, issue_type: e.target.value }));
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-900 focus:outline-none transition-all"
                      >
                        <option value="">Select issue type...</option>
                        <option value="Keyboard navigation problem">Keyboard navigation problem</option>
                        <option value="Screen reader incompatibility">Screen reader incompatibility</option>
                        <option value="Low contrast or visibility issue">Low contrast or visibility issue</option>
                        <option value="Missing alt text">Missing alt text</option>
                        <option value="Form accessibility issue">Form accessibility issue</option>
                        <option value="Mobile accessibility problem">Mobile accessibility problem</option>
                        <option value="Other accessibility barrier">Other accessibility barrier</option>
                      </select>
                    </div>

                    {/* Issue Description */}
                    <div>
                      <label htmlFor="issue-description" className="block text-sm font-semibold text-gray-900 mb-2">
                        Description <span className="text-red-600" aria-label="required">*</span>
                      </label>
                      <textarea
                        id="issue-description"
                        required
                        rows={5}
                        value={feedbackFormData.issue_description}
                        onChange={(e) => {
                          setFeedbackError(null);
                          setFeedbackFormData(prev => ({ ...prev, issue_description: e.target.value }));
                        }}
                        placeholder="Please describe the accessibility barrier you encountered. Include what you were trying to do, what happened, and what assistive technology you're using (if applicable)."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-900 placeholder-gray-400 focus:outline-none transition-all resize-none"
                      ></textarea>
                      <p className="mt-2 text-xs text-gray-500">
                        {feedbackFormData.issue_description.length}/2000 characters
                      </p>
                    </div>

                    {/* Page URL */}
                    <div>
                      <label htmlFor="page-url" className="block text-sm font-semibold text-gray-900 mb-2">
                        Page URL (optional)
                      </label>
                      <input
                        id="page-url"
                        type="url"
                        value={feedbackFormData.page_url}
                        onChange={(e) => setFeedbackFormData(prev => ({ ...prev, page_url: e.target.value }))}
                        placeholder="https://buildeasy.com/page-with-issue"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Help us locate the issue by providing the page URL where you encountered the problem.
                      </p>
                    </div>

                    {/* Contact Info (if not authenticated) */}
                    {!currentUser && (
                      <>
                        <div>
                          <label htmlFor="user-name" className="block text-sm font-semibold text-gray-900 mb-2">
                            Your Name
                          </label>
                          <input
                            id="user-name"
                            type="text"
                            value={feedbackFormData.user_name}
                            onChange={(e) => setFeedbackFormData(prev => ({ ...prev, user_name: e.target.value }))}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label htmlFor="user-email" className="block text-sm font-semibold text-gray-900 mb-2">
                            Your Email <span className="text-red-600" aria-label="required">*</span>
                          </label>
                          <input
                            id="user-email"
                            type="email"
                            required={!currentUser}
                            value={feedbackFormData.user_email}
                            onChange={(e) => setFeedbackFormData(prev => ({ ...prev, user_email: e.target.value }))}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label htmlFor="user-phone" className="block text-sm font-semibold text-gray-900 mb-2">
                            Phone Number (optional)
                          </label>
                          <input
                            id="user-phone"
                            type="tel"
                            value={feedbackFormData.user_phone}
                            onChange={(e) => setFeedbackFormData(prev => ({ ...prev, user_phone: e.target.value }))}
                            placeholder="+1 (555) 123-4567"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
                          />
                        </div>
                      </>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleCloseFeedbackForm}
                        disabled={submittingFeedback}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        disabled={submittingFeedback}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {submittingFeedback ? (
                          <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <span>Submit Feedback</span>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_AccessibilityStatement;