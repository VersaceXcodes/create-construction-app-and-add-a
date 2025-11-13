import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Package, 
  CreditCard, 
  Truck, 
  RefreshCw, 
  Settings, 
  HelpCircle, 
  Store,
  ThumbsUp,
  ThumbsDown,
  Phone,
  Mail,
  MessageCircle,
  ChevronRight,
  Home,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

interface HelpCategory {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_description: string;
  article_count: number;
}

interface HelpArticle {
  article_id: string;
  article_title: string;
  article_excerpt: string;
  article_content: string;
  category_id: string;
  category_name: string;
  last_updated: string;
  helpful_votes_positive: number;
  helpful_votes_negative: number;
  view_count: number;
  helpful_count: number;
  related_article_ids: string[];
  estimated_read_minutes: number;
  tags: string[];
}

interface AutocompleteSuggestion {
  suggestion_text: string;
  article_id: string | null;
  type: 'article' | 'category' | 'popular';
}

// ============================================================================
// Mock Data (simulating backend responses)
// ============================================================================

const MOCK_CATEGORIES: HelpCategory[] = [
  {
    category_id: 'cat_getting_started',
    category_name: 'Getting Started',
    category_icon: 'BookOpen',
    category_description: 'Learn the basics of using BuildEasy',
    article_count: 12,
  },
  {
    category_id: 'cat_orders_tracking',
    category_name: 'Orders & Tracking',
    category_icon: 'Package',
    category_description: 'Track orders and manage deliveries',
    article_count: 18,
  },
  {
    category_id: 'cat_payments_billing',
    category_name: 'Payments & Billing',
    category_icon: 'CreditCard',
    category_description: 'Payment methods and billing questions',
    article_count: 10,
  },
  {
    category_id: 'cat_shipping_delivery',
    category_name: 'Shipping & Delivery',
    category_icon: 'Truck',
    category_description: 'Delivery options and scheduling',
    article_count: 15,
  },
  {
    category_id: 'cat_returns_refunds',
    category_name: 'Returns & Refunds',
    category_icon: 'RefreshCw',
    category_description: 'Return process and refund timelines',
    article_count: 8,
  },
  {
    category_id: 'cat_account_settings',
    category_name: 'Account & Settings',
    category_icon: 'Settings',
    category_description: 'Manage your account and preferences',
    article_count: 14,
  },
  {
    category_id: 'cat_product_questions',
    category_name: 'Product Questions',
    category_icon: 'HelpCircle',
    category_description: 'Product specifications and usage',
    article_count: 20,
  },
  {
    category_id: 'cat_supplier_questions',
    category_name: 'Supplier Questions',
    category_icon: 'Store',
    category_description: 'Working with suppliers',
    article_count: 9,
  },
];

const MOCK_ARTICLES: HelpArticle[] = [
  {
    article_id: 'art_track_order',
    article_title: 'How to Track Your Order',
    article_excerpt: 'Learn how to track your order in real-time and see estimated delivery times.',
    article_content: `
# How to Track Your Order

Once your order has been shipped, you can track it in real-time through our platform.

## Accessing Order Tracking

1. Log in to your account
2. Navigate to "My Orders" from your dashboard
3. Find the order you want to track
4. Click "Track Order"

## Understanding Tracking Information

Your tracking page shows:
- Current order status
- Estimated delivery time
- GPS location (when out for delivery)
- Delivery updates timeline

## Real-Time GPS Tracking

When your order is out for delivery, you'll see:
- Live location of the delivery vehicle on a map
- Estimated time of arrival
- Driver contact information (if available)

## Tracking Without Login

If you checked out as a guest, use the tracking link sent to your email. You'll need:
- Your order number
- Email address used for the order

## Common Questions

**Q: How often does tracking update?**
A: GPS tracking updates every 30-60 seconds when the order is out for delivery.

**Q: What if tracking shows no updates?**
A: Contact the supplier directly through the messaging system or reach out to our support team.
    `,
    category_id: 'cat_orders_tracking',
    category_name: 'Orders & Tracking',
    last_updated: '2024-12-01T10:00:00Z',
    helpful_votes_positive: 145,
    helpful_votes_negative: 8,
    view_count: 2340,
    helpful_count: 145,
    related_article_ids: ['art_delivery_issues', 'art_order_status', 'art_contact_supplier'],
    estimated_read_minutes: 3,
    tags: ['tracking', 'delivery', 'gps', 'orders'],
  },
  {
    article_id: 'art_first_order',
    article_title: 'Placing Your First Order',
    article_excerpt: 'Step-by-step guide to placing your first order on BuildEasy.',
    article_content: `
# Placing Your First Order

Welcome to BuildEasy! This guide will walk you through placing your first order.

## Step 1: Find Your Products

- Use the search bar to find specific materials
- Browse categories to explore options
- Filter by price, location, and availability

## Step 2: Add to Cart

1. Select the quantity you need
2. Choose any product variants (size, color, etc.)
3. Click "Add to Cart"
4. Review your cart by clicking the cart icon

## Step 3: Review Your Cart

- Check all items and quantities
- Apply any promo codes
- Review delivery estimates
- Proceed to checkout

## Step 4: Complete Checkout

1. Enter or select delivery address
2. Choose delivery window
3. Select payment method
4. Review order summary
5. Place your order

## What Happens Next?

- You'll receive an order confirmation email
- The supplier will accept your order (usually within 24 hours)
- Track your order through "My Orders"
- Receive delivery notifications

## Tips for First-Time Buyers

- Check supplier ratings and reviews
- Compare prices across suppliers
- Note delivery lead times
- Save frequently ordered items to wishlist
    `,
    category_id: 'cat_getting_started',
    category_name: 'Getting Started',
    last_updated: '2024-11-28T14:30:00Z',
    helpful_votes_positive: 203,
    helpful_votes_negative: 12,
    view_count: 3120,
    helpful_count: 203,
    related_article_ids: ['art_track_order', 'art_payment_methods', 'art_delivery_options'],
    estimated_read_minutes: 5,
    tags: ['getting started', 'first order', 'checkout', 'beginner'],
  },
  {
    article_id: 'art_payment_methods',
    article_title: 'Payment Methods & Security',
    article_excerpt: 'Learn about accepted payment methods and how we keep your payments secure.',
    article_content: `
# Payment Methods & Security

BuildEasy accepts various payment methods for your convenience.

## Accepted Payment Methods

- **Credit & Debit Cards**: Visa, Mastercard, American Express, Discover
- **Digital Wallets**: Apple Pay, Google Pay, PayPal
- **Trade Credit**: Available for approved business accounts
- **Pay on Delivery**: Cash or card payment on delivery (selected suppliers)

## Payment Security

Your payment information is protected by:
- 256-bit SSL encryption
- PCI DSS Level 1 compliance
- Tokenization - we never store full card numbers
- Fraud detection systems

## Managing Payment Methods

1. Go to Account Settings
2. Select "Payment Methods"
3. Add, edit, or remove payment methods
4. Set a default payment method

## Business Accounts & Trade Credit

Business customers can apply for trade credit:
- Net 30 or Net 60 payment terms
- Credit limits based on business verification
- Detailed invoicing and statements
- Easy online payment portal

## Common Questions

**Q: Is it safe to save my card?**
A: Yes, we use industry-standard tokenization and never store your full card number.

**Q: Can I use multiple payment methods?**
A: You can save multiple payment methods and choose at checkout.
    `,
    category_id: 'cat_payments_billing',
    category_name: 'Payments & Billing',
    last_updated: '2024-12-05T09:15:00Z',
    helpful_votes_positive: 178,
    helpful_votes_negative: 15,
    view_count: 1890,
    helpful_count: 178,
    related_article_ids: ['art_first_order', 'art_trade_credit', 'art_invoices'],
    estimated_read_minutes: 4,
    tags: ['payment', 'security', 'credit card', 'billing'],
  },
  {
    article_id: 'art_return_policy',
    article_title: 'Return Policy & Process',
    article_excerpt: 'Understand our return policy and how to request returns.',
    article_content: `
# Return Policy & Process

We want you to be completely satisfied with your purchase. Here's our return policy.

## Return Window

- Most items: 30 days from delivery
- Custom/special orders: 14 days
- Opened/used materials: May be subject to restocking fee

## Eligible Returns

Items can be returned if:
- Damaged during shipping
- Wrong item received
- Not as described
- Defective or doesn't work
- Changed your mind (unopened items)

## How to Request a Return

1. Go to "My Orders"
2. Find the order
3. Click "Request Return"
4. Select items to return
5. Choose reason and upload photos
6. Submit request

## Return Process

1. **Request Submitted**: Supplier reviews within 24 hours
2. **Approved**: Receive return shipping label or pickup scheduled
3. **Ship Item**: Pack securely and ship within 7 days
4. **Inspection**: Supplier inspects returned item
5. **Refund**: Processed within 5-7 business days

## Refund Information

- Refunds issued to original payment method
- Shipping costs may be deducted for change-of-mind returns
- Damaged/wrong items: Full refund including shipping

## Non-Returnable Items

- Hazardous materials
- Custom-cut or modified items
- Items marked "Final Sale"
- Opened chemicals or adhesives
    `,
    category_id: 'cat_returns_refunds',
    category_name: 'Returns & Refunds',
    last_updated: '2024-12-03T11:45:00Z',
    helpful_votes_positive: 167,
    helpful_votes_negative: 23,
    view_count: 2450,
    helpful_count: 167,
    related_article_ids: ['art_refund_timeline', 'art_damaged_items', 'art_contact_support'],
    estimated_read_minutes: 4,
    tags: ['returns', 'refunds', 'policy', 'damaged'],
  },
  {
    article_id: 'art_delivery_options',
    article_title: 'Delivery Options & Scheduling',
    article_excerpt: 'Choose the best delivery option for your needs and schedule deliveries.',
    article_content: `
# Delivery Options & Scheduling

BuildEasy offers flexible delivery options to fit your schedule.

## Available Delivery Speeds

### Same-Day Delivery
- Order by 11 AM for same-day delivery
- Available in select areas
- Premium pricing

### Next-Day Delivery
- Order by 6 PM for next-day delivery
- Most popular option
- Moderate pricing

### Standard Delivery (2-3 Days)
- Most economical option
- Available everywhere
- Free on orders over $500

## Scheduling Your Delivery

1. Select delivery window at checkout
2. Available windows shown based on supplier
3. Receive confirmation email with scheduled time
4. Get delivery reminder 30 minutes before arrival

## Delivery Windows

Typical windows available:
- Morning: 9 AM - 12 PM
- Afternoon: 12 PM - 3 PM
- Evening: 3 PM - 6 PM

## Pickup Option

Some suppliers offer free pickup:
- Check product page for "Pickup Available"
- Save on delivery costs
- Select pickup time at checkout
- Bring order confirmation and ID

## Rescheduling Deliveries

Need to reschedule?
1. Go to "Upcoming Deliveries"
2. Click "Reschedule"
3. Choose new date/time
4. Supplier will confirm availability

*Note: Rescheduling may not be available within 24 hours of delivery.*
    `,
    category_id: 'cat_shipping_delivery',
    category_name: 'Shipping & Delivery',
    last_updated: '2024-12-04T15:20:00Z',
    helpful_votes_positive: 134,
    helpful_votes_negative: 9,
    view_count: 1670,
    helpful_count: 134,
    related_article_ids: ['art_track_order', 'art_delivery_issues', 'art_free_delivery'],
    estimated_read_minutes: 3,
    tags: ['delivery', 'shipping', 'scheduling', 'pickup'],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

const getCategoryIcon = (iconName: string) => {
  const icons: Record<string, typeof BookOpen> = {
    BookOpen,
    Package,
    CreditCard,
    Truck,
    RefreshCw,
    Settings,
    HelpCircle,
    Store,
  };
  return icons[iconName] || HelpCircle;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query) return text;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 font-semibold">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
};

// ============================================================================
// Mock API Functions
// ============================================================================

const mockApiDelay = () => new Promise(resolve => setTimeout(resolve, 400));

const fetchHelpCategories = async (): Promise<HelpCategory[]> => {
  await mockApiDelay();
  return MOCK_CATEGORIES;
};

const fetchPopularArticles = async (limit: number = 10): Promise<HelpArticle[]> => {
  await mockApiDelay();
  return MOCK_ARTICLES.sort((a, b) => b.helpful_count - a.helpful_count).slice(0, limit);
};

const fetchArticleById = async (article_id: string): Promise<HelpArticle | null> => {
  await mockApiDelay();
  return MOCK_ARTICLES.find(a => a.article_id === article_id) || null;
};

const fetchCategoryArticles = async (category_id: string): Promise<HelpArticle[]> => {
  await mockApiDelay();
  return MOCK_ARTICLES.filter(a => a.category_id === category_id);
};

const searchArticles = async (query: string, category?: string): Promise<HelpArticle[]> => {
  await mockApiDelay();
  
  let results = MOCK_ARTICLES;
  
  if (category) {
    results = results.filter(a => a.category_id === category);
  }
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(a => 
      a.article_title.toLowerCase().includes(lowerQuery) ||
      a.article_content.toLowerCase().includes(lowerQuery) ||
      a.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
  
  return results;
};

const getAutocomplete = async (query: string): Promise<AutocompleteSuggestion[]> => {
  await mockApiDelay();
  
  const lowerQuery = query.toLowerCase();
  const suggestions: AutocompleteSuggestion[] = [];
  
  // Add matching articles
  MOCK_ARTICLES.forEach(article => {
    if (article.article_title.toLowerCase().includes(lowerQuery)) {
      suggestions.push({
        suggestion_text: article.article_title,
        article_id: article.article_id,
        type: 'article',
      });
    }
  });
  
  // Add matching categories
  MOCK_CATEGORIES.forEach(cat => {
    if (cat.category_name.toLowerCase().includes(lowerQuery)) {
      suggestions.push({
        suggestion_text: cat.category_name,
        article_id: null,
        type: 'category',
      });
    }
  });
  
  return suggestions.slice(0, 8);
};

const voteArticle = async (article_id: string, is_helpful: boolean): Promise<{ helpful_votes_positive: number; helpful_votes_negative: number }> => {
  await mockApiDelay();
  
  const article = MOCK_ARTICLES.find(a => a.article_id === article_id);
  if (!article) {
    throw new Error('Article not found');
  }
  
  // Simulate vote recording
  if (is_helpful) {
    article.helpful_votes_positive += 1;
  } else {
    article.helpful_votes_negative += 1;
  }
  
  return {
    helpful_votes_positive: article.helpful_votes_positive,
    helpful_votes_negative: article.helpful_votes_negative,
  };
};

// ============================================================================
// Main Component
// ============================================================================

const UV_HelpCenter: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get current user from global state (unused for now but may be needed for user-specific help)
  // const currentUser = useAppStore(state => state.authentication_state.current_user);
  
  // Local state matching datamap
  const [help_categories, setHelpCategories] = useState<HelpCategory[]>([]);
  const [popular_articles, setPopularArticles] = useState<HelpArticle[]>([]);
  const [search_query, setSearchQuery] = useState(searchParams.get('search_query') || '');
  const [search_results, setSearchResults] = useState<HelpArticle[]>([]);
  const [selected_category, setSelectedCategory] = useState(searchParams.get('category') || null);
  const [current_article, setCurrentArticle] = useState<HelpArticle | null>(null);
  const [related_articles, setRelatedArticles] = useState<HelpArticle[]>([]);
  const [articles_loading, setArticlesLoading] = useState(false);
  const [search_loading, setSearchLoading] = useState(false);
  const [article_error, setArticleError] = useState<string | null>(null);
  const [autocomplete_suggestions, setAutocompleteSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [user_voted_helpful, setUserVotedHelpful] = useState<{ article_id: string; vote: 'up' | 'down' } | null>(null);
  
  // UI state
  const [show_autocomplete, setShowAutocomplete] = useState(false);
  const [vote_feedback_visible, setVoteFeedbackVisible] = useState(false);
  
  // Determine current view mode
  const article_id = searchParams.get('article_id');
  const view_mode = article_id ? 'article' : 
                    search_query ? 'search' : 
                    selected_category ? 'category' : 
                    'homepage';
  
  // ========================================================================
  // Load initial data
  // ========================================================================
  
  useEffect(() => {
    const loadInitialData = async () => {
      setArticlesLoading(true);
      try {
        const [categories, popular] = await Promise.all([
          fetchHelpCategories(),
          fetchPopularArticles(),
        ]);
        setHelpCategories(categories);
        setPopularArticles(popular);
      } catch (error) {
        console.error('Failed to load help center data:', error);
        setArticleError('Failed to load help center. Please try again.');
      } finally {
        setArticlesLoading(false);
      }
    };
    
    loadInitialData();
  }, []);
  
  // ========================================================================
  // Load article by ID
  // ========================================================================
  
  useEffect(() => {
    if (article_id) {
      const loadArticle = async () => {
        setArticlesLoading(true);
        setArticleError(null);
        try {
          const article = await fetchArticleById(article_id);
          if (!article) {
            setArticleError('Article not found');
            setCurrentArticle(null);
          } else {
            setCurrentArticle(article);
            
            // Load related articles
            const related = article.related_article_ids
              .map(id => MOCK_ARTICLES.find(a => a.article_id === id))
              .filter(Boolean) as HelpArticle[];
            setRelatedArticles(related);
          }
        } catch (error) {
          setArticleError('Failed to load article');
        } finally {
          setArticlesLoading(false);
        }
      };
      
      loadArticle();
    } else {
      setCurrentArticle(null);
      setRelatedArticles([]);
    }
  }, [article_id]);
  
  // ========================================================================
  // Load category articles
  // ========================================================================
  
  useEffect(() => {
    if (selected_category && !article_id && !search_query) {
      const loadCategoryArticles = async () => {
        setArticlesLoading(true);
        try {
          const articles = await fetchCategoryArticles(selected_category);
          setSearchResults(articles);
        } catch (error) {
          setArticleError('Failed to load articles');
        } finally {
          setArticlesLoading(false);
        }
      };
      
      loadCategoryArticles();
    }
  }, [selected_category, article_id, search_query]);
  
  // ========================================================================
  // Search debounced
  // ========================================================================
  
  useEffect(() => {
    if (search_query && !article_id) {
      const timer = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const results = await searchArticles(search_query, selected_category || undefined);
          setSearchResults(results);
        } catch (error) {
          setArticleError('Search failed');
        } finally {
          setSearchLoading(false);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [search_query, selected_category, article_id]);
  
  // ========================================================================
  // Autocomplete debounced
  // ========================================================================
  
  useEffect(() => {
    if (search_query.length >= 2) {
      const timer = setTimeout(async () => {
        try {
          const suggestions = await getAutocomplete(search_query);
          setAutocompleteSuggestions(suggestions);
          setShowAutocomplete(true);
        } catch (error) {
          console.error('Autocomplete failed:', error);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setAutocompleteSuggestions([]);
      setShowAutocomplete(false);
    }
  }, [search_query]);
  
  // ========================================================================
  // Event Handlers
  // ========================================================================
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value) {
      setSearchParams({ search_query: value });
    } else {
      searchParams.delete('search_query');
      setSearchParams(searchParams);
    }
  };
  
  const handleCategoryClick = (category_id: string) => {
    setSelectedCategory(category_id);
    setSearchParams({ category: category_id });
    setSearchQuery('');
  };
  
  const handleArticleClick = (article_id: string) => {
    setSearchParams({ article_id });
    setShowAutocomplete(false);
  };
  
  const handleAutocompleteClick = (suggestion: AutocompleteSuggestion) => {
    if (suggestion.article_id) {
      handleArticleClick(suggestion.article_id);
    } else if (suggestion.type === 'category') {
      const category = help_categories.find(c => c.category_name === suggestion.suggestion_text);
      if (category) {
        handleCategoryClick(category.category_id);
      }
    } else {
      setSearchQuery(suggestion.suggestion_text);
      setShowAutocomplete(false);
    }
  };
  
  const handleVote = async (is_helpful: boolean) => {
    if (!current_article) return;
    
    // Prevent duplicate votes
    if (user_voted_helpful?.article_id === current_article.article_id) {
      return;
    }
    
    try {
      const result = await voteArticle(current_article.article_id, is_helpful);
      
      // Update current article with new vote counts
      setCurrentArticle({
        ...current_article,
        helpful_votes_positive: result.helpful_votes_positive,
        helpful_votes_negative: result.helpful_votes_negative,
      });
      
      // Record user vote
      setUserVotedHelpful({
        article_id: current_article.article_id,
        vote: is_helpful ? 'up' : 'down',
      });
      
      // Show feedback
      setVoteFeedbackVisible(true);
      setTimeout(() => setVoteFeedbackVisible(false), 3000);
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };
  
  const handleBackToHome = () => {
    setSearchParams({});
    setSearchQuery('');
    setSelectedCategory(null);
  };
  
  // ========================================================================
  // Render Functions
  // ========================================================================
  
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Help Center
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Find answers to common questions and learn how to get the most out of BuildEasy
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={search_query}
                    onChange={handleSearchChange}
                    onFocus={() => search_query.length >= 2 && setShowAutocomplete(true)}
                    onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                    placeholder="What can we help you with?"
                    className="block w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    aria-label="Search help articles"
                  />
                </div>
                
                {/* Autocomplete Dropdown */}
                {show_autocomplete && autocomplete_suggestions.length > 0 && (
                  <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
                    {autocomplete_suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleAutocompleteClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        {suggestion.type === 'article' ? (
                          <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                        <span className="text-gray-900">{suggestion.suggestion_text}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb Navigation */}
          {(selected_category || article_id) && (
            <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
              <button
                onClick={handleBackToHome}
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <Home className="h-4 w-4 mr-1" />
                Help Center
              </button>
              
              {selected_category && (
                <>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900 font-medium">
                    {help_categories.find(c => c.category_id === selected_category)?.category_name}
                  </span>
                </>
              )}
              
              {current_article && (
                <>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{current_article.article_title}</span>
                </>
              )}
            </nav>
          )}
          
          {/* Homepage View */}
          {view_mode === 'homepage' && (
            <>
              {/* Categories Grid */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Topic</h2>
                
                {articles_loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                        <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {help_categories.map((category) => {
                      const IconComponent = getCategoryIcon(category.category_icon);
                      return (
                        <button
                          key={category.category_id}
                          onClick={() => handleCategoryClick(category.category_id)}
                          className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-left group"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                              <IconComponent className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {category.category_name}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {category.category_description}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {category.article_count} articles
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Popular Articles */}
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Popular Articles</h2>
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                
                {articles_loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {popular_articles.map((article) => (
                      <button
                        key={article.article_id}
                        onClick={() => handleArticleClick(article.article_id)}
                        className="w-full bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {article.article_title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {article.article_excerpt}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {article.estimated_read_minutes} min read
                              </span>
                              <span className="flex items-center">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {article.helpful_count} helpful
                              </span>
                              <span>{article.view_count.toLocaleString()} views</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 ml-4 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Still Need Help */}
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Still Need Help?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => {/* Would open live chat widget */}}
                    className="flex flex-col items-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                  >
                    <MessageCircle className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-gray-900 mb-1">Live Chat</span>
                    <span className="text-sm text-gray-600 text-center">Chat with our support team</span>
                  </button>
                  
                  <a
                    href="tel:+18005551234"
                    className="flex flex-col items-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                  >
                    <Phone className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-gray-900 mb-1">Call Us</span>
                    <span className="text-sm text-gray-600 text-center">1-800-555-1234</span>
                  </a>
                  
                  <Link
                    to="/contact"
                    className="flex flex-col items-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                  >
                    <Mail className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-gray-900 mb-1">Email Us</span>
                    <span className="text-sm text-gray-600 text-center">Get help via email</span>
                  </Link>
                </div>
              </div>
            </>
          )}
          
          {/* Category Articles View */}
          {view_mode === 'category' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {help_categories.find(c => c.category_id === selected_category)?.category_name}
                </h1>
                <p className="text-lg text-gray-600">
                  {help_categories.find(c => c.category_id === selected_category)?.category_description}
                </p>
              </div>
              
              {articles_loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  ))}
                </div>
              ) : search_results.length === 0 ? (
                <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
                  <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
                  <p className="text-gray-600 mb-6">There are no articles in this category yet.</p>
                  <button
                    onClick={handleBackToHome}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Back to Help Center
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {search_results.map((article) => (
                    <button
                      key={article.article_id}
                      onClick={() => handleArticleClick(article.article_id)}
                      className="w-full bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left group"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {article.article_title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {article.article_excerpt}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {article.estimated_read_minutes} min read
                        </span>
                        <span>Updated {formatDate(article.last_updated)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Search Results View */}
          {view_mode === 'search' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Search Results for "{search_query}"
                </h1>
                {search_loading ? (
                  <p className="text-gray-600">Searching...</p>
                ) : (
                  <p className="text-gray-600">
                    Found {search_results.length} article{search_results.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              
              {search_loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  ))}
                </div>
              ) : search_results.length === 0 ? (
                <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any articles matching "{search_query}". Try different keywords or browse categories.
                  </p>
                  <button
                    onClick={handleBackToHome}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse All Topics
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {search_results.map((article) => (
                    <button
                      key={article.article_id}
                      onClick={() => handleArticleClick(article.article_id)}
                      className="w-full bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {article.category_name}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {highlightText(article.article_title, search_query)}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {highlightText(article.article_excerpt, search_query)}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {article.estimated_read_minutes} min read
                        </span>
                        <span>Updated {formatDate(article.last_updated)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Article Detail View */}
          {view_mode === 'article' && (
            <>
              {articles_loading ? (
                <div className="bg-white rounded-xl p-8 border border-gray-200 animate-pulse">
                  <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ) : article_error ? (
                <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Article Not Found</h3>
                  <p className="text-gray-600 mb-6">{article_error}</p>
                  <button
                    onClick={handleBackToHome}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Back to Help Center
                  </button>
                </div>
              ) : current_article ? (
                <>
                  {/* Article Header */}
                  <div className="bg-white rounded-xl p-8 lg:p-12 border border-gray-200 shadow-lg mb-8">
                    <div className="mb-6">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-4">
                        {current_article.category_name}
                      </span>
                      <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                        {current_article.article_title}
                      </h1>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {current_article.estimated_read_minutes} min read
                        </span>
                        <span>Last updated {formatDate(current_article.last_updated)}</span>
                      </div>
                    </div>
                    
                    {/* Article Content */}
                    <div className="prose prose-lg max-w-none">
                      <div 
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: current_article.article_content.replace(/\n/g, '<br />') 
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Was This Helpful Section */}
                  <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-lg mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                      Was this article helpful?
                    </h3>
                    
                    {vote_feedback_visible ? (
                      <div className="flex items-center justify-center space-x-2 text-green-600 py-4">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Thank you for your feedback!</span>
                      </div>
                    ) : user_voted_helpful?.article_id === current_article.article_id ? (
                      <div className="text-center text-gray-600 py-4">
                        <p className="mb-2">You voted this article as {user_voted_helpful.vote === 'up' ? 'helpful' : 'not helpful'}</p>
                        <p className="text-sm">
                          {current_article.helpful_votes_positive} people found this helpful
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center space-x-4 mb-6">
                          <button
                            onClick={() => handleVote(true)}
                            className="flex items-center space-x-2 px-6 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border-2 border-green-200 hover:border-green-300 transition-all"
                          >
                            <ThumbsUp className="h-5 w-5" />
                            <span className="font-medium">Yes ({current_article.helpful_votes_positive})</span>
                          </button>
                          
                          <button
                            onClick={() => handleVote(false)}
                            className="flex items-center space-x-2 px-6 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border-2 border-red-200 hover:border-red-300 transition-all"
                          >
                            <ThumbsDown className="h-5 w-5" />
                            <span className="font-medium">No ({current_article.helpful_votes_negative})</span>
                          </button>
                        </div>
                        
                        <p className="text-sm text-gray-500 text-center">
                          {current_article.helpful_votes_positive} people found this helpful
                        </p>
                      </>
                    )}
                  </div>
                  
                  {/* Related Articles */}
                  {related_articles.length > 0 && (
                    <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-lg mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">
                        Related Articles
                      </h3>
                      <div className="space-y-3">
                        {related_articles.map((article) => (
                          <button
                            key={article.article_id}
                            onClick={() => handleArticleClick(article.article_id)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-all group"
                          >
                            <div className="flex items-start space-x-3">
                              <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="text-left">
                                <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {article.article_title}
                                </p>
                                <p className="text-sm text-gray-500">{article.category_name}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Still Need Help Banner */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">Still Need Help?</h3>
                      <p className="text-blue-100">Our support team is here to assist you</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => {/* Would open live chat widget */}}
                        className="flex flex-col items-center p-4 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all backdrop-blur-sm"
                      >
                        <MessageCircle className="h-6 w-6 mb-2" />
                        <span className="font-medium">Live Chat</span>
                      </button>
                      
                      <a
                        href="tel:+18005551234"
                        className="flex flex-col items-center p-4 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all backdrop-blur-sm"
                      >
                        <Phone className="h-6 w-6 mb-2" />
                        <span className="font-medium">Call Us</span>
                      </a>
                      
                      <Link
                        to="/contact"
                        className="flex flex-col items-center p-4 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all backdrop-blur-sm"
                      >
                        <Mail className="h-6 w-6 mb-2" />
                        <span className="font-medium">Email Us</span>
                      </Link>
                    </div>
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_HelpCenter;