import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Heart, 
  Leaf, 
  ShoppingBag,
  TruckIcon,
  PieChart,
  Zap,
  Clock,
  Award,
  Target,
  Eye
} from 'lucide-react';

// ============================================================================
// Static Content Definitions
// ============================================================================

const COMPANY_STORY = `BuildEasy was born from a simple observation: construction professionals waste countless 
hours calling multiple suppliers, comparing prices, checking inventory, and coordinating deliveries. Our founders, 
experienced contractors themselves, saw how this inefficiency added days to projects and thousands in unnecessary costs.

In 2023, we set out to solve this problem with technology. By bringing construction material suppliers onto a unified 
platform with real-time inventory, transparent pricing, and streamlined ordering, we eliminate the friction that has 
plagued the industry for decades.

Today, BuildEasy connects thousands of shoppers with verified suppliers across the country, making construction material 
procurement as simple as shopping online should be.`;

const MISSION_STATEMENT = `Our mission is to eliminate friction in construction material procurement by providing 
real-time transparency, verified suppliers, and reliable service that saves time and reduces costs for every project.`;

const VISION_STATEMENT = `To become the go-to platform for all construction material needs nationwide, empowering 
professionals and homeowners with tools that make building easier, faster, and more sustainable.`;

const CORE_VALUES = [
  {
    value_name: 'Trust',
    value_description: 'Verified suppliers, transparent pricing, and real-time inventory you can rely on.',
    icon_component: CheckCircle,
  },
  {
    value_name: 'Innovation',
    value_description: 'Continuously improving our platform with the latest technology and user feedback.',
    icon_component: TrendingUp,
  },
  {
    value_name: 'Customer Focus',
    value_description: 'Putting shoppers and suppliers at the center of every decision we make.',
    icon_component: Heart,
  },
  {
    value_name: 'Sustainability',
    value_description: 'Promoting eco-friendly practices and reducing waste through our secondary marketplace.',
    icon_component: Leaf,
  },
  {
    value_name: 'Community',
    value_description: 'Building connections between construction professionals and sharing knowledge.',
    icon_component: Users,
  },
];

const TIMELINE_MILESTONES = [
  {
    year: '2023',
    milestone_title: 'Company Founded',
    milestone_description: 'BuildEasy was established with a vision to transform construction material procurement.',
  },
  {
    year: '2024',
    milestone_title: 'Beta Launch',
    milestone_description: 'Launched beta platform with initial suppliers and early adopter customers.',
  },
  {
    year: '2024',
    milestone_title: 'Official Launch',
    milestone_description: 'Full public launch with expanded supplier network and feature-complete platform.',
  },
  {
    year: '2025',
    milestone_title: 'Nationwide Expansion',
    milestone_description: 'Planned expansion to all 50 states with enhanced delivery network.',
  },
];

const SHOPPER_BENEFITS = [
  {
    title: 'Save Time',
    description: 'Compare prices across suppliers instantly instead of making dozens of phone calls.',
    icon_component: Clock,
  },
  {
    title: 'Shop with Confidence',
    description: 'Real-time inventory and verified suppliers mean you know exactly what you\'re getting.',
    icon_component: Award,
  },
  {
    title: 'Ultimate Convenience',
    description: 'Track deliveries, schedule windows, and manage orders all from your dashboard.',
    icon_component: TruckIcon,
  },
  {
    title: 'Learn from Experts',
    description: 'Access how-to guides and connect with experienced construction professionals.',
    icon_component: Users,
  },
];

const SUPPLIER_BENEFITS = [
  {
    title: 'Reach New Customers',
    description: 'Expand beyond your local area and connect with customers across the region.',
    icon_component: Target,
  },
  {
    title: 'Streamlined Operations',
    description: 'Automated order management saves time and reduces manual errors.',
    icon_component: Zap,
  },
  {
    title: 'Valuable Insights',
    description: 'Sales analytics and customer data help you optimize inventory and pricing.',
    icon_component: PieChart,
  },
  {
    title: 'Marketing Support',
    description: 'Benefit from platform-wide marketing and featured supplier opportunities.',
    icon_component: Eye,
  },
];

// Hardcoded platform stats (recommended for MVP per analysis)
const PLATFORM_STATS = {
  total_products_count: 2500,
  verified_suppliers_count: 120,
  total_orders_count: 5000,
  active_users_count: 1500,
};

// ============================================================================
// UV_AboutUs Component
// ============================================================================

const UV_AboutUs: React.FC = () => {
  // ========================================================================
  // Global State Access (CRITICAL: Individual selectors)
  // ========================================================================
  
  const currentUser = useAppStore(state => state.authentication_state.current_user);

  // ========================================================================
  // Local State
  // ========================================================================
  
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [stats] = useState(PLATFORM_STATS); // Using hardcoded stats for MVP

  // ========================================================================
  // Scroll Spy Implementation
  // ========================================================================
  
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: [0.5],
        rootMargin: '-100px 0px -100px 0px',
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // ========================================================================
  // Scroll to Section Handler
  // ========================================================================
  
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <>
      {/* Hero Section */}
      <section 
        id="hero"
        className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 lg:py-32 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              About BuildEasy
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Transforming construction material procurement with real-time transparency and reliable service
            </p>

            {/* Personalized Greeting for Authenticated Users */}
            {currentUser && (
              <div className="mt-8 inline-block">
                <p className="text-lg text-blue-100">
                  Welcome back, <span className="font-semibold text-white">{currentUser.name}</span>!
                </p>
              </div>
            )}

            {/* Quick Navigation Pills */}
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {['our-story', 'mission-vision', 'values', 'how-we-help'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeSection === section
                      ? 'bg-white text-blue-700 shadow-lg'
                      : 'bg-blue-500/30 text-white hover:bg-blue-500/50 border border-blue-400/30'
                  }`}
                >
                  {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators Bar */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {stats.total_products_count.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-600 font-medium">Products Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {stats.verified_suppliers_count}+
              </div>
              <div className="text-sm text-gray-600 font-medium">Verified Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {stats.total_orders_count.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-600 font-medium">Orders Fulfilled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {stats.active_users_count.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-600 font-medium">Happy Customers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section 
        id="our-story"
        className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Story
            </h2>
            <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed">
              <p className="whitespace-pre-line">{COMPANY_STORY}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-600 via-blue-500 to-blue-400"></div>

              {/* Timeline Items */}
              <div className="space-y-12">
                {TIMELINE_MILESTONES.map((milestone, index) => (
                  <div 
                    key={milestone.year}
                    className={`relative flex items-center ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    } flex-col md:gap-8`}
                  >
                    {/* Content Card */}
                    <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                        <div className="text-sm font-semibold text-blue-600 mb-2">
                          {milestone.year}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {milestone.milestone_title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {milestone.milestone_description}
                        </p>
                      </div>
                    </div>

                    {/* Timeline Dot */}
                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-blue-600 rounded-full items-center justify-center shadow-lg z-10 border-4 border-white">
                      <div className="text-white font-bold text-lg">{milestone.year.slice(2)}</div>
                    </div>

                    {/* Spacer */}
                    <div className="hidden md:block w-5/12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section 
        id="mission-vision"
        className="py-16 lg:py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Mission & Vision
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Mission Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100 shadow-lg shadow-blue-200/50">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 rounded-full p-3 mr-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {MISSION_STATEMENT}
              </p>
            </div>

            {/* Vision Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-100 shadow-lg shadow-indigo-200/50">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-600 rounded-full p-3 mr-4">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {VISION_STATEMENT}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section 
        id="values"
        className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do at BuildEasy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CORE_VALUES.map((value) => {
              const IconComponent = value.icon_component;
              return (
                <div 
                  key={value.value_name}
                  className="bg-white rounded-xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.value_name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.value_description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section 
        id="how-we-help"
        className="py-16 lg:py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              How We Help
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              BuildEasy empowers both shoppers and suppliers with tools that make construction easier
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* For Shoppers */}
            <div>
              <div className="flex items-center mb-8">
                <div className="bg-blue-600 rounded-full p-4 mr-4">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">For Shoppers</h3>
              </div>

              <div className="space-y-6">
                {SHOPPER_BENEFITS.map((benefit) => {
                  const IconComponent = benefit.icon_component;
                  return (
                    <div 
                      key={benefit.title}
                      className="flex items-start space-x-4 p-4 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                    >
                      <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Start Shopping
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* For Suppliers */}
            <div>
              <div className="flex items-center mb-8">
                <div className="bg-indigo-600 rounded-full p-4 mr-4">
                  <TruckIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">For Suppliers</h3>
              </div>

              <div className="space-y-6">
                {SUPPLIER_BENEFITS.map((benefit) => {
                  const IconComponent = benefit.icon_component;
                  return (
                    <div 
                      key={benefit.title}
                      className="flex items-start space-x-4 p-4 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
                    >
                      <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
                        <IconComponent className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <Link
                  to="/become-a-supplier"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Become a Supplier
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Construction Procurement?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust BuildEasy for their material needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!currentUser ? (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-200"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/how-it-works"
                  className="px-8 py-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 border-2 border-blue-400 shadow-xl hover:shadow-2xl transition-all duration-200"
                >
                  Learn How It Works
                </Link>
              </>
            ) : (
              <Link
                to="/"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-200"
              >
                Browse Products
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Still have questions?
              </h3>
              <p className="text-gray-600">
                Our team is here to help you get started
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/contact"
                className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                Contact Us
              </Link>
              <Link
                to="/help"
                className="px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default UV_AboutUs;