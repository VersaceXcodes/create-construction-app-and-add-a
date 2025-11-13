import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  Truck, 
  HeadphonesIcon,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Store,
  Package,
  DollarSign,
  Clock,
  Star,
  Phone
} from 'lucide-react';
import axios from 'axios';

// ============================================================================
// Type Definitions
// ============================================================================

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Testimonial {
  id: string;
  supplier_name: string;
  location: string;
  quote: string;
  result: string;
  logo_url: string | null;
  joined_date: string;
}

interface PricingTier {
  id: 'standard' | 'premium' | 'enterprise';
  name: string;
  commission_rate: string;
  features: string[];
  recommended?: boolean;
}

// ============================================================================
// Static Data (In production, this would come from CMS/backend)
// ============================================================================

const benefits = [
  {
    id: 'reach',
    icon: Users,
    title: 'Reach New Customers',
    description: 'Expand your customer base beyond your local area with online visibility and platform marketing support reaching thousands of potential buyers.'
  },
  {
    id: 'tools',
    icon: Settings,
    title: 'Powerful Tools',
    description: 'Real-time inventory management, automated order processing, detailed analytics and insights, and customizable shop profile to showcase your brand.'
  },
  {
    id: 'sales',
    icon: TrendingUp,
    title: 'Increase Sales',
    description: 'Competitive pricing tools, promotion management capabilities, bulk order handling, and access to trade customers to boost your revenue.'
  },
  {
    id: 'operations',
    icon: Truck,
    title: 'Simplified Operations',
    description: 'Centralized order management, integrated delivery tracking, automated customer notifications, and built-in communication tools.'
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Comprehensive sales reports, customer insights, product performance data, and inventory optimization recommendations.'
  },
  {
    id: 'support',
    icon: HeadphonesIcon,
    title: 'Support & Growth',
    description: 'Dedicated account manager for larger suppliers, onboarding assistance, seller education resources, and marketing opportunities.'
  }
];

const howItWorksSteps = [
  {
    id: 'apply',
    number: 1,
    title: 'Apply',
    description: 'Complete our simple online application with business verification and document upload. Get approved in 1-2 business days.'
  },
  {
    id: 'setup',
    number: 2,
    title: 'Setup',
    description: 'Create your shop profile, upload your product catalog with our bulk import tool, and configure delivery and payment settings.'
  },
  {
    id: 'sell',
    number: 3,
    title: 'Start Selling',
    description: 'Go live and start receiving orders immediately. Get automated notifications for every new order and message.'
  },
  {
    id: 'grow',
    number: 4,
    title: 'Grow',
    description: 'Optimize using analytics, run promotions to boost sales, and build lasting customer relationships.'
  }
];

const pricingTiers: PricingTier[] = [
  {
    id: 'standard',
    name: 'Standard',
    commission_rate: '8%',
    features: [
      'Unlimited product listings',
      'Basic analytics dashboard',
      'Standard customer support',
      'Weekly payouts',
      'Mobile app access'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    commission_rate: '6%',
    features: [
      'Everything in Standard',
      'Advanced analytics & insights',
      'Priority customer support',
      'Daily payouts',
      'Featured shop placement',
      'Promotion tools'
    ],
    recommended: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    commission_rate: '4%',
    features: [
      'Everything in Premium',
      'Dedicated account manager',
      'Custom integration support',
      'Same-day payouts',
      'Premium marketing opportunities',
      'White-label options'
    ]
  }
];

const testimonials: Testimonial[] = [
  {
    id: 'test1',
    supplier_name: 'ABC Building Materials',
    location: 'Los Angeles, CA',
    quote: 'BuildEasy helped us reach customers we never could have found locally. Our online sales grew 40% in the first six months.',
    result: '40% increase in sales',
    logo_url: null,
    joined_date: '2023'
  },
  {
    id: 'test2',
    supplier_name: 'Premium Lumber Co.',
    location: 'Seattle, WA',
    quote: 'The platform is incredibly easy to use. We integrated our inventory in days and started getting orders immediately.',
    result: '200+ new customers',
    logo_url: null,
    joined_date: '2023'
  },
  {
    id: 'test3',
    supplier_name: 'Builders Supply Warehouse',
    location: 'Austin, TX',
    quote: 'Best decision for our business. The analytics help us stock the right products, and the customer reach is unmatched.',
    result: '3x online revenue',
    logo_url: null,
    joined_date: '2024'
  }
];

const faqs: FAQ[] = [
  {
    id: 'approval',
    question: 'How long does approval take?',
    answer: 'Our verification team reviews applications within 1-2 business days. You\'ll receive an email notification once your application is reviewed. If we need additional information, we\'ll reach out directly.'
  },
  {
    id: 'products',
    question: 'What products can I sell?',
    answer: 'We accept all construction materials, tools, and supplies including lumber, hardware, plumbing, electrical, HVAC, flooring, roofing materials, and more. Products must be new (not used) and meet safety standards. Restricted items include hazardous materials without proper certification.'
  },
  {
    id: 'payments',
    question: 'How do payments work?',
    answer: 'Payments are processed securely through our platform. You receive payouts directly to your bank account on your chosen schedule (daily, weekly, or monthly). We handle all payment processing, and you only pay when you make a sale. No upfront costs or monthly fees.'
  },
  {
    id: 'inventory',
    question: 'Can I use my existing inventory system?',
    answer: 'Yes! BuildEasy integrates with most major inventory management systems. You can also use our built-in inventory tracking or bulk upload your catalog via CSV. Real-time inventory sync keeps your stock levels accurate across all channels.'
  },
  {
    id: 'support',
    question: 'What support is available?',
    answer: 'All suppliers receive email and phone support during business hours. Premium and Enterprise tier suppliers get priority support and dedicated account managers. We also provide comprehensive onboarding assistance, video tutorials, and a supplier resource center.'
  },
  {
    id: 'returns',
    question: 'How do I handle returns?',
    answer: 'You set your own return policy within platform guidelines (minimum 14-day window). BuildEasy facilitates the return process, provides shipping labels when needed, and handles customer communication. You review return requests and approve based on your policy.'
  }
];

const requirements = [
  'Valid business registration or DBA',
  'Tax identification number (EIN or SSN)',
  'Business bank account for payments',
  'Product catalog with descriptions and images',
  'Delivery capabilities or pickup location',
  'Business insurance (recommended)'
];

// ============================================================================
// Main Component
// ============================================================================

const UV_BecomeSupplier: React.FC = () => {
  const navigate = useNavigate();
  
  // Global state access - CRITICAL: Individual selectors
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  
  // Local state
  const [activePricingTier, setActivePricingTier] = useState<'standard' | 'premium' | 'enterprise' | null>(null);
  const [faqExpandedIds, setFaqExpandedIds] = useState<string[]>([]);
  const [testimonialCarouselIndex, setTestimonialCarouselIndex] = useState(0);
  const [emailSignup, setEmailSignup] = useState('');
  const [emailSignupSubmitting, setEmailSignupSubmitting] = useState(false);
  const [emailSignupSuccess, setEmailSignupSuccess] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [emailError, setEmailError] = useState('');
  
  // Refs
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  // Check if user is already a supplier
  const isSupplier = currentUser?.role === 'supplier';

  // ========================================================================
  // Scroll Progress Tracking
  // ========================================================================

  useEffect(() => {
    const handleScroll = () => {
      if (scrollThrottleRef.current) return;
      
      scrollThrottleRef.current = setTimeout(() => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = documentHeight > 0 ? (scrolled / documentHeight) * 100 : 0;
        
        setScrollProgress(progress);
        
        // Track engagement milestones (fire-and-forget analytics)
        if (progress >= 25 && progress < 26) {
          trackEngagement('scroll_depth', { depth: '25%' });
        } else if (progress >= 50 && progress < 51) {
          trackEngagement('scroll_depth', { depth: '50%' });
        } else if (progress >= 75 && progress < 76) {
          trackEngagement('scroll_depth', { depth: '75%' });
        } else if (progress >= 99) {
          trackEngagement('scroll_depth', { depth: '100%' });
        }
        
        scrollThrottleRef.current = null;
      }, 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollThrottleRef.current) {
        clearTimeout(scrollThrottleRef.current);
      }
    };
  }, []);

  // ========================================================================
  // Testimonial Carousel Auto-Advance
  // ========================================================================

  useEffect(() => {
    const startCarousel = () => {
      carouselIntervalRef.current = setInterval(() => {
        setTestimonialCarouselIndex(prev => 
          prev >= testimonials.length - 1 ? 0 : prev + 1
        );
      }, 8000);
    };

    startCarousel();

    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, []);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  const handleStartApplication = () => {
    trackEngagement('cta_click', { cta: 'start_application', location: 'hero' });
    
    if (isSupplier) {
      navigate('/supplier/dashboard');
    } else {
      // Navigate to application form (placeholder for now)
      navigate('/supplier/application');
    }
  };

  const handleScrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleFaqItem = (faqId: string) => {
    setFaqExpandedIds(prev => {
      if (prev.includes(faqId)) {
        return prev.filter(id => id !== faqId);
      } else {
        // Track FAQ interaction
        trackEngagement('faq_interaction', { faq_id: faqId });
        return [...prev, faqId];
      }
    });
  };

  const navigateCarousel = (direction: 'prev' | 'next') => {
    // Reset auto-advance timer
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
    }
    
    setTestimonialCarouselIndex(prev => {
      if (direction === 'next') {
        return prev >= testimonials.length - 1 ? 0 : prev + 1;
      } else {
        return prev <= 0 ? testimonials.length - 1 : prev - 1;
      }
    });

    // Restart auto-advance
    carouselIntervalRef.current = setInterval(() => {
      setTestimonialCarouselIndex(prev => 
        prev >= testimonials.length - 1 ? 0 : prev + 1
      );
    }, 8000);
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailSignup)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailSignupSubmitting(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      
      await axios.post(
        `${API_BASE_URL}/api/newsletter/subscribe`,
        {
          email: emailSignup,
          list_type: 'supplier_interest'
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      setEmailSignupSuccess(true);
      setEmailSignup('');
      
      // Track successful signup
      trackEngagement('email_signup', { source: 'supplier_interest' });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setEmailSignupSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setEmailError('Unable to sign up. Please try again.');
    } finally {
      setEmailSignupSubmitting(false);
    }
  };

  const trackEngagement = useCallback((eventType: string, eventData: any) => {
    // Fire-and-forget analytics (endpoint missing in backend, so wrapped in try-catch)
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    
    axios.post(
      `${API_BASE_URL}/api/analytics/engagement`,
      {
        page: 'become-supplier',
        event_type: eventType,
        event_data: eventData
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    ).catch(() => {
      // Silently fail - analytics shouldn't block UX
    });
  }, []);

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <>
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
          <div className="text-center">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Join BuildEasy and<br />
              <span className="text-blue-200">Grow Your Business</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Reach thousands of customers with powerful tools and no upfront costs. 
              Start selling construction materials online today.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleStartApplication}
                className="group px-8 py-4 bg-white text-blue-700 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                {isSupplier ? (
                  <>
                    <Store className="w-5 h-5" />
                    Go to My Dashboard
                  </>
                ) : (
                  <>
                    Start Application
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleScrollToSection(pricingRef)}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-700 transition-all duration-200"
              >
                See Pricing
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>No Setup Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>No Monthly Costs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>1-2 Day Approval</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Suppliers Choose BuildEasy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join hundreds of construction suppliers growing their business with our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={benefit.id}
                  className="bg-white border-2 border-gray-100 rounded-xl p-8 hover:border-blue-500 hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                    <Icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works for Suppliers
            </h2>
            <p className="text-xl text-gray-600">
              Get started in four simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Connector Line (desktop only) */}
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-300 -ml-4" 
                       style={{ width: 'calc(100% - 2rem)' }}></div>
                )}
                
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 relative z-10">
                  {/* Step Number */}
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg">
                    {step.number}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Only pay when you make a sale. No hidden fees.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                onMouseEnter={() => setActivePricingTier(tier.id)}
                onMouseLeave={() => setActivePricingTier(null)}
                onClick={() => trackEngagement('pricing_tier_click', { tier: tier.id })}
                className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 transition-all duration-200 cursor-pointer ${
                  tier.recommended 
                    ? 'border-blue-600 scale-105 lg:scale-110' 
                    : activePricingTier === tier.id
                      ? 'border-blue-500 scale-105'
                      : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {tier.name}
                  </h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {tier.commission_rate}
                  </div>
                  <p className="text-gray-600 text-sm">commission per sale</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={handleStartApplication}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    tier.recommended
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
          
          {/* Pricing Details */}
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Payment Processing</h4>
                <p className="text-gray-600 text-sm">2.9% + $0.30 per transaction</p>
              </div>
              <div>
                <Package className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">No Monthly Fees</h4>
                <p className="text-gray-600 text-sm">Unlimited product listings included</p>
              </div>
              <div>
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Flexible Payouts</h4>
                <p className="text-gray-600 text-sm">Daily, weekly, or monthly - your choice</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories / Testimonials */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              See how suppliers are growing with BuildEasy
            </p>
          </div>
          
          {/* Testimonial Carousel */}
          <div 
            className="relative max-w-4xl mx-auto"
            onMouseEnter={() => {
              if (carouselIntervalRef.current) {
                clearInterval(carouselIntervalRef.current);
              }
            }}
            onMouseLeave={() => {
              carouselIntervalRef.current = setInterval(() => {
                setTestimonialCarouselIndex(prev => 
                  prev >= testimonials.length - 1 ? 0 : prev + 1
                );
              }, 8000);
            }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
              {/* Testimonial Content */}
              <div className="transition-opacity duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Store className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {testimonials[testimonialCarouselIndex].supplier_name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{testimonials[testimonialCarouselIndex].location}</span>
                    </div>
                  </div>
                </div>
                
                <blockquote className="text-lg text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonials[testimonialCarouselIndex].quote}"
                </blockquote>
                
                <div className="flex items-center justify-between">
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <span className="text-green-700 font-semibold text-sm">
                      {testimonials[testimonialCarouselIndex].result}
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm">
                    Joined in {testimonials[testimonialCarouselIndex].joined_date}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Carousel Navigation */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => navigateCarousel('prev')}
                aria-label="Previous testimonial"
                className="p-2 rounded-full bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              
              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setTestimonialCarouselIndex(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                      index === testimonialCarouselIndex 
                        ? 'bg-blue-600 w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={() => navigateCarousel('next')}
                aria-label="Next testimonial"
                className="p-2 rounded-full bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Get answers to common supplier questions
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq) => {
              const isExpanded = faqExpandedIds.includes(faq.id);
              
              return (
                <div 
                  key={faq.id}
                  className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors"
                >
                  <button
                    onClick={() => toggleFaqItem(faq.id)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    aria-expanded={isExpanded}
                  >
                    <span className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      className={`w-6 h-6 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                        isExpanded ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 pb-5 pt-2">
                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What You Need to Apply
            </h2>
            <p className="text-xl text-gray-600">
              Make sure you have these ready before starting your application
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <ul className="space-y-4">
              {requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg text-gray-700">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 lg:p-12 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Want to Learn More?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get updates about supplier features, success tips, and promotional opportunities
            </p>
            
            {emailSignupSuccess ? (
              <div className="bg-white rounded-lg p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-900 font-semibold text-lg">
                  Thank you for your interest!
                </p>
                <p className="text-gray-600 mt-2">
                  We'll send you updates and helpful resources.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEmailSignup} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={emailSignup}
                      onChange={(e) => {
                        setEmailSignup(e.target.value);
                        setEmailError('');
                      }}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300"
                      disabled={emailSignupSubmitting}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={emailSignupSubmitting || !emailSignup}
                    className="px-6 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {emailSignupSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Notify Me'
                    )}
                  </button>
                </div>
                {emailError && (
                  <p className="text-red-200 text-sm mt-2 text-left">{emailError}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join BuildEasy today and start reaching thousands of customers
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={handleStartApplication}
              className="px-10 py-5 bg-white text-blue-700 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              {isSupplier ? (
                <>
                  <Store className="w-6 h-6" />
                  Go to Dashboard
                </>
              ) : (
                <>
                  Start Your Application
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
            
            <Link
              to="/contact"
              className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white hover:text-blue-700 transition-all duration-200 flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Questions? Contact Us
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-blue-200 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>4.8/5 Supplier Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>500+ Active Suppliers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Average Approval: 24 Hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Progress Indicator (Optional) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-blue-600 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </>
  );
};

export default UV_BecomeSupplier;