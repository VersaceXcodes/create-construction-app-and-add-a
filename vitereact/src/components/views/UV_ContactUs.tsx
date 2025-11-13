import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { MessageCircle, Phone, Mail, MapPin, Send, Paperclip, Clock, Facebook, Instagram, Twitter, Linkedin, Youtube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

interface ContactForm {
  category: 'order_issue' | 'product_question' | 'account' | 'payment' | 'delivery' | 'return' | 'technical' | 'other';
  subject: string;
  description: string;
  related_order_id: string | null;
}

interface UserContactInfo {
  name: string;
  email: string;
  phone: string;
}

interface FormValidationErrors {
  category: string | null;
  subject: string | null;
  description: string | null;
  email: string | null;
  name: string | null;
}

interface FileAttachment {
  file: File;
  file_name: string;
  file_size: number;
  upload_status: 'pending' | 'uploading' | 'completed' | 'error';
  upload_url: string | null;
}

interface BusinessHoursDisplay {
  is_currently_open: boolean;
  current_day_hours: string | null;
  next_open: string | null;
  holiday_notice: string | null;
}

interface CreateTicketPayload {
  user_id?: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  related_order_id: string | null;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  attachment_urls?: string[];
}

interface CreateTicketResponse {
  ticket: {
    ticket_id: string;
    ticket_number: string;
    category: string;
    subject: string;
    status: string;
    created_at: string;
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

const calculateBusinessHours = (): BusinessHoursDisplay => {
  const now = new Date();
  const est_offset = -5; // EST is UTC-5
  const utc_hours = now.getUTCHours();
  const est_hours = (utc_hours + est_offset + 24) % 24;
  const day_of_week = now.getUTCDay();

  const business_hours: { [key: number]: { open: number; close: number } | null } = {
    0: null, // Sunday - closed
    1: { open: 9, close: 18 }, // Monday
    2: { open: 9, close: 18 }, // Tuesday
    3: { open: 9, close: 18 }, // Wednesday
    4: { open: 9, close: 18 }, // Thursday
    5: { open: 9, close: 18 }, // Friday
    6: { open: 10, close: 16 }, // Saturday
  };

  const today_hours = business_hours[day_of_week];
  const is_currently_open = today_hours
    ? est_hours >= today_hours.open && est_hours < today_hours.close
    : false;

  let current_day_hours: string | null = null;
  let next_open: string | null = null;

  if (day_of_week === 0) {
    current_day_hours = 'Closed Sundays';
    next_open = 'Monday 9AM-6PM EST';
  } else if (day_of_week === 6) {
    current_day_hours = '10AM-4PM EST';
    next_open = is_currently_open ? null : 'Monday 9AM-6PM EST';
  } else {
    current_day_hours = '9AM-6PM EST';
    next_open = is_currently_open ? null : 'Tomorrow 9AM EST';
  }

  return {
    is_currently_open,
    current_day_hours,
    next_open,
    holiday_notice: null, // Would check holiday calendar
  };
};

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  return /^[\d\s\-\+\(\)]{10,}$/.test(phone);
};

// ============================================================================
// Main Component
// ============================================================================

const UV_ContactUs: React.FC = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  // Global state (individual selectors)
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  // Contact form state
  const [contactForm, setContactForm] = useState<ContactForm>({
    category: 'other',
    subject: '',
    description: '',
    related_order_id: null,
  });

  // User contact info state
  const [userContactInfo, setUserContactInfo] = useState<UserContactInfo>({
    name: '',
    email: '',
    phone: '',
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({
    category: null,
    subject: null,
    description: null,
    email: null,
    name: null,
  });

  // File attachments
  const [fileAttachments, setFileAttachments] = useState<FileAttachment[]>([]);

  // Business hours
  const [businessHours] = useState<BusinessHoursDisplay>(calculateBusinessHours());

  // Form submission state
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);

  // Pre-fill form from authenticated user
  useEffect(() => {
    if (currentUser) {
      setUserContactInfo({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
      });
    }
  }, [currentUser]);

  // Form submission mutation
  const submitTicketMutation = useMutation<CreateTicketResponse, Error, CreateTicketPayload>({
    mutationFn: async (payload: CreateTicketPayload) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/support/tickets`,
        payload,
        { headers }
      );

      return response.data;
    },
    onSuccess: (data) => {
      setSubmissionSuccess(true);
      setCreatedTicketNumber(data.ticket.ticket_number);
      
      // Reset form
      setContactForm({
        category: 'other',
        subject: '',
        description: '',
        related_order_id: null,
      });
      
      if (!currentUser) {
        setUserContactInfo({
          name: '',
          email: '',
          phone: '',
        });
      }
      
      setFileAttachments([]);
      setValidationErrors({
        category: null,
        subject: null,
        description: null,
        email: null,
        name: null,
      });

      // Scroll to confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (error) => {
      console.error('Ticket submission error:', error);
    },
  });

  // Validate form fields
  const validateForm = useCallback((): boolean => {
    const errors: FormValidationErrors = {
      category: null,
      subject: null,
      description: null,
      email: null,
      name: null,
    };

    let isValid = true;

    // Name validation (required if not authenticated)
    if (!currentUser && !userContactInfo.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    // Email validation (required)
    if (!userContactInfo.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(userContactInfo.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Phone validation (optional but validated if provided)
    if (userContactInfo.phone && !validatePhone(userContactInfo.phone)) {
      errors.name = 'Please enter a valid phone number';
      isValid = false;
    }

    // Subject validation
    if (!contactForm.subject.trim()) {
      errors.subject = 'Subject is required';
      isValid = false;
    } else if (contactForm.subject.length < 5) {
      errors.subject = 'Subject must be at least 5 characters';
      isValid = false;
    } else if (contactForm.subject.length > 255) {
      errors.subject = 'Subject must be less than 255 characters';
      isValid = false;
    }

    // Description validation
    if (!contactForm.description.trim()) {
      errors.description = 'Message is required';
      isValid = false;
    } else if (contactForm.description.length < 20) {
      errors.description = 'Message must be at least 20 characters';
      isValid = false;
    } else if (contactForm.description.length > 5000) {
      errors.description = 'Message must be less than 5000 characters';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  }, [contactForm, userContactInfo, currentUser]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Build payload
    const payload: CreateTicketPayload = {
      category: contactForm.category,
      subject: contactForm.subject,
      description: contactForm.description,
      priority: 'medium',
      related_order_id: contactForm.related_order_id,
    };

    // Add user info
    if (currentUser) {
      payload.user_id = currentUser.user_id;
    } else {
      // Guest submission
      payload.guest_name = userContactInfo.name;
      payload.guest_email = userContactInfo.email;
      payload.guest_phone = userContactInfo.phone || undefined;
    }

    // Add attachment URLs if uploaded
    const completed_attachments = fileAttachments.filter(a => a.upload_status === 'completed');
    if (completed_attachments.length > 0) {
      payload.attachment_urls = completed_attachments.map(a => a.upload_url).filter(Boolean) as string[];
    }

    submitTicketMutation.mutate(payload);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: FileAttachment[] = [];
    
    Array.from(files).forEach(file => {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      // Validate file type (images and PDFs)
      const allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowed_types.includes(file.type)) {
        alert(`File ${file.name} has unsupported type. Allowed: JPEG, PNG, GIF, PDF.`);
        return;
      }

      newAttachments.push({
        file,
        file_name: file.name,
        file_size: file.size,
        upload_status: 'pending',
        upload_url: null,
      });
    });

    // Max 3 attachments total
    if (fileAttachments.length + newAttachments.length > 3) {
      alert('Maximum 3 attachments allowed');
      return;
    }

    setFileAttachments(prev => [...prev, ...newAttachments]);

    // Auto-upload files (simulated since endpoint is missing)
    // In production, this would call POST /api/upload/support-attachment
    newAttachments.forEach((attachment, index) => {
      setTimeout(() => {
        setFileAttachments(prev => prev.map(a => 
          a.file_name === attachment.file_name 
            ? { ...a, upload_status: 'completed', upload_url: `https://cdn.example.com/support/${a.file_name}` }
            : a
        ));
      }, 1000 * (index + 1)); // Simulate upload delay
    });
  };

  // Remove attachment
  const removeAttachment = (file_name: string) => {
    setFileAttachments(prev => prev.filter(a => a.file_name !== file_name));
  };

  // Clear error on field change
  const clearFieldError = (field: keyof FormValidationErrors) => {
    setValidationErrors(prev => ({ ...prev, [field]: null }));
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              We're here to help with any questions or concerns. Choose the best way to reach us.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Success Message */}
          {submissionSuccess && createdTicketNumber && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-900 mb-2">Thank You for Contacting Us!</h3>
                  <p className="text-green-800 mb-3">
                    Your message has been received. Ticket <strong>#{createdTicketNumber}</strong> has been created.
                  </p>
                  <p className="text-green-700 mb-4">
                    We will respond within 24 hours to the email address you provided.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/help"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Visit Help Center
                    </Link>
                    <button
                      onClick={() => {
                        setSubmissionSuccess(false);
                        setCreatedTicketNumber(null);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-white text-green-700 border-2 border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitTicketMutation.isError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <XCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-900 mb-2">Submission Failed</h3>
                  <p className="text-red-800">
                    {submitTicketMutation.error?.message || 'Unable to submit your inquiry. Please try again or use an alternative contact method.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Live Chat Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-sm text-gray-600 mb-3">
                {businessHours.is_currently_open ? (
                  <span className="text-green-600 font-semibold">● Available Now</span>
                ) : (
                  <span className="text-gray-500">● Offline</span>
                )}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Monday-Friday 9AM-6PM EST
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Average response: &lt;2 minutes
              </p>
              <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!businessHours.is_currently_open}
              >
                Start Chat
              </button>
            </div>

            {/* Phone Support Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Phone Support</h3>
              <a
                href="tel:+18005551234"
                className="text-lg font-semibold text-blue-600 hover:text-blue-800 block mb-3"
              >
                1-800-555-1234
              </a>
              <p className="text-sm text-gray-600 mb-3">
                {businessHours.current_day_hours}
              </p>
              <p className="text-xs text-gray-500">
                International: +1-310-555-1234
              </p>
            </div>

            {/* Email Support Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Email Support</h3>
              <a
                href="mailto:support@buildeasy.com"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 block mb-3"
              >
                support@buildeasy.com
              </a>
              <p className="text-sm text-gray-600 mb-3">
                Response within 24 hours
              </p>
              <p className="text-xs text-gray-500">
                For non-urgent inquiries
              </p>
            </div>

            {/* Office Address Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Office Address</h3>
              <address className="text-sm text-gray-600 mb-3 not-italic">
                123 Market Street<br />
                Suite 500<br />
                San Francisco, CA 94103<br />
                United States
              </address>
              <a
                href="https://maps.google.com/?q=123+Market+Street+San+Francisco+CA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View on Map →
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form - Main Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
                <p className="text-gray-600 mb-6">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field (for guests) */}
                  {!currentUser && (
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={userContactInfo.name}
                        onChange={(e) => {
                          setUserContactInfo(prev => ({ ...prev, name: e.target.value }));
                          clearFieldError('name');
                        }}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                          validationErrors.name 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="John Doe"
                      />
                      {validationErrors.name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.name}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={userContactInfo.email}
                      onChange={(e) => {
                        setUserContactInfo(prev => ({ ...prev, email: e.target.value }));
                        clearFieldError('email');
                      }}
                      disabled={!!currentUser}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                        validationErrors.email 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      } ${currentUser ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      placeholder="john@example.com"
                    />
                    {validationErrors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={userContactInfo.phone}
                      onChange={(e) => {
                        setUserContactInfo(prev => ({ ...prev, phone: e.target.value }));
                      }}
                      disabled={!!currentUser}
                      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all ${
                        currentUser ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      value={contactForm.category}
                      onChange={(e) => {
                        setContactForm(prev => ({ ...prev, category: e.target.value as ContactForm['category'] }));
                        clearFieldError('category');
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    >
                      <option value="other">Other</option>
                      <option value="order_issue">Order Question</option>
                      <option value="product_question">Product Inquiry</option>
                      <option value="technical">Technical Issue</option>
                      <option value="delivery">Delivery Question</option>
                      <option value="return">Return/Refund</option>
                      <option value="account">Account Issue</option>
                      <option value="payment">Payment Question</option>
                    </select>
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => {
                        setContactForm(prev => ({ ...prev, subject: e.target.value }));
                        clearFieldError('subject');
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                        validationErrors.subject 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="Brief summary of your inquiry"
                      maxLength={255}
                    />
                    <div className="flex justify-between mt-1">
                      <div>
                        {validationErrors.subject && (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {validationErrors.subject}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {contactForm.subject.length}/255
                      </p>
                    </div>
                  </div>

                  {/* Message/Description Field */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      value={contactForm.description}
                      onChange={(e) => {
                        setContactForm(prev => ({ ...prev, description: e.target.value }));
                        clearFieldError('description');
                      }}
                      rows={6}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none ${
                        validationErrors.description 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="Please provide detailed information about your inquiry (minimum 20 characters)..."
                      maxLength={5000}
                    />
                    <div className="flex justify-between mt-1">
                      <div>
                        {validationErrors.description && (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {validationErrors.description}
                          </p>
                        )}
                      </div>
                      <p className={`text-xs ${contactForm.description.length < 20 ? 'text-orange-500' : 'text-gray-500'}`}>
                        {contactForm.description.length}/5000 {contactForm.description.length < 20 && '(min 20)'}
                      </p>
                    </div>
                  </div>

                  {/* File Attachments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attach Files (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload screenshots or documents (max 5MB each)
                      </p>
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm font-medium"
                      >
                        Choose Files
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        JPG, PNG, GIF, PDF (max 3 files)
                      </p>
                    </div>

                    {/* Attachment List */}
                    {fileAttachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {fileAttachments.map((attachment) => (
                          <div
                            key={attachment.file_name}
                            className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <Paperclip className="w-4 h-4 text-gray-400" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {attachment.file_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(attachment.file_size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {attachment.upload_status === 'completed' && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                              {attachment.upload_status === 'uploading' && (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                              )}
                              <button
                                type="button"
                                onClick={() => removeAttachment(attachment.file_name)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={submitTicketMutation.isPending}
                      className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {submitTicketMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar - Additional Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Office Hours */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Office Hours</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium text-gray-900">9AM - 6PM EST</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium text-gray-900">10AM - 4PM EST</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium text-gray-900">Closed</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Live chat and phone support available during these hours. Email is monitored 24/7 with responses within 24 hours.
                    </p>
                  </div>
                  {businessHours.is_currently_open && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                      <p className="text-sm font-semibold text-green-800">
                        ● We're currently available!
                      </p>
                    </div>
                  )}
                  {!businessHours.is_currently_open && businessHours.next_open && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                      <p className="text-sm font-medium text-gray-700">
                        Next available: {businessHours.next_open}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* FAQ Quick Links */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Common Questions</h3>
                <div className="space-y-3">
                  <Link
                    to="/help#track-order"
                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    → How do I track my order?
                  </Link>
                  <Link
                    to="/help#returns"
                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    → How do I return an item?
                  </Link>
                  <Link
                    to="/help#password-reset"
                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    → How do I reset my password?
                  </Link>
                  <Link
                    to="/help#delivery"
                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    → What are your delivery options?
                  </Link>
                  <Link
                    to="/help"
                    className="block text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors pt-3 border-t border-gray-200"
                  >
                    View All Help Articles →
                  </Link>
                </div>
              </div>

              {/* For Suppliers */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">For Suppliers</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Have questions about becoming a supplier or need assistance with your shop?
                </p>
                <div className="space-y-2 mb-4">
                  <a
                    href="mailto:supplier-support@buildeasy.com"
                    className="block text-sm font-semibold text-purple-600 hover:text-purple-800"
                  >
                    supplier-support@buildeasy.com
                  </a>
                  <a
                    href="tel:+18005551235"
                    className="block text-sm font-semibold text-purple-600 hover:text-purple-800"
                  >
                    1-800-555-1235
                  </a>
                </div>
                <Link
                  to="/become-a-supplier"
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Apply to Become a Supplier
                </Link>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Follow Us</h3>
                <div className="flex space-x-3 mb-4">
                  <a
                    href="https://facebook.com/buildeasy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="https://instagram.com/buildeasy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="https://twitter.com/buildeasy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="https://linkedin.com/company/buildeasy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="https://youtube.com/buildeasy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-5 h-5 text-white" />
                  </a>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Questions via social media typically receive responses within 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ContactUs;