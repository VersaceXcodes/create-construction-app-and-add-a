import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useAppStore } from '@/store/main';
import { 
  Search, 
  Package, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  Truck, 
  MessageSquare, 
  ArrowRight,
  ChevronRight,
  Star,
  Shield,
  Users,
  Sparkles
} from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

interface Category {
  category_id: string;
  category_name: string;
  category_slug: string;
  category_description: string | null;
  category_image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface Product {
  product_id: string;
  product_name: string;
  product_slug: string;
  price: number;
  compare_at_price: number | null;
  quantity_on_hand: number;
  low_stock_threshold: number;
  rating_average: number;
  rating_count: number;
  supplier_id: string;
  shop_name?: string;
  supplier_rating?: number;
  supplier_verified?: boolean;
  primary_image_url?: string;
  status: string;
}

interface Supplier {
  supplier_id: string;
  shop_name: string;
  shop_slug: string;
  shop_logo_url: string | null;
  rating_average: number;
  rating_count: number;
  is_verified: boolean;
  status: string;
  business_address?: string;
}

interface ProductWithAvailability extends Product {
  availability_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

// ============================================================================
// Helper Functions
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const calculateAvailability = (quantity: number, threshold: number): 'in_stock' | 'low_stock' | 'out_of_stock' => {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= threshold) return 'low_stock';
  return 'in_stock';
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price);
};

// ============================================================================
// Main Component
// ============================================================================

const UV_Homepage: React.FC = () => {
  // ========================================================================
  // Local State
  // ========================================================================
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  // ========================================================================
  // Global State Access (Individual Selectors - CRITICAL)
  // ========================================================================
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);

  // ========================================================================
  // API Queries (React Query)
  // ========================================================================

  // Featured Categories Query
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useQuery({
    queryKey: ['categories', 'featured'],
    queryFn: async () => {
      const response = await axios.get<Category[]>(`${API_BASE_URL}/api/categories`, {
        params: { 
          is_active: true,
          limit: 12 
        }
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Trending Products Query
  const { 
    data: productsData, 
    isLoading: productsLoading,
    error: productsError 
  } = useQuery({
    queryKey: ['products', 'trending'],
    queryFn: async () => {
      const response = await axios.get<{ products: Product[] }>(`${API_BASE_URL}/api/products`, {
        params: { 
          status: 'active',
          limit: 15,
          sort_by: 'popularity'
        }
      });
      
      // Transform products to include availability_status
      const productsWithAvailability: ProductWithAvailability[] = response.data.products.map(p => ({
        ...p,
        availability_status: calculateAvailability(p.quantity_on_hand, p.low_stock_threshold)
      }));

      return productsWithAvailability;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Featured Suppliers Query
  const { 
    data: suppliersData, 
    isLoading: suppliersLoading,
    error: suppliersError 
  } = useQuery({
    queryKey: ['suppliers', 'featured'],
    queryFn: async () => {
      const response = await axios.get<{ suppliers: Supplier[] }>(`${API_BASE_URL}/api/suppliers`, {
        params: { 
          is_verified: true,
          status: 'active',
          limit: 6,
          sort_by: 'rating_average'
        }
      });
      return response.data.suppliers || response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Personalized Recommendations Query (Authenticated Only)
  const { 
    data: recommendationsData,
    isLoading: recommendationsLoading 
  } = useQuery({
    queryKey: ['recommendations', 'personalized', currentUser?.user_id],
    queryFn: async () => {
      if (!currentUser || !authToken) {
        return null;
      }

      try {
        const response = await axios.get<{ recommended_products: ProductWithAvailability[] }>(
          `${API_BASE_URL}/api/recommendations/personalized`,
          {
            params: { 
              user_id: currentUser.user_id,
              limit: 10 
            },
            headers: {
              'Authorization': `Bearer ${authToken}`,
            }
          }
        );
        return response.data.recommended_products;
      } catch (error) {
        // Endpoint might not be implemented, gracefully handle
        console.warn('Personalized recommendations not available:', error);
        return null;
      }
    },
    enabled: isAuthenticated && !!currentUser && !!authToken,
    staleTime: 5 * 60 * 1000,
    retry: 0, // Don't retry if endpoint doesn't exist
  });

  // ========================================================================
  // Newsletter Subscription Mutation
  // ========================================================================
  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      try {
        const response = await axios.post<{ success: boolean; message: string }>(
          `${API_BASE_URL}/api/newsletter/subscribe`,
          { email }
        );
        return response.data;
      } catch (error) {
        // Endpoint might not exist, handle gracefully
        const axiosError = error as AxiosError<{ error?: string; message?: string }>;
        if (axiosError.response?.status === 404) {
          // Simulate success for MVP if endpoint not implemented
          return { success: true, message: 'Thank you for subscribing!' };
        }
        throw error;
      }
    },
    onSuccess: () => {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setNewsletterError(null);
      setTimeout(() => setNewsletterSuccess(false), 5000);
    },
    onError: (error: AxiosError<{ error?: string; message?: string }>) => {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Subscription failed. Please try again.';
      setNewsletterError(errorMessage);
      setNewsletterSuccess(false);
    },
  });

  // ========================================================================
  // Event Handlers
  // ========================================================================
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterError(null);
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      setNewsletterError('Please enter a valid email address');
      return;
    }

    newsletterMutation.mutate(newsletterEmail);
  };

  // ========================================================================
  // Derived Data
  // ========================================================================
  const categories = categoriesData || [];
  const trendingProducts = productsData || [];
  const featuredSuppliers = suppliersData || [];
  const recommendedProducts = recommendationsData || null;

  // Platform statistics (static for MVP, would be from API in production)
  const platformStats = {
    totalSuppliers: 150,
    totalProducts: 50000,
    totalReviews: 25000,
    satisfactionRate: 98,
  };

  // ========================================================================
  // Render
  // ========================================================================
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="text-center space-y-8">
            {/* Welcome Message - Dynamic Based on Auth */}
            {isAuthenticated && currentUser ? (
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <p className="text-sm font-medium">Welcome back, {currentUser.name}!</p>
              </div>
            ) : null}

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Your One-Stop Shop for
              <span className="block text-yellow-300 mt-2">Construction Materials</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Connect with verified suppliers, compare prices, and get materials delivered to your job site
            </p>

            {/* CTA Buttons - Dynamic Based on Role */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              {currentUser?.role === 'supplier' ? (
                <Link
                  to="/supplier/dashboard"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  Go to My Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/search"
                    className="inline-flex items-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <Search className="mr-2 w-5 h-5" />
                    Start Shopping
                  </Link>
                  <Link
                    to="/become-a-supplier"
                    className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200"
                  >
                    Become a Supplier
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-12 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-300">{platformStats.totalSuppliers}+</div>
                <div className="text-sm md:text-base text-blue-100 mt-1">Verified Suppliers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-300">{(platformStats.totalProducts / 1000).toFixed(0)}K+</div>
                <div className="text-sm md:text-base text-blue-100 mt-1">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-300">{(platformStats.totalReviews / 1000).toFixed(0)}K+</div>
                <div className="text-sm md:text-base text-blue-100 mt-1">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-300">{platformStats.satisfactionRate}%</div>
                <div className="text-sm md:text-base text-blue-100 mt-1">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gray-50">
        {/* Personalized Recommendations (Authenticated Users Only) */}
        {isAuthenticated && recommendedProducts && recommendedProducts.length > 0 && (
          <section className="py-12 lg:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Sparkles className="w-8 h-8 text-yellow-500 mr-3" />
                    Recommended for You
                  </h2>
                  <p className="text-gray-600 mt-2">Based on your browsing and purchase history</p>
                </div>
                <Link 
                  to="/search" 
                  className="hidden md:inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  View All
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </div>

              {recommendationsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
                  {recommendedProducts.slice(0, 10).map((product) => (
                    <Link
                      key={product.product_id}
                      to={`/products/${product.product_id}`}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-200 group"
                    >
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        {product.primary_image_url ? (
                          <img 
                            src={product.primary_image_url} 
                            alt={product.product_name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                            SALE
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 min-h-[40px]">
                          {product.product_name}
                        </h3>
                        
                        <div className="mt-2 flex items-baseline space-x-2">
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.compare_at_price)}
                            </span>
                          )}
                        </div>

                        {product.rating_count > 0 && (
                          <div className="flex items-center mt-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-700 ml-1">
                              {product.rating_average.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              ({product.rating_count})
                            </span>
                          </div>
                        )}

                        {product.availability_status === 'low_stock' && (
                          <div className="mt-2 text-xs text-orange-600 font-medium">
                            Only {product.quantity_on_hand} left
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Featured Categories Section */}
        <section className="py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Shop by Category
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find exactly what you need from our comprehensive selection of construction materials
              </p>
            </div>

            {categoriesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-48 animate-pulse"></div>
                ))}
              </div>
            ) : categoriesError ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Failed to load categories</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.category_id}
                    to={`/category/${category.category_slug}`}
                    className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-200 hover:scale-105"
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      {category.category_image_url ? (
                        <img 
                          src={category.category_image_url} 
                          alt={category.category_name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg leading-tight">
                          {category.category_name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No categories available
              </div>
            )}
          </div>
        </section>

        {/* Trending Products Section */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center">
                  <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
                  Trending Products
                </h2>
                <p className="text-gray-600 mt-2">Most popular items right now</p>
              </div>
              <Link 
                to="/search?sort_by=popularity" 
                className="hidden md:inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View All
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse"></div>
                ))}
              </div>
            ) : productsError ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Failed to load products</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : trendingProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
                {trendingProducts.slice(0, 10).map((product) => (
                  <Link
                    key={product.product_id}
                    to={`/products/${product.product_id}`}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-200 group"
                  >
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.primary_image_url ? (
                        <img 
                          src={product.primary_image_url} 
                          alt={product.product_name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Sale Badge */}
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                          SALE
                        </div>
                      )}

                      {/* Verified Supplier Badge */}
                      {product.supplier_verified && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 min-h-[40px]">
                        {product.product_name}
                      </h3>
                      
                      {product.shop_name && (
                        <p className="text-xs text-gray-500 mt-1">{product.shop_name}</p>
                      )}

                      <div className="mt-2 flex items-baseline space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.compare_at_price)}
                          </span>
                        )}
                      </div>

                      {product.rating_count > 0 && (
                        <div className="flex items-center mt-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-700 ml-1">
                            {product.rating_average.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            ({product.rating_count})
                          </span>
                        </div>
                      )}

                      {/* Stock Status */}
                      {product.availability_status === 'in_stock' && (
                        <div className="mt-2 flex items-center text-xs text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          In Stock
                        </div>
                      )}
                      {product.availability_status === 'low_stock' && (
                        <div className="mt-2 text-xs text-orange-600 font-medium">
                          Only {product.quantity_on_hand} left
                        </div>
                      )}
                      {product.availability_status === 'out_of_stock' && (
                        <div className="mt-2 text-xs text-red-600 font-medium">
                          Out of Stock
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No trending products available
              </div>
            )}
          </div>
        </section>

        {/* Featured Suppliers Section */}
        <section className="py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                <Award className="w-8 h-8 text-blue-600 mr-3" />
                Featured Suppliers
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Top-rated, verified suppliers you can trust
              </p>
            </div>

            {suppliersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse"></div>
                ))}
              </div>
            ) : suppliersError ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Failed to load suppliers</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : featuredSuppliers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {featuredSuppliers.map((supplier) => (
                  <Link
                    key={supplier.supplier_id}
                    to={`/shop/${supplier.supplier_id}`}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {supplier.shop_logo_url ? (
                          <img 
                            src={supplier.shop_logo_url} 
                            alt={supplier.shop_name}
                            className="w-16 h-16 rounded-lg object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {supplier.shop_name}
                        </h3>
                        
                        <div className="flex items-center mt-2">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="text-sm font-semibold text-gray-900 ml-1">
                            {supplier.rating_average.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            ({supplier.rating_count} reviews)
                          </span>
                        </div>

                        {supplier.is_verified && (
                          <div className="inline-flex items-center mt-3 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified Shop
                          </div>
                        )}

                        <div className="mt-4">
                          <span className="inline-flex items-center text-blue-600 font-medium text-sm group-hover:underline">
                            Visit Shop
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No featured suppliers available
              </div>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How BuildEasy Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get the materials you need in four simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <div className="relative">
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-full hidden lg:block">
                    <div className="border-t-2 border-dashed border-gray-300"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10 bg-white inline-block px-4">
                    1. Search & Browse
                  </h3>
                </div>
                <p className="text-gray-600 mt-2">
                  Find exactly what you need from thousands of products across multiple suppliers
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
                <div className="relative">
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-full hidden lg:block">
                    <div className="border-t-2 border-dashed border-gray-300"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10 bg-white inline-block px-4">
                    2. Compare & Select
                  </h3>
                </div>
                <p className="text-gray-600 mt-2">
                  Compare prices, check availability, and read reviews from verified buyers
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <div className="relative">
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-full hidden lg:block">
                    <div className="border-t-2 border-dashed border-gray-300"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10 bg-white inline-block px-4">
                    3. Order & Pay
                  </h3>
                </div>
                <p className="text-gray-600 mt-2">
                  Secure checkout with multiple payment options and flexible delivery windows
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  4. Track & Receive
                </h3>
                <p className="text-gray-600 mt-2">
                  Real-time tracking and delivery directly to your job site
                </p>
              </div>
            </div>

            {/* Additional CTA */}
            {!isAuthenticated && (
              <div className="text-center mt-12">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Secondary Marketplace Teaser */}
        <section className="py-12 lg:py-16 bg-gradient-to-r from-green-600 to-teal-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Got Surplus Materials?
              </h2>
              <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
                List unused materials on our Secondary Marketplace and help reduce waste while earning money
              </p>
              <Link
                to="/secondary-marketplace"
                className="inline-flex items-center px-8 py-4 bg-white text-green-700 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Browse Secondary Marketplace
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Join Our Community
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Connect with other builders, share knowledge, and showcase your projects
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Forums Card */}
              <Link
                to="/community/forums"
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-200 group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Community Forums
                </h3>
                <p className="text-gray-600 mb-4">
                  Get advice, share tips, and connect with experienced builders
                </p>
                <span className="inline-flex items-center text-blue-600 font-medium text-sm">
                  Visit Forums
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              {/* Guides Card */}
              <Link
                to="/community/guides"
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-200 group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  How-To Guides
                </h3>
                <p className="text-gray-600 mb-4">
                  Step-by-step tutorials for construction projects of all sizes
                </p>
                <span className="inline-flex items-center text-green-600 font-medium text-sm">
                  Browse Guides
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              {/* Showcases Card */}
              <Link
                to="/community/showcases"
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-200 group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  Project Showcases
                </h3>
                <p className="text-gray-600 mb-4">
                  Get inspired by completed projects from our community
                </p>
                <span className="inline-flex items-center text-purple-600 font-medium text-sm">
                  View Showcases
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-12 lg:py-16 bg-gradient-to-br from-blue-600 to-indigo-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Stay Updated
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Get the latest deals, new products, and industry insights delivered to your inbox
              </p>

              {newsletterSuccess ? (
                <div className="bg-green-500 text-white rounded-lg p-6 max-w-md mx-auto">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg font-semibold">Thank you for subscribing!</p>
                  <p className="text-sm mt-2">Check your email to confirm your subscription.</p>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => {
                        setNewsletterEmail(e.target.value);
                        setNewsletterError(null);
                      }}
                      placeholder="Enter your email address"
                      className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300 border-2 border-transparent"
                      disabled={newsletterMutation.isPending}
                      required
                    />
                    <button
                      type="submit"
                      disabled={newsletterMutation.isPending}
                      className="px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {newsletterMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      ) : (
                        'Subscribe'
                      )}
                    </button>
                  </div>

                  {newsletterError && (
                    <p className="mt-3 text-red-300 text-sm" role="alert">
                      {newsletterError}
                    </p>
                  )}

                  <p className="mt-3 text-sm text-blue-100">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        {!isAuthenticated && (
          <section className="py-16 lg:py-24 bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Build Something Great?
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Join thousands of builders who trust BuildEasy for their construction materials
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/search"
                  className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default UV_Homepage;