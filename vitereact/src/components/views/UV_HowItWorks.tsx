import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { 
  Search, 
  ShoppingCart, 
  MapPin, 
  Star, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  Package, 
  Truck, 
  Users, 
  BarChart, 
  CreditCard, 
  Clock, 
  Award,
  Lock,
  ChevronDown,
  ChevronUp,
  Play,
  Home,
  Building2,
  Wrench,
  ArrowUp
} from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

type UserTypeTab = 'diy' | 'contractor' | 'supplier';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

// ============================================================================
// Static Content Data
// ============================================================================

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq_1',
    question: 'Is BuildEasy free to use?',
    answer: 'Yes! BuildEasy is completely free for customers. You can browse products, compare prices, and place orders without any subscription fees. We earn a small commission from suppliers when you make a purchase, which allows us to keep the platform free for buyers.'
  },
  {
    id: 'faq_2',
    question: 'How do I track my order?',
    answer: 'After placing an order, you\'ll receive instant confirmation via email and SMS with a tracking link. You can track your order in real-time from your account dashboard or by clicking the tracking link. For orders out for delivery, you\'ll get GPS tracking showing the exact location of the delivery vehicle and estimated arrival time.'
  },
  {
    id: 'faq_3',
    question: 'What if I receive wrong or damaged items?',
    answer: 'If you receive damaged or incorrect items, you can request a return within 30 days of delivery directly from your order page. Simply upload photos of the issue, select the items to return, and our team will coordinate with the supplier to arrange pickup or provide a return shipping label. You\'ll receive a full refund once the return is processed.'
  },
  {
    id: 'faq_4',
    question: 'Can I cancel my order?',
    answer: 'Yes, you can cancel your order before it ships. Once an order is accepted by the supplier but not yet shipped, you can cancel it from your order detail page and receive a full refund within 5-7 business days. If the order has already shipped, you\'ll need to request a return instead.'
  },
  {
    id: 'faq_5',
    question: 'How do I become a supplier?',
    answer: 'To become a supplier on BuildEasy, click the "Become a Supplier" button and complete the application form with your business information, tax details, and required documents. Our team reviews applications within 1-2 business days. Once approved, you\'ll receive onboarding instructions to set up your shop and start listing products.'
  },
  {
    id: 'faq_6',
    question: 'Is my payment information secure?',
    answer: 'Absolutely. BuildEasy uses industry-standard encryption (SSL/TLS) and is PCI DSS compliant. We never store your full card details - only encrypted payment tokens from our secure payment partners. All transactions are processed through trusted payment gateways like Stripe, ensuring your financial information stays protected.'
  }
];

// ============================================================================
// Main Component
// ============================================================================

const UV_HowItWorks: React.FC = () => {
  const navigate = useNavigate();
  
  // Global state - individual selectors to avoid infinite loops
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  
  // Local state
  const [activeUserTypeTab, setActiveUserTypeTab] = useState<UserTypeTab>('diy');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [expandedFaqIds, setExpandedFaqIds] = useState<string[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Refs for smooth scrolling
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // ========================================================================
  // Scroll Tracking
  // ========================================================================
  
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
      setShowBackToTop(position > 400);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // ========================================================================
  // Action Handlers
  // ========================================================================
  
  const switchUserTypeTab = (tab: UserTypeTab) => {
    setActiveUserTypeTab(tab);
  };
  
  const toggleFaqItem = (faqId: string) => {
    setExpandedFaqIds(prev => 
      prev.includes(faqId) 
        ? prev.filter(id => id !== faqId)
        : [...prev, faqId]
    );
  };
  
  const playDemoVideo = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
        setVideoPlaying(false);
      } else {
        videoRef.current.play();
        setVideoPlaying(true);
      }
    }
  };
  
  const navigateToGetStarted = () => {
    if (currentUser) {
      navigate('/search');
    } else {
      navigate('/register');
    }
  };
  
  const navigateToBecomeSupplier = () => {
    navigate('/become-a-supplier');
  };
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // ========================================================================
  // Render
  // ========================================================================
  
  return (
    <>
      <div className="min-h-screen bg-white">
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                How BuildEasy Works
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto mb-8">
                The smarter way to shop for construction materials with{' '}
                <span className="text-blue-600 font-semibold">real-time inventory</span>,{' '}
                <span className="text-blue-600 font-semibold">transparent pricing</span>, and{' '}
                <span className="text-blue-600 font-semibold">reliable delivery</span>
              </p>
              
              {/* Quick navigation to steps */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <button
                  onClick={() => scrollToSection('step-1')}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium"
                >
                  Search & Compare
                </button>
                <button
                  onClick={() => scrollToSection('step-2')}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium"
                >
                  Order
                </button>
                <button
                  onClick={() => scrollToSection('step-3')}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium"
                >
                  Track Delivery
                </button>
                <button
                  onClick={() => scrollToSection('step-4')}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium"
                >
                  Review
                </button>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mr-40 -mt-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        </section>
        
        {/* Demo Video Section */}
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                See BuildEasy in Action
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Watch this quick 90-second overview to see how easy it is to find, order, and track construction materials
              </p>
            </div>
            
            <div className="relative bg-black rounded-xl shadow-2xl overflow-hidden aspect-video">
              {/* Video player */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='675'%3E%3Crect fill='%23111827' width='1200' height='675'/%3E%3Ctext fill='%23fff' font-size='48' font-family='sans-serif' text-anchor='middle' x='600' y='337.5'%3EBuildEasy Demo%3C/text%3E%3C/svg%3E"
                controls
                muted
                onPlay={() => setVideoPlaying(true)}
                onPause={() => setVideoPlaying(false)}
                onEnded={() => setVideoPlaying(false)}
              >
                <source src="https://cdn.example.com/buildeasy-demo.mp4" type="video/mp4" />
                <track kind="captions" src="https://cdn.example.com/buildeasy-captions.vtt" label="English" />
                Your browser does not support the video tag.
              </video>
              
              {/* Play/Pause overlay button */}
              {!videoPlaying && (
                <button
                  onClick={playDemoVideo}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all duration-200 group"
                  aria-label="Play video"
                >
                  <div className="w-20 h-20 rounded-full bg-white bg-opacity-90 group-hover:bg-opacity-100 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-200">
                    <Play className="w-10 h-10 text-blue-600 ml-1" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </section>
        
        {/* Main Steps Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Step 1: Search and Compare */}
            <div id="step-1" className="mb-20 lg:mb-32 scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8 shadow-lg border border-blue-200">
                    {/* Screenshot placeholder */}
                    <div className="bg-white rounded-lg shadow-xl overflow-hidden aspect-video">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-50 h-full flex items-center justify-center">
                        <div className="text-center">
                          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">Search Results Interface</p>
                          <p className="text-sm text-gray-400 mt-2">Multiple suppliers • Real-time inventory • Transparent pricing</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="order-1 lg:order-2">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg mr-4">
                      1
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                      Search and Compare
                    </h2>
                  </div>
                  
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p className="text-lg">
                      Find exactly what you need from multiple suppliers in one place. Our platform makes it easy to discover the best materials at the best prices.
                    </p>
                    
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">Search by keyword or browse categories</strong> - Find products quickly using our powerful search or explore organized categories</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">Real-time inventory status</strong> - See exactly what's available right now, no surprises when ordering</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">Transparent pricing</strong> - All costs shown upfront including delivery and taxes</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">Verified supplier ratings and reviews</strong> - Real feedback from customers who bought before you</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step 2: Order with Confidence */}
            <div id="step-2" className="mb-20 lg:mb-32 scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg mr-4">
                      2
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                      Order with Confidence
                    </h2>
                  </div>
                  
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p className="text-lg">
                      Complete your purchase with ease and flexibility. Our streamlined checkout ensures you know exactly what you're getting and when.
                    </p>
                    
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <ShoppingCart className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">Add products from multiple suppliers</strong> - Build your cart with everything you need in one order</span>
                      </li>
                      <li className="flex items-start">
                        <CreditCard className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">Complete order summary</strong> - Review all costs, delivery fees, and taxes before confirming</span>
                      </li>
                      <li className="flex items-start">
                        <Clock className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">Choose delivery windows</strong> - Select times that fit your schedule, including same-day options</span>
                      </li>
                      <li className="flex items-start">
                        <Shield className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">Secure payment options</strong> - Credit card, trade credit for businesses, or pay on delivery</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl p-8 shadow-lg border border-indigo-200">
                    {/* Screenshot placeholder */}
                    <div className="bg-white rounded-lg shadow-xl overflow-hidden aspect-[4/3]">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-50 h-full flex items-center justify-center">
                        <div className="text-center">
                          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">Checkout Interface</p>
                          <p className="text-sm text-gray-400 mt-2">Transparent pricing • Flexible delivery • Secure payment</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step 3: Track Your Delivery */}
            <div id="step-3" className="mb-20 lg:mb-32 scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-8 shadow-lg border border-green-200">
                    {/* Screenshot placeholder */}
                    <div className="bg-white rounded-lg shadow-xl overflow-hidden aspect-video">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-50 h-full flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">GPS Tracking Map</p>
                          <p className="text-sm text-gray-400 mt-2">Real-time location • ETA updates • Delivery notifications</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="order-1 lg:order-2">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg mr-4">
                      3
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                      Track Your Delivery
                    </h2>
                  </div>
                  
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p className="text-lg">
                      Stay informed every step of the way. From confirmation to doorstep, you'll always know where your materials are.
                    </p>
                    
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">Instant confirmation</strong> - Receive order confirmation immediately via email and SMS</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">Real-time status updates</strong> - Track every stage from processing to delivery</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">GPS tracking when dispatched</strong> - See exactly where the delivery vehicle is with live map updates</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">Proactive delay notifications</strong> - Get notified immediately if any issues arise with new ETAs</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step 4: Rate and Review */}
            <div id="step-4" className="scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg mr-4">
                      4
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                      Rate and Review
                    </h2>
                  </div>
                  
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p className="text-lg">
                      Share your experience to help the community. Your feedback helps other shoppers make informed decisions.
                    </p>
                    
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Star className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">Confirm delivery receipt</strong> - Let us know when your order arrives safely</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">Rate products and suppliers</strong> - Share your experience with quality, delivery, and service</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-gray-900">Upload photos</strong> - Show others the quality and condition of materials you received</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl p-8 shadow-lg border border-yellow-200">
                    {/* Screenshot placeholder */}
                    <div className="bg-white rounded-lg shadow-xl overflow-hidden aspect-[4/3]">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-50 h-full flex items-center justify-center">
                        <div className="text-center">
                          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">Review Submission Form</p>
                          <p className="text-sm text-gray-400 mt-2">Rate products • Upload photos • Help shoppers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits for Different Users Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Built for Everyone
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Whether you're a DIY homeowner, professional contractor, or construction supplier, BuildEasy has features tailored for you
              </p>
            </div>
            
            {/* User Type Tabs */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-lg bg-white p-1 shadow-lg border border-gray-200">
                <button
                  onClick={() => switchUserTypeTab('diy')}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    activeUserTypeTab === 'diy'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-5 h-5 inline mr-2" />
                  DIY Homeowners
                </button>
                <button
                  onClick={() => switchUserTypeTab('contractor')}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    activeUserTypeTab === 'contractor'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Wrench className="w-5 h-5 inline mr-2" />
                  Contractors
                </button>
                <button
                  onClick={() => switchUserTypeTab('supplier')}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    activeUserTypeTab === 'supplier'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-5 h-5 inline mr-2" />
                  Suppliers
                </button>
              </div>
            </div>
            
            {/* Benefits Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeUserTypeTab === 'diy' && (
                <>
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Easy Price Comparison</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Compare prices from multiple suppliers instantly without calling around or visiting multiple stores
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Detailed Product Info</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Get complete specifications, installation guides, and honest reviews to make informed decisions
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Scheduled Delivery</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Choose delivery windows that work for you, ensuring someone's home to receive materials
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Community Help</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Access how-to guides, forums, and project showcases from experienced DIYers and pros
                    </p>
                  </div>
                </>
              )}
              
              {activeUserTypeTab === 'contractor' && (
                <>
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Trade Pricing Access</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Get contractor discounts and net-30 payment terms to improve cash flow on projects
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Reorder</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Save your frequent materials and reorder with one click - perfect for recurring supplies
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                      <BarChart className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Project Organization</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Create project workspaces to manage multiple job sites with separate orders and budgets
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Bulk Order Discounts</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Unlock volume pricing automatically when ordering larger quantities for big projects
                    </p>
                  </div>
                </>
              )}
              
              {activeUserTypeTab === 'supplier' && (
                <>
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Reach New Customers</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Connect with thousands of buyers actively searching for construction materials in your area
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Streamlined Management</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Manage orders, inventory, and deliveries from one central dashboard built for efficiency
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                      <BarChart className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics & Insights</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Understand your sales trends, top products, and customer behavior with powerful analytics
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                      <Truck className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Flexible Delivery</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Set your own delivery zones, pricing, and schedules to balance reach with operational capacity
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Got questions? We've got answers.
              </p>
            </div>
            
            <div className="space-y-4">
              {FAQ_ITEMS.map((faq) => {
                const isExpanded = expandedFaqIds.includes(faq.id);
                
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg"
                  >
                    <button
                      onClick={() => toggleFaqItem(faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                      aria-expanded={isExpanded}
                      aria-controls={`faq-answer-${faq.id}`}
                    >
                      <span className="text-lg font-semibold text-gray-900 pr-8">
                        {faq.question}
                      </span>
                      <span className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400" />
                        )}
                      </span>
                    </button>
                    
                    {isExpanded && (
                      <div
                        id={`faq-answer-${faq.id}`}
                        className="px-6 py-4 bg-gray-50 border-t border-gray-200 animate-fadeIn"
                      >
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">
                Didn't find what you're looking for?
              </p>
              <Link
                to="/help"
                className="inline-flex items-center px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Visit Help Center
              </Link>
            </div>
          </div>
        </section>
        
        {/* Trust and Security Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Your Trust, Our Priority
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We take security and reliability seriously so you can shop with complete peace of mind
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Security badges */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  SSL Secure Encryption
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  All data transmitted between your browser and our servers is encrypted with 256-bit SSL security
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  PCI Compliant
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Payment processing meets the highest industry standards for protecting your financial information
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Verified Suppliers
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  All suppliers are verified with business registration checks to ensure legitimacy and quality
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Buyer Protection
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our buyer protection guarantee ensures you get what you ordered or your money back
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Money-Back Guarantee
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  If there's an issue with your order, we'll work with the supplier to make it right or refund you
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  24/7 Support
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our support team is always available to help with questions, issues, or order tracking
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call-to-Action Footer */}
        <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Join thousands of customers and suppliers using BuildEasy to simplify construction material procurement
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={navigateToGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                {currentUser ? 'Continue Shopping' : 'Get Started'}
              </button>
              
              <button
                onClick={navigateToBecomeSupplier}
                className="w-full sm:w-auto px-8 py-4 bg-blue-700 text-white rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-blue-800 hover:scale-105 transition-all duration-200 border-2 border-white"
              >
                Become a Supplier
              </button>
              
              <Link
                to="/help"
                className="w-full sm:w-auto px-8 py-4 bg-transparent text-white rounded-lg font-medium text-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Visit Help Center
              </Link>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-blue-100">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Free to browse and order</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all duration-200 flex items-center justify-center z-50 animate-fadeIn"
            aria-label="Back to top"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        )}
      </div>
      
      {/* Add custom animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </>
  );
};

export default UV_HowItWorks;