import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useAppStore } from '@/store/main';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  TruckIcon, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  MessageCircle,
  Share2,
  AlertCircle,
  Check,
  Minus,
  Plus,
  X
} from 'lucide-react';

// ============================================================================
// Type Definitions (matching Zod schemas exactly)
// ============================================================================

// ProductType interface - unused but kept for reference
// interface ProductType {
//   product_id: string;
//   supplier_id: string;
//   product_name: string;
//   product_slug: string;
//   category_id: string;
//   subcategory_id: string | null;
//   brand: string | null;
//   sku: string;
//   manufacturer: string | null;
//   model_number: string | null;
//   description: string | null;
//   specifications: Record<string, any> | null;
//   dimensions: Record<string, any> | null;
//   weight: number | null;
//   unit_of_measure: string;
//   price: number;
//   compare_at_price: number | null;
//   cost_per_item: number | null;
//   has_variants: boolean;
//   bulk_pricing: any[] | null;
//   trade_price: number | null;
//   track_inventory: boolean;
//   quantity_on_hand: number;
//   low_stock_threshold: number;
//   continue_selling_when_out_of_stock: boolean;
//   barcode: string | null;
//   requires_special_handling: boolean;
//   tags: string[] | null;
//   is_eco_friendly: boolean;
//   sustainability_info: Record<string, any> | null;
//   safety_information: string | null;
//   certifications: string[] | null;
//   technical_datasheet_url: string | null;
//   installation_guide_url: string | null;
//   warranty_info_url: string | null;
//   meta_title: string | null;
//   meta_description: string | null;
//   rating_average: number;
//   rating_count: number;
//   view_count: number;
//   order_count: number;
//   status: string;
//   is_featured: boolean;
//   last_inventory_update: string | null;
//   created_at: string;
//   updated_at: string;
//   // Joined fields from API response
//   shop_name?: string;
//   shop_slug?: string;
//   supplier_rating?: number;
//   supplier_verified?: boolean;
//   availability?: 'in_stock' | 'low_stock' | 'out_of_stock';
// }

interface ProductVariant {
  variant_id: string;
  product_id: string;
  variant_name: string;
  variant_type: string;
  sku: string;
  price: number;
  compare_at_price: number | null;
  quantity_on_hand: number;
  variant_image_url: string | null;
  variant_specifications: Record<string, any> | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

// ProductImageType interface - unused but kept for reference
// interface ProductImageType {
//   image_id: string;
//   product_id: string;
//   image_url: string;
//   is_primary: boolean;
//   display_order: number;
//   alt_text: string | null;
//   created_at: string;
// }

interface ProductReview {
  review_id: string;
  product_id: string;
  order_id: string;
  customer_id: string;
  rating: number;
  title: string | null;
  review_text: string;
  is_recommended: boolean | null;
  is_anonymous: boolean;
  is_verified_purchase: boolean;
  helpful_count: number;
  photo_urls: string[] | null;
  video_url: string | null;
  supplier_response: string | null;
  supplier_response_date: string | null;
  status: string;
  flagged_reason: string | null;
  moderation_notes: string | null;
  created_at: string;
  updated_at: string;
  customer_name?: string;
}

// ============================================================================
// API Functions
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const getAuthHeaders = (token: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const fetchProduct = async (product_id: string) => {
  const response = await axios.get(`${API_BASE_URL}/api/products/${product_id}`);
  return response.data;
};

const fetchProductVariants = async (product_id: string) => {
  const response = await axios.get(`${API_BASE_URL}/api/products/${product_id}/variants`);
  return response.data;
};

const fetchProductImages = async (product_id: string) => {
  const response = await axios.get(`${API_BASE_URL}/api/products/${product_id}/images`);
  return response.data;
};

const fetchProductReviews = async (product_id: string, page: number = 1, rating?: number) => {
  const response = await axios.get(`${API_BASE_URL}/api/products/${product_id}/reviews`, {
    params: {
      page,
      limit: 10,
      rating,
      sort_by: 'most_recent'
    }
  });
  return response.data;
};

// ============================================================================
// Main Component
// ============================================================================

const UV_ProductDetail: React.FC = () => {
  const { product_id } = useParams<{ product_id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get variant_id from URL if present
  const urlVariantId = searchParams.get('variant_id');

  // ========================================================================
  // Global State Access (CRITICAL: Individual selectors only!)
  // ========================================================================
  
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const postalCode = useAppStore(state => state.user_location_state.postal_code);

  // ========================================================================
  // Local State
  // ========================================================================
  
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(urlVariantId);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'documents' | 'qna'>('description');
  const [reviewsPage, setReviewsPage] = useState<number>(1);
  const [reviewsFilter, setReviewsFilter] = useState<number | undefined>(undefined);
  const [deliveryPostalCode, setDeliveryPostalCode] = useState<string>(postalCode || '');
  const [showPostalCodeModal, setShowPostalCodeModal] = useState<boolean>(false);
  const [quantityError, setQuantityError] = useState<string | null>(null);

  // ========================================================================
  // Data Fetching with React Query
  // ========================================================================

  // Fetch Product Data
  const {
    data: product,
    isLoading: productLoading,
    error: productError
  } = useQuery({
    queryKey: ['product', product_id],
    queryFn: () => fetchProduct(product_id!),
    enabled: !!product_id,
    staleTime: 60000, // 1 minute
    select: (data) => ({
      ...data,
      price: Number(data.price || 0),
      compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : null,
      quantity_on_hand: Number(data.quantity_on_hand || 0),
      rating_average: Number(data.rating_average || 0),
      rating_count: Number(data.rating_count || 0),
      low_stock_threshold: Number(data.low_stock_threshold || 0)
    })
  });

  // Fetch Product Variants
  const { data: productVariants = [] } = useQuery({
    queryKey: ['productVariants', product_id],
    queryFn: () => fetchProductVariants(product_id!),
    enabled: !!product_id && product?.has_variants === true,
    staleTime: 60000,
    select: (data) => data.map((v: any) => ({
      ...v,
      price: Number(v.price || 0),
      compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
      quantity_on_hand: Number(v.quantity_on_hand || 0)
    }))
  });

  // Fetch Product Images
  const { data: productImages = [] } = useQuery({
    queryKey: ['productImages', product_id],
    queryFn: () => fetchProductImages(product_id!),
    enabled: !!product_id,
    staleTime: 300000 // 5 minutes
  });

  // Fetch Product Reviews
  const {
    data: reviewsData,
    isLoading: reviewsLoading
  } = useQuery({
    queryKey: ['productReviews', product_id, reviewsPage, reviewsFilter],
    queryFn: () => fetchProductReviews(product_id!, reviewsPage, reviewsFilter),
    enabled: !!product_id,
    staleTime: 60000,
    placeholderData: (previousData) => previousData
  });

  const productReviews = (reviewsData as any)?.reviews || [];
  const reviewsPagination = (reviewsData as any)?.pagination;

  // Check if product in wishlist (only if authenticated)
  const { data: wishlistStatus } = useQuery({
    queryKey: ['wishlistStatus', product_id],
    queryFn: async () => {
      // Since GET /api/wishlist/contains/:product_id not in OpenAPI, 
      // we'll get all wishlists and check
      await axios.get(
        `${API_BASE_URL}/api/users/me/wishlists`,
        { headers: getAuthHeaders(authToken) }
      );
      
      // For simplicity, we'll return false for now
      // Full implementation would check all wishlist items
      return { in_wishlist: false };
    },
    enabled: isAuthenticated && !!product_id,
    staleTime: 30000
  });

  const inWishlist = wishlistStatus?.in_wishlist || false;

  // ========================================================================
  // Mutations
  // ========================================================================

  // Add to Cart Mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      // Get or create active cart
      const cartsResponse = await axios.get(
        `${API_BASE_URL}/api/users/me/carts`,
        { 
          headers: getAuthHeaders(authToken),
          params: { is_active: true }
        }
      );

      let cart_id: string;
      
      if (!cartsResponse.data || cartsResponse.data.length === 0) {
        const createCartResponse = await axios.post(
          `${API_BASE_URL}/api/users/me/carts`,
          {
            cart_name: null,
            is_active: true,
            project_id: null,
            promo_code: null,
          },
          { headers: getAuthHeaders(authToken) }
        );
        cart_id = createCartResponse.data.cart_id;
      } else {
        cart_id = cartsResponse.data[0].cart_id;
      }

      const effectivePrice = selectedVariant?.price || product?.price || 0;

      await axios.post(
        `${API_BASE_URL}/api/carts/${cart_id}/items`,
        {
          product_id: product?.product_id,
          variant_id: selectedVariantId,
          supplier_id: product?.supplier_id,
          quantity: selectedQuantity,
          unit_price: effectivePrice,
          subtotal: effectivePrice * selectedQuantity,
        },
        { headers: getAuthHeaders(authToken) }
      );
    },
    onSuccess: () => {
      // Reload global cart
      const loadCart = useAppStore.getState().load_cart;
      loadCart();
      
      // Show success message (would use toast in production)
      alert('Added to cart!');
    },
    onError: (error: AxiosError<{ error?: string }>) => {
      const errorMessage = error.response?.data?.error || 'Failed to add to cart';
      alert(errorMessage);
    }
  });

  // Add to Wishlist Mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      // Get default wishlist
      const wishlistsResponse = await axios.get(
        `${API_BASE_URL}/api/users/me/wishlists`,
        { headers: getAuthHeaders(authToken) }
      );

      let wishlist_id: string;

      if (!wishlistsResponse.data || wishlistsResponse.data.length === 0) {
        // Create default wishlist
        const createWishlistResponse = await axios.post(
          `${API_BASE_URL}/api/users/me/wishlists`,
          {
            wishlist_name: 'My Wishlist',
            is_default: true,
            is_public: false,
          },
          { headers: getAuthHeaders(authToken) }
        );
        wishlist_id = createWishlistResponse.data.wishlist_id;
      } else {
        wishlist_id = wishlistsResponse.data[0].wishlist_id;
      }

      // Add to wishlist
      await axios.post(
        `${API_BASE_URL}/api/wishlists/${wishlist_id}/items`,
        {
          product_id: product?.product_id,
          variant_id: selectedVariantId,
          price_when_added: selectedVariant?.price || product?.price || 0,
          notes: null,
        },
        { headers: getAuthHeaders(authToken) }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlistStatus', product_id] });
      alert('Added to wishlist!');
    },
    onError: (error: AxiosError<{ error?: string }>) => {
      const errorMessage = error.response?.data?.error || 'Failed to add to wishlist';
      alert(errorMessage);
    }
  });

  // ========================================================================
  // Computed Values
  // ========================================================================

  const selectedVariant = useMemo(() => {
    if (!selectedVariantId || !productVariants.length) return null;
    return productVariants.find((v: ProductVariant) => v.variant_id === selectedVariantId) || null;
  }, [selectedVariantId, productVariants]);

  const effectivePrice = selectedVariant?.price || product?.price || 0;
  const effectiveComparePrice = selectedVariant?.compare_at_price || product?.compare_at_price || null;
  const effectiveQuantityOnHand = selectedVariant?.quantity_on_hand ?? product?.quantity_on_hand ?? 0;
  
  const availabilityStatus = useMemo(() => {
    if (effectiveQuantityOnHand === 0) return 'out_of_stock';
    if (effectiveQuantityOnHand <= (product?.low_stock_threshold || 10)) return 'low_stock';
    return 'in_stock';
  }, [effectiveQuantityOnHand, product?.low_stock_threshold]);

  const savings = effectiveComparePrice && effectiveComparePrice > effectivePrice
    ? {
        amount: effectiveComparePrice - effectivePrice,
        percentage: ((effectiveComparePrice - effectivePrice) / effectiveComparePrice * 100).toFixed(0)
      }
    : null;

  // Sort images by display order, primary first
  const sortedImages = useMemo(() => {
    return [...productImages].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.display_order - b.display_order;
    });
  }, [productImages]);

  // ========================================================================
  // Effects
  // ========================================================================

  // Set active image to primary on images load
  useEffect(() => {
    if (sortedImages.length > 0) {
      const primaryIndex = sortedImages.findIndex(img => img.is_primary);
      setActiveImageIndex(primaryIndex >= 0 ? primaryIndex : 0);
    }
  }, [sortedImages]);

  // Set initial variant if URL param provided
  useEffect(() => {
    if (urlVariantId && productVariants.length > 0) {
      setSelectedVariantId(urlVariantId);
    }
  }, [urlVariantId, productVariants]);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  const handleQuantityChange = (newQuantity: number) => {
    setQuantityError(null);
    
    if (newQuantity < 1) {
      setQuantityError('Minimum quantity is 1');
      return;
    }

    if (newQuantity > effectiveQuantityOnHand) {
      setQuantityError(`Only ${effectiveQuantityOnHand} available`);
      return;
    }

    setSelectedQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (availabilityStatus === 'out_of_stock') {
      alert('This product is out of stock');
      return;
    }

    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    addToCartMutation.mutate();
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (inWishlist) {
      alert('Already in wishlist');
      return;
    }

    addToWishlistMutation.mutate();
  };

  const handleVariantChange = (variant_id: string) => {
    setSelectedVariantId(variant_id);
    setSelectedQuantity(1);
    setQuantityError(null);
    
    // Find variant and update image if it has one
    const variant = productVariants.find((v: ProductVariant) => v.variant_id === variant_id);
    if (variant?.variant_image_url) {
      const variantImageIndex = sortedImages.findIndex(img => img.image_url === variant.variant_image_url);
      if (variantImageIndex >= 0) {
        setActiveImageIndex(variantImageIndex);
      }
    }
  };

  const handleImageChange = (index: number) => {
    setActiveImageIndex(index);
  };

  const handlePreviousImage = () => {
    setActiveImageIndex(prev => (prev > 0 ? prev - 1 : sortedImages.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex(prev => (prev < sortedImages.length - 1 ? prev + 1 : 0));
  };

  // ========================================================================
  // Render Helpers
  // ========================================================================

  const renderStars = (rating: number, count?: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        {count !== undefined && (
          <span className="text-sm text-gray-600 ml-2">({count})</span>
        )}
      </div>
    );
  };

  const renderAvailabilityBadge = () => {
    if (availabilityStatus === 'in_stock') {
      return (
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <Check className="w-4 h-4 mr-1" />
            In Stock
          </span>
          {effectiveQuantityOnHand <= (product?.low_stock_threshold || 10) && effectiveQuantityOnHand > 0 && (
            <span className="text-sm text-gray-600">
              Only {effectiveQuantityOnHand} left
            </span>
          )}
        </div>
      );
    } else if (availabilityStatus === 'low_stock') {
      return (
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            <AlertCircle className="w-4 h-4 mr-1" />
            Low Stock
          </span>
          <span className="text-sm text-gray-600">
            Only {effectiveQuantityOnHand} left
          </span>
        </div>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <X className="w-4 h-4 mr-1" />
          Out of Stock
        </span>
      );
    }
  };

  // ========================================================================
  // Loading & Error States
  // ========================================================================

  if (productLoading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Gallery Skeleton */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="grid grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-md animate-pulse"></div>
                  ))}
                </div>
              </div>
              
              {/* Product Info Skeleton */}
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (productError || !product) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">
              This product doesn't exist or has been removed.
            </p>
            <Link
              to="/search"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </>
    );
  }

  // ========================================================================
  // Main Render
  // ========================================================================

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              <span className="text-gray-400">/</span>
              <Link to={`/category/${product.category_id}`} className="text-gray-500 hover:text-gray-700">
                Category
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{product.product_name}</span>
            </nav>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* LEFT COLUMN - Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-white rounded-xl shadow-lg overflow-hidden group">
                {sortedImages.length > 0 ? (
                  <>
                    <img
                      src={sortedImages[activeImageIndex]?.image_url}
                      alt={sortedImages[activeImageIndex]?.alt_text || product.product_name}
                      className="w-full h-full object-contain cursor-zoom-in"
                      onClick={() => setLightboxOpen(true)}
                    />
                    
                    {/* Zoom Icon Overlay */}
                    <div className="absolute top-4 right-4 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-5 h-5 text-gray-700" />
                    </div>

                    {/* Sale Badge */}
                    {savings && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Save {savings.percentage}%
                      </div>
                    )}

                    {/* Navigation Arrows */}
                    {sortedImages.length > 1 && (
                      <>
                        <button
                          onClick={handlePreviousImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                        >
                          <ChevronLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                        >
                          <ChevronRight className="w-6 h-6 text-gray-700" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400 text-lg">No image available</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {sortedImages.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {sortedImages.slice(0, 6).map((image, index) => (
                    <button
                      key={image.image_id}
                      onClick={() => handleImageChange(index)}
                      className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                        index === activeImageIndex
                          ? 'border-blue-600 ring-2 ring-blue-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={image.alt_text || `Product view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN - Product Information */}
            <div className="space-y-6">
              {/* Product Title & Brand */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
                  {product.product_name}
                </h1>
                {product.brand && (
                  <p className="text-lg text-gray-600">
                    by <span className="font-semibold text-gray-900">{product.brand}</span>
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-4">
                {renderStars(parseFloat(product.rating_average), product.rating_count)}
                {product.rating_count > 0 && (
                  <a href="#reviews" className="text-blue-600 hover:text-blue-700 text-sm font-medium underline">
                    See all reviews
                  </a>
                )}
              </div>

              {/* Pricing */}
              <div className="border-t border-b border-gray-200 py-6">
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl font-bold text-gray-900">
                    ${effectivePrice.toFixed(2)}
                  </span>
                  {effectiveComparePrice && effectiveComparePrice > effectivePrice && (
                    <span className="text-2xl text-gray-400 line-through">
                      ${effectiveComparePrice.toFixed(2)}
                    </span>
                  )}
                  {savings && (
                    <span className="text-lg font-semibold text-red-600">
                      Save ${savings.amount.toFixed(2)} ({savings.percentage}%)
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Price per {product.unit_of_measure}
                </p>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                {renderAvailabilityBadge()}
                {product.last_inventory_update && (
                  <p className="text-xs text-gray-500">
                    Stock updated {new Date(product.last_inventory_update).toLocaleTimeString()}
                  </p>
                )}
              </div>

              {/* Variant Selector */}
              {product.has_variants && productVariants.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Select Variant
                  </label>
                  <select
                    value={selectedVariantId || ''}
                    onChange={(e) => handleVariantChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  >
                    <option value="">Choose an option</option>
                    {productVariants.map((variant: ProductVariant) => (
                      <option key={variant.variant_id} value={variant.variant_id}>
                        {variant.variant_name} - ${variant.price.toFixed(2)}
                        {variant.quantity_on_hand === 0 ? ' (Out of Stock)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(selectedQuantity - 1)}
                    disabled={selectedQuantity <= 1 || availabilityStatus === 'out_of_stock'}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <input
                    type="number"
                    min="1"
                    max={effectiveQuantityOnHand}
                    value={selectedQuantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    disabled={availabilityStatus === 'out_of_stock'}
                    className="w-20 px-4 py-2 text-center border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                  
                  <button
                    onClick={() => handleQuantityChange(selectedQuantity + 1)}
                    disabled={selectedQuantity >= effectiveQuantityOnHand || availabilityStatus === 'out_of_stock'}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    {effectiveQuantityOnHand > 0 && `Max: ${effectiveQuantityOnHand}`}
                  </span>
                </div>
                {quantityError && (
                  <p className="text-sm text-red-600 mt-1">{quantityError}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={availabilityStatus === 'out_of_stock' || addToCartMutation.isPending}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {addToCartMutation.isPending ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>{availabilityStatus === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToWishlist}
                    disabled={addToWishlistMutation.isPending}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-gray-400 transition-all"
                  >
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
                  </button>

                  <button
                    onClick={() => alert('Share feature coming soon')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-gray-400 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Delivery Information */}
              {deliveryPostalCode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <TruckIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Delivery to {deliveryPostalCode}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Estimated delivery: 2-3 business days
                      </p>
                      <button
                        onClick={() => setShowPostalCodeModal(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
                      >
                        Change location
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Supplier Information */}
              {product.shop_name && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-600">
                          {product.shop_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.shop_name}</h3>
                        {product.supplier_verified && (
                          <div className="flex items-center space-x-1 text-sm text-green-600">
                            <Shield className="w-4 h-4" />
                            <span>Verified Shop</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {product.supplier_rating && (
                      <div className="text-right">
                        {renderStars(product.supplier_rating)}
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/shop/${product.supplier_id}`}
                    className="block w-full px-4 py-2 bg-gray-100 text-gray-900 text-center rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    Visit Shop
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-12">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {['description', 'specifications', 'documents', 'qna'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="py-8">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {product.description || 'No description available.'}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="border-b border-gray-100 pb-3">
                          <dt className="text-sm font-semibold text-gray-900">{key}</dt>
                          <dd className="text-sm text-gray-600 mt-1">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-gray-600">No specifications available.</p>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Documents</h2>
                  <div className="space-y-3">
                    {product.technical_datasheet_url && (
                      <a
                        href={product.technical_datasheet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium text-gray-900">Technical Datasheet</span>
                        <span className="text-blue-600">Download PDF</span>
                      </a>
                    )}
                    {product.installation_guide_url && (
                      <a
                        href={product.installation_guide_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium text-gray-900">Installation Guide</span>
                        <span className="text-blue-600">Download PDF</span>
                      </a>
                    )}
                    {product.warranty_info_url && (
                      <a
                        href={product.warranty_info_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium text-gray-900">Warranty Information</span>
                        <span className="text-blue-600">Download PDF</span>
                      </a>
                    )}
                    {!product.technical_datasheet_url && !product.installation_guide_url && !product.warranty_info_url && (
                      <p className="text-gray-600">No documents available.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'qna' && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions & Answers</h2>
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No questions yet. Be the first to ask!</p>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          navigate(`/login?redirect_url=${encodeURIComponent(window.location.pathname)}`);
                        } else {
                          alert('Ask question feature coming soon');
                        }
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      Ask a Question
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div id="reviews" className="mt-12">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
              
              {product.rating_count > 0 ? (
                <>
                  {/* Rating Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-gray-200">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900 mb-2">
                        {parseFloat(product.rating_average).toFixed(1)}
                      </div>
                      <div className="flex justify-center mb-2">
                        {renderStars(parseFloat(product.rating_average))}
                      </div>
                      <p className="text-sm text-gray-600">
                        Based on {product.rating_count} review{product.rating_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <button
                            key={stars}
                            onClick={() => setReviewsFilter(reviewsFilter === stars ? undefined : stars)}
                            className="flex items-center space-x-3 w-full hover:bg-gray-50 p-2 rounded transition-colors"
                          >
                            <span className="text-sm font-medium text-gray-700 w-12">
                              {stars} star
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: '0%' }} // Would calculate from rating distribution
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8">0</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {reviewsLoading ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                          <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : productReviews.length > 0 ? (
                    <>
                      <div className="space-y-8">
                        {productReviews.map((review: ProductReview) => (
                          <div key={review.review_id} className="border-b border-gray-200 pb-8 last:border-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  {renderStars(review.rating)}
                                  {review.is_verified_purchase && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <Check className="w-3 h-3 mr-1" />
                                      Verified Purchase
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  by {review.is_anonymous ? 'Anonymous' : (review.customer_name || 'Customer')} on {new Date(review.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            {review.title && (
                              <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                            )}
                            
                            <p className="text-gray-700 leading-relaxed mb-3">
                              {review.review_text}
                            </p>
                            
                            {review.photo_urls && review.photo_urls.length > 0 && (
                              <div className="flex space-x-2 mb-3">
                                {review.photo_urls.map((url, idx) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt={`Review photo ${idx + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                  />
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <button className="text-gray-600 hover:text-gray-900">
                                Helpful ({review.helpful_count})
                              </button>
                            </div>
                            
                            {review.supplier_response && (
                              <div className="mt-4 pl-4 border-l-4 border-blue-200 bg-blue-50 p-4 rounded">
                                <p className="text-sm font-semibold text-gray-900 mb-2">
                                  Response from {product.shop_name}
                                </p>
                                <p className="text-sm text-gray-700">{review.supplier_response}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {review.supplier_response_date && new Date(review.supplier_response_date).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {reviewsPagination && reviewsPagination.has_next && (
                        <div className="mt-8 text-center">
                          <button
                            onClick={() => setReviewsPage(prev => prev + 1)}
                            className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                          >
                            Load More Reviews
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No reviews yet for this product.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600 mb-6">Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        {lightboxOpen && sortedImages.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            
            <button
              onClick={handlePreviousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 text-white transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <img
              src={sortedImages[activeImageIndex]?.image_url}
              alt={sortedImages[activeImageIndex]?.alt_text || product.product_name}
              className="max-w-full max-h-full object-contain"
            />
            
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 text-white transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
              {activeImageIndex + 1} / {sortedImages.length}
            </div>
          </div>
        )}

        {/* Postal Code Modal */}
        {showPostalCodeModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Change Location</h3>
                <button
                  onClick={() => setShowPostalCodeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={deliveryPostalCode}
                    onChange={(e) => setDeliveryPostalCode(e.target.value)}
                    placeholder="Enter postal code"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                
                <button
                  onClick={() => {
                    setShowPostalCodeModal(false);
                    // Would trigger delivery estimate calculation
                  }}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Update Location
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Mobile Add to Cart Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-40">
          <div className="flex items-center justify-between space-x-3">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${effectivePrice.toFixed(2)}
              </p>
              {renderAvailabilityBadge()}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={availabilityStatus === 'out_of_stock' || addToCartMutation.isPending}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ProductDetail;