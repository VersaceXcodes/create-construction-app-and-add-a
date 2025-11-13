import React, { useState, useMemo, useCallback } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ChevronRight, Home, Grid, List, X, Filter, Package, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/main';

// ============================================================================
// Type Definitions
// ============================================================================

interface Category {
  category_id: string;
  category_name: string;
  category_slug: string;
  parent_category_id: string | null;
  category_description: string | null;
  category_image_url: string | null;
  display_order: number;
  is_active: boolean;
  product_count?: number;
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
  primary_image_url: string | null;
  supplier_id: string;
  shop_name: string;
  supplier_rating: number;
  supplier_verified: boolean;
  availability?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// ============================================================================
// API Functions
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const fetchAllCategories = async (): Promise<Category[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/categories`);
  return response.data;
};



const fetchProducts = async (params: {
  category_id: string;
  price_min?: string | null;
  price_max?: string | null;
  availability?: string | null;
  brand?: string | null;
  sort_by?: string;
  page?: string;
  limit?: number;
}): Promise<ProductsResponse> => {
  const cleanParams: Record<string, string | number> = {
    category: params.category_id,
    status: 'active',
    limit: params.limit || 24,
  };

  if (params.price_min) cleanParams.price_min = params.price_min;
  if (params.price_max) cleanParams.price_max = params.price_max;
  if (params.availability) cleanParams.availability = params.availability;
  if (params.brand) cleanParams.brand = params.brand;
  if (params.sort_by) cleanParams.sort_by = params.sort_by;
  if (params.page) cleanParams.page = params.page;

  const response = await axios.get(`${API_BASE_URL}/api/products`, { params: cleanParams });
  return response.data;
};

// ============================================================================
// Main Component
// ============================================================================

const UV_CategoryBrowse: React.FC = () => {
  const { category_slug } = useParams<{ category_slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Global state
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const addToCart = useAppStore(state => state.add_to_cart);

  // Local UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Parse filters from URL
  const filters = useMemo(() => ({
    subcategory: searchParams.get('subcategory') || null,
    price_min: searchParams.get('price_min') || null,
    price_max: searchParams.get('price_max') || null,
    availability: searchParams.get('availability') || null,
    brand: searchParams.get('brand') || null,
  }), [searchParams]);

  const sortBy = searchParams.get('sort_by') || 'relevance';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // ============================================================================
  // React Query: Fetch All Categories (for slug lookup and hierarchy)
  // ============================================================================

  const {
    data: allCategories,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchAllCategories,
    staleTime: 60 * 60 * 1000, // 1 hour (categories rarely change)
    retry: 2,
  });

  // Build slug→category map and find current category
  const currentCategory = useMemo(() => {
    if (!allCategories) return null;

    const map = new Map<string, Category>();
    allCategories.forEach(cat => map.set(cat.category_slug, cat));

    return map.get(category_slug || '') || null;
  }, [allCategories, category_slug]);

  // Build breadcrumb path
  const categoryPath = useMemo(() => {
    if (!currentCategory || !allCategories) return [];

    const path: Category[] = [];
    let current: Category | null = currentCategory;

    // Traverse up to root
    while (current) {
      path.unshift(current);
      if (current.parent_category_id) {
        current = allCategories.find(c => c.category_id === current?.parent_category_id) || null;
      } else {
        break;
      }
    }

    return path;
  }, [currentCategory, allCategories]);

  // Find subcategories
  const subcategories = useMemo(() => {
    if (!currentCategory || !allCategories) return [];
    return allCategories.filter(cat => cat.parent_category_id === currentCategory.category_id && cat.is_active);
  }, [currentCategory, allCategories]);

  // Determine if showing subcategory grid or products
  const showSubcategoryGrid = subcategories.length > 0 && !filters.subcategory;

  // ============================================================================
  // React Query: Fetch Products (only when showing products)
  // ============================================================================

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['category-products', currentCategory?.category_id, filters, sortBy, currentPage],
    queryFn: () => {
      if (!currentCategory) throw new Error('Category not found');
      return fetchProducts({
        category_id: currentCategory.category_id,
        price_min: filters.price_min,
        price_max: filters.price_max,
        availability: filters.availability,
        brand: filters.brand,
        sort_by: sortBy,
        page: currentPage.toString(),
        limit: 24,
      });
    },
    enabled: !!currentCategory && !showSubcategoryGrid, // Only fetch when showing products
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });

  // ============================================================================
  // Filter Management
  // ============================================================================

  const updateFilter = useCallback((key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value === null || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    
    // Reset to page 1 when filters change
    if (key !== 'page') {
      newParams.delete('page');
    }
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const clearAllFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.price_min) count++;
    if (filters.price_max) count++;
    if (filters.availability) count++;
    if (filters.brand) count++;
    return count;
  }, [filters]);

  // ============================================================================
  // Add to Cart Handler
  // ============================================================================

  const handleAddToCart = async (product: Product) => {
    if (!currentUser) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      await addToCart({
        product_id: product.product_id,
        supplier_id: product.supplier_id,
        quantity: 1,
        unit_price: product.price,
      });
      
      // Show success feedback (could use toast notification)
      alert(`${product.product_name} added to cart!`);
    } catch (error) {
      console.error('Add to cart failed:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  // ============================================================================
  // Loading States
  // ============================================================================

  if (categoriesLoading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Skeleton breadcrumb */}
            <div className="h-6 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
            
            {/* Skeleton header */}
            <div className="h-12 bg-gray-200 rounded w-96 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full max-w-2xl mb-8 animate-pulse"></div>
            
            {/* Skeleton grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow animate-pulse">
                  <div className="h-24 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============================================================================
  // Error States
  // ============================================================================

  if (!currentCategory) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Not Found</h1>
            <p className="text-gray-600 mb-6">The category you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Homepage
            </Link>
          </div>
        </div>
      </>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors flex items-center">
                  <Home className="h-4 w-4" />
                  <span className="ml-1">Home</span>
                </Link>
              </li>
              {categoryPath.map((cat, index) => (
                <li key={cat.category_id} className="flex items-center space-x-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  {index === categoryPath.length - 1 ? (
                    <span className="text-gray-900 font-medium">{cat.category_name}</span>
                  ) : (
                    <Link
                      to={`/category/${cat.category_slug}`}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {cat.category_name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {/* Category Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {currentCategory.category_image_url && (
              <div className="mb-6 rounded-xl overflow-hidden">
                <img
                  src={currentCategory.category_image_url}
                  alt={currentCategory.category_name}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{currentCategory.category_name}</h1>
            {currentCategory.category_description && (
              <p className="text-lg text-gray-600 max-w-3xl">{currentCategory.category_description}</p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Subcategory Grid (if has subcategories and not filtering) */}
          {showSubcategoryGrid ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {subcategories.map((subcat) => (
                    <Link
                      key={subcat.category_id}
                      to={`/category/${subcat.category_slug}`}
                      className="group bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-200"
                    >
                      {subcat.category_image_url && (
                        <div className="mb-4 flex justify-center">
                          <img
                            src={subcat.category_image_url}
                            alt={subcat.category_name}
                            className="h-20 w-20 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <h3 className="text-center font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {subcat.category_name}
                      </h3>
                      {subcat.product_count !== undefined && (
                        <p className="text-center text-sm text-gray-500">
                          ({subcat.product_count} products)
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* View All Products Button */}
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setSearchParams({ view: 'all' });
                  }}
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <Package className="h-5 w-5 mr-2" />
                  View All Products in {currentCategory.category_name}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Products View with Filters */}
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Filter Sidebar - Desktop */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sticky top-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={clearAllFilters}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Price Range Filter */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h4>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.price_min || ''}
                          onChange={(e) => updateFilter('price_min', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.price_max || ''}
                          onChange={(e) => updateFilter('price_max', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Availability Filter */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Availability</h4>
                      <div className="space-y-2">
                        {['in_stock', 'low_stock', 'out_of_stock'].map((status) => (
                          <label key={status} className="flex items-center cursor-pointer group">
                            <input
                              type="radio"
                              name="availability"
                              value={status}
                              checked={filters.availability === status}
                              onChange={(e) => updateFilter('availability', e.target.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 capitalize">
                              {status.replace('_', ' ')}
                            </span>
                          </label>
                        ))}
                        {filters.availability && (
                          <button
                            onClick={() => updateFilter('availability', null)}
                            className="text-xs text-blue-600 hover:text-blue-700 ml-7"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Brand Filter */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Brand</h4>
                      <input
                        type="text"
                        placeholder="Enter brand name"
                        value={filters.brand || ''}
                        onChange={(e) => updateFilter('brand', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Active Filters Display */}
                    {activeFiltersCount > 0 && (
                      <div className="pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Active Filters</h4>
                        <div className="flex flex-wrap gap-2">
                          {filters.price_min && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Min: ${filters.price_min}
                              <button
                                onClick={() => updateFilter('price_min', null)}
                                className="ml-2 hover:text-blue-900"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          )}
                          {filters.price_max && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Max: ${filters.price_max}
                              <button
                                onClick={() => updateFilter('price_max', null)}
                                className="ml-2 hover:text-blue-900"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          )}
                          {filters.availability && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              {filters.availability.replace('_', ' ')}
                              <button
                                onClick={() => updateFilter('availability', null)}
                                className="ml-2 hover:text-blue-900"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          )}
                          {filters.brand && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {filters.brand}
                              <button
                                onClick={() => updateFilter('brand', null)}
                                className="ml-2 hover:text-blue-900"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </aside>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilterDrawer(true)}
                  className="lg:hidden fixed bottom-4 right-4 z-40 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <Filter className="h-6 w-6" />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Mobile Filter Drawer */}
                {showFilterDrawer && (
                  <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowFilterDrawer(false)}></div>
                    <div className="absolute inset-y-0 right-0 max-w-full flex">
                      <div className="w-screen max-w-md">
                        <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                          <div className="px-4 py-6 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                              <button
                                onClick={() => setShowFilterDrawer(false)}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                <X className="h-6 w-6" />
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 px-4 py-6">
                            {/* Same filter content as desktop sidebar */}
                            <div className="mb-6">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h4>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  placeholder="Min"
                                  value={filters.price_min || ''}
                                  onChange={(e) => updateFilter('price_min', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <span>-</span>
                                <input
                                  type="number"
                                  placeholder="Max"
                                  value={filters.price_max || ''}
                                  onChange={(e) => updateFilter('price_max', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                              </div>
                            </div>
                            <div className="mb-6">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Availability</h4>
                              <div className="space-y-2">
                                {['in_stock', 'low_stock', 'out_of_stock'].map((status) => (
                                  <label key={status} className="flex items-center">
                                    <input
                                      type="radio"
                                      name="availability-mobile"
                                      value={status}
                                      checked={filters.availability === status}
                                      onChange={(e) => updateFilter('availability', e.target.value)}
                                      className="h-4 w-4 text-blue-600"
                                    />
                                    <span className="ml-3 text-sm text-gray-700 capitalize">
                                      {status.replace('_', ' ')}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
                            <button
                              onClick={() => setShowFilterDrawer(false)}
                              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                            >
                              Apply Filters
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1">
                  {/* Toolbar - Sort and View Toggle */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {productsData && (
                          <p className="text-sm text-gray-600">
                            Showing <span className="font-medium text-gray-900">
                              {((currentPage - 1) * 24) + 1}-{Math.min(currentPage * 24, productsData.pagination.total_items)}
                            </span> of <span className="font-medium text-gray-900">
                              {productsData.pagination.total_items}
                            </span> results
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Sort Dropdown */}
                        <select
                          value={sortBy}
                          onChange={(e) => updateFilter('sort_by', e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="relevance">Relevance</option>
                          <option value="price_asc">Price: Low to High</option>
                          <option value="price_desc">Price: High to Low</option>
                          <option value="rating">Highest Rated</option>
                          <option value="newest">Newest First</option>
                          <option value="popularity">Most Popular</option>
                        </select>

                        {/* View Toggle */}
                        <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                            aria-label="Grid view"
                          >
                            <Grid className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                            aria-label="List view"
                          >
                            <List className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Products Grid/List */}
                  {productsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                          <div className="h-48 bg-gray-200"></div>
                          <div className="p-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : productsError ? (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to Load Products</h3>
                      <p className="text-gray-600 mb-4">There was an error loading products. Please try again.</p>
                      <button
                        onClick={() => refetchProducts()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : productsData && productsData.products.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
                      <p className="text-gray-600 mb-6">
                        We couldn't find any products in this category with your current filters.
                        {activeFiltersCount > 0 ? ' Try adjusting your filters.' : ' Check back soon!'}
                      </p>
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={clearAllFilters}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  ) : productsData ? (
                    <>
                      {/* Product Grid */}
                      <div className={viewMode === 'grid' 
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                        : 'space-y-4'
                      }>
                        {productsData.products.map((product) => (
                          <div
                            key={product.product_id}
                            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200 group"
                          >
                            <Link to={`/products/${product.product_id}`} className="block">
                              <div className="relative">
                                <img
                                  src={product.primary_image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                                  alt={product.product_name}
                                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                                  loading="lazy"
                                />
                                {product.compare_at_price && product.compare_at_price > product.price && (
                                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    SALE
                                  </span>
                                )}
                                <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded ${
                                  product.availability === 'in_stock' ? 'bg-green-500 text-white' :
                                  product.availability === 'low_stock' ? 'bg-orange-500 text-white' :
                                  'bg-red-500 text-white'
                                }`}>
                                  {product.availability === 'in_stock' ? 'In Stock' :
                                   product.availability === 'low_stock' ? 'Low Stock' :
                                   'Out of Stock'}
                                </span>
                              </div>
                            </Link>

                            <div className="p-4">
                              <Link to={`/products/${product.product_id}`}>
                                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                                  {product.product_name}
                                </h3>
                              </Link>

                              <div className="flex items-center space-x-2 mb-3">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`h-4 w-4 ${i < Math.floor(Number(product.rating_average)) ? 'text-yellow-400' : 'text-gray-300'}`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">({product.rating_count})</span>
                              </div>

                              <div className="flex items-baseline space-x-2 mb-3">
                                <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                                {product.compare_at_price && product.compare_at_price > product.price && (
                                  <span className="text-sm text-gray-500 line-through">${product.compare_at_price.toFixed(2)}</span>
                                )}
                              </div>

                              <p className="text-sm text-gray-600 mb-3">
                                by <Link to={`/shop/${product.supplier_id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                                  {product.shop_name}
                                </Link>
                                {product.supplier_verified && (
                                  <span className="ml-1 text-blue-600">✓</span>
                                )}
                              </p>

                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={product.availability === 'out_of_stock'}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                {product.availability === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {productsData.pagination.total_pages > 1 && (
                        <div className="mt-8 flex items-center justify-center space-x-2">
                          <button
                            onClick={() => updateFilter('page', (currentPage - 1).toString())}
                            disabled={!productsData.pagination.has_previous}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>

                          {[...Array(Math.min(5, productsData.pagination.total_pages))].map((_, i) => {
                            const page = i + 1;
                            return (
                              <button
                                key={page}
                                onClick={() => updateFilter('page', page.toString())}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          })}

                          <button
                            onClick={() => updateFilter('page', (currentPage + 1).toString())}
                            disabled={!productsData.pagination.has_next}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_CategoryBrowse;