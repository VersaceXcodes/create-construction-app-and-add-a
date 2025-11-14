import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';

// ============================================================================
// Types
// ============================================================================

interface Product {
  product_id: string;
  product_name: string;
  product_slug: string;
  price: number;
  compare_at_price: number | null;
  quantity_on_hand: number;
  rating_average: number;
  rating_count: number;
  supplier_id: string;
  shop_name: string;
  supplier_rating: number;
  supplier_verified: boolean;
  primary_image_url: string | null;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  brand: string | null;
  low_stock_threshold: number;
}

interface SearchResponse {
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

interface Filters {
  category_ids: string[];
  min_price: number | null;
  max_price: number | null;
  brand: string[];
  availability: string[];
  supplier_rating_min: number | null;
}

// ============================================================================
// Component
// ============================================================================

const UV_SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // CRITICAL: Individual selectors to prevent infinite loops
  const addToCartAction = useAppStore(state => state.add_to_cart);

  // Local UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Parse URL params - memoized to prevent unnecessary rerenders
  const search_query = useMemo(() => searchParams.get('q') || '', [searchParams]);
  const sort_by = useMemo(() => searchParams.get('sort_by') || 'relevance', [searchParams]);
  const current_page = useMemo(() => parseInt(searchParams.get('page') || '1', 10), [searchParams]);

  // Parse filters from URL params
  const filters: Filters = useMemo(() => ({
    category_ids: searchParams.get('category') ? [searchParams.get('category')!] : [],
    min_price: searchParams.get('price_min') ? Number(searchParams.get('price_min')) : null,
    max_price: searchParams.get('price_max') ? Number(searchParams.get('price_max')) : null,
    brand: searchParams.get('brand') ? searchParams.get('brand')!.split(',').filter(Boolean) : [],
    availability: searchParams.get('availability') ? searchParams.get('availability')!.split(',').filter(Boolean) : [],
    supplier_rating_min: searchParams.get('supplier_rating_min') ? Number(searchParams.get('supplier_rating_min')) : null,
  }), [searchParams]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category_ids.length > 0) count++;
    if (filters.min_price !== null || filters.max_price !== null) count++;
    if (filters.brand.length > 0) count += filters.brand.length;
    if (filters.availability.length > 0) count += filters.availability.length;
    if (filters.supplier_rating_min !== null) count++;
    return count;
  }, [filters]);

  // Fetch search results
  const { data, isLoading, error } = useQuery<SearchResponse>({
    queryKey: ['products', 'search', search_query, filters, sort_by, current_page],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        sort_by,
        page: current_page,
        limit: 24,
        status: 'active',
      };

      // Only add search query if it's not empty
      if (search_query.length > 0) {
        params.q = search_query;
      }

      if (filters.category_ids.length > 0) params.category = filters.category_ids[0];
      if (filters.min_price !== null) params.price_min = filters.min_price;
      if (filters.max_price !== null) params.price_max = filters.max_price;
      if (filters.brand.length > 0) params.brand = filters.brand.join(',');
      if (filters.availability.length > 0) params.availability = filters.availability.join(',');
      if (filters.supplier_rating_min !== null) params.supplier_rating_min = filters.supplier_rating_min;

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/products`, { params });
      return response.data;
    },
    enabled: true, // Always fetch products, even without a search query
    staleTime: 60000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    retry: 1,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (product: Product) => {
      await addToCartAction({
        product_id: product.product_id,
        supplier_id: product.supplier_id,
        quantity: 1,
        unit_price: product.price,
      });
    },
    onSuccess: () => {
      // Success is handled by global state update
    },
  });

  // Update filters in URL
  const updateFilters = (newFilters: Partial<Filters>) => {
    const params = new URLSearchParams(searchParams);
    
    if (newFilters.category_ids !== undefined) {
      if (newFilters.category_ids.length > 0) {
        params.set('category', newFilters.category_ids[0]);
      } else {
        params.delete('category');
      }
    }
    
    if (newFilters.min_price !== undefined) {
      if (newFilters.min_price !== null) {
        params.set('price_min', String(newFilters.min_price));
      } else {
        params.delete('price_min');
      }
    }
    
    if (newFilters.max_price !== undefined) {
      if (newFilters.max_price !== null) {
        params.set('price_max', String(newFilters.max_price));
      } else {
        params.delete('price_max');
      }
    }
    
    if (newFilters.brand !== undefined) {
      if (newFilters.brand.length > 0) {
        params.set('brand', newFilters.brand.join(','));
      } else {
        params.delete('brand');
      }
    }
    
    if (newFilters.availability !== undefined) {
      if (newFilters.availability.length > 0) {
        params.set('availability', newFilters.availability.join(','));
      } else {
        params.delete('availability');
      }
    }
    
    if (newFilters.supplier_rating_min !== undefined) {
      if (newFilters.supplier_rating_min !== null) {
        params.set('supplier_rating_min', String(newFilters.supplier_rating_min));
      } else {
        params.delete('supplier_rating_min');
      }
    }

    params.set('page', '1');
    setSearchParams(params);
  };

  const updateSort = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort_by', newSort);
    params.set('page', '1');
    setSearchParams(params);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    params.set('q', search_query);
    params.set('page', '1');
    setSearchParams(params);
  };

  const products = (data as any)?.products || [];
  const pagination = (data as any)?.pagination;
  const total_results = pagination?.total_items || 0;

  // Redirect if no search query
  useEffect(() => {
    if (!search_query) {
      // No search query, could redirect to home or show message
    }
  }, [search_query]);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Search query and result count */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                    {search_query ? `Search: "${search_query}"` : 'All Products'}
                  </h1>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Edit search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                </div>
                {isLoading && (
                  <p className="text-sm text-gray-600 mt-1" data-testid="loading-results">
                    Loading results...
                  </p>
                )}
                {!isLoading && total_results > 0 && (
                  <p className="text-sm text-gray-600 mt-1" data-testid="results-count">
                    <span className="font-semibold">{total_results.toLocaleString()}</span> {total_results === 1 ? 'result' : 'results'} found
                    {' '}(showing {((current_page - 1) * 24) + 1}-{Math.min(current_page * 24, total_results)})
                  </p>
                )}
                {!isLoading && total_results === 0 && (
                  <p className="text-sm text-gray-600 mt-1" data-testid="no-results">
                    0 results found
                  </p>
                )}
              </div>

              {/* View toggle and sort */}
              <div className="flex items-center gap-3">
                {/* View mode toggle - Desktop only */}
                <div className="hidden sm:flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-label="Grid view"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-label="List view"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                {/* Sort dropdown */}
                <select
                  value={sort_by}
                  onChange={(e) => updateSort(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  aria-label="Sort by"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">Newest</option>
                  <option value="popularity">Most Popular</option>
                </select>

                {/* Mobile filter button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter sidebar - Desktop */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Active filters chips */}
                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-gray-200">
                    {filters.min_price !== null && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800 font-medium">
                        Min: ${filters.min_price}
                        <button
                          onClick={() => updateFilters({ min_price: null })}
                          className="ml-2 hover:text-blue-900 transition-colors"
                          aria-label="Remove minimum price filter"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.max_price !== null && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800 font-medium">
                        Max: ${filters.max_price}
                        <button
                          onClick={() => updateFilters({ max_price: null })}
                          className="ml-2 hover:text-blue-900 transition-colors"
                          aria-label="Remove maximum price filter"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.brand.map(b => (
                      <span key={b} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800 font-medium">
                        {b}
                        <button
                          onClick={() => updateFilters({ brand: filters.brand.filter(x => x !== b) })}
                          className="ml-2 hover:text-blue-900 transition-colors"
                          aria-label={`Remove ${b} brand filter`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.min_price || ''}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : null;
                        updateFilters({ min_price: value });
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                      aria-label="Minimum price"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.max_price || ''}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : null;
                        updateFilters({ max_price: value });
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                      aria-label="Maximum price"
                    />
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Availability</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'in_stock', label: 'In Stock' },
                      { value: 'low_stock', label: 'Low Stock' },
                      { value: 'out_of_stock', label: 'Out of Stock' }
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.availability.includes(value)}
                          onChange={(e) => {
                            const newAvailability = e.target.checked
                              ? [...filters.availability, value]
                              : filters.availability.filter(s => s !== value);
                            updateFilters({ availability: newAvailability });
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors"
                        />
                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Supplier Rating Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Supplier Rating</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                      <label key={rating} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="supplier_rating"
                          checked={filters.supplier_rating_min === rating}
                          onChange={() => updateFilters({ supplier_rating_min: rating })}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 transition-colors"
                        />
                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 flex items-center transition-colors">
                          {rating}+ 
                          <span className="ml-1 text-yellow-500">★</span>
                        </span>
                      </label>
                    ))}
                    {filters.supplier_rating_min !== null && (
                      <button
                        onClick={() => updateFilters({ supplier_rating_min: null })}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        Clear rating filter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile filter drawer */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
                  onClick={() => setShowMobileFilters(false)}
                  aria-hidden="true"
                />
                <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="Close filters"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="space-y-6">
                        {/* Price Range */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Min"
                              value={filters.min_price || ''}
                              onChange={(e) => {
                                const value = e.target.value ? Number(e.target.value) : null;
                                updateFilters({ min_price: value });
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={filters.max_price || ''}
                              onChange={(e) => {
                                const value = e.target.value ? Number(e.target.value) : null;
                                updateFilters({ max_price: value });
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Availability */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">Availability</h3>
                          <div className="space-y-2">
                            {[
                              { value: 'in_stock', label: 'In Stock' },
                              { value: 'low_stock', label: 'Low Stock' },
                              { value: 'out_of_stock', label: 'Out of Stock' }
                            ].map(({ value, label }) => (
                              <label key={value} className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filters.availability.includes(value)}
                                  onChange={(e) => {
                                    const newAvailability = e.target.checked
                                      ? [...filters.availability, value]
                                      : filters.availability.filter(s => s !== value);
                                    updateFilters({ availability: newAvailability });
                                  }}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">{label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Supplier Rating */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">Supplier Rating</h3>
                          <div className="space-y-2">
                            {[4, 3, 2, 1].map(rating => (
                              <label key={rating} className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="supplier_rating_mobile"
                                  checked={filters.supplier_rating_min === rating}
                                  onChange={() => updateFilters({ supplier_rating_min: rating })}
                                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 flex items-center">
                                  {rating}+ <span className="ml-1 text-yellow-500">★</span>
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                      >
                        Show {total_results} Results
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results area */}
            <div className="flex-1">
              {/* Loading state */}
              {isLoading && (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                    : 'space-y-4'
                }>
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                      <div className="w-full h-48 bg-gray-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                  <div className="text-red-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Search Error</h3>
                  <p className="text-gray-600">Unable to load search results. Please try again.</p>
                </div>
              )}

              {/* No results state */}
              {!isLoading && !error && products.length === 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                  <div className="text-gray-400 mb-6">
                    <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 10l4 4m0-4l-4 4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {search_query 
                      ? `We couldn't find any products matching "${search_query}"`
                      : "We couldn't find any products with your current filters"}
                  </p>
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Try:</p>
                      <ul className="text-sm text-gray-600 space-y-1 text-left">
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          Checking your spelling
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          Using different keywords
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          Removing some filters
                        </li>
                      </ul>
                    </div>
                  </div>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                      Clear All Filters
                    </button>
                  )}
                  <Link
                    to="/"
                    className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Browse all products →
                  </Link>
                </div>
              )}

              {/* Products grid/list */}
              {!isLoading && !error && products.length > 0 && (
                <>
                  <div className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                      : 'space-y-4'
                  }>
                    {products.map(product => (
                      <div
                        key={product.product_id}
                        className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200 ${
                          viewMode === 'list' ? 'flex' : 'flex flex-col'
                        }`}
                      >
                        {/* Product Image */}
                        <Link
                          to={`/products/${product. product_id}`}
                          className={viewMode === 'list' ? 'w-48 flex-shrink-0' : 'block'}
                        >
                          <div className={`relative ${viewMode === 'grid' ? 'aspect-square' : 'h-full'} bg-gray-100 overflow-hidden group`}>
                            {product.primary_image_url ? (
                              <img
                                src={product.primary_image_url}
                                alt={product.product_name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            
                            {/* Badges */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {product.compare_at_price && product.compare_at_price > product.price && (
                                <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-md shadow-lg">
                                  SALE
                                </span>
                              )}
                              {product.availability === 'low_stock' && (
                                <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-md shadow-lg">
                                  LOW STOCK
                                </span>
                              )}
                              {product.availability === 'out_of_stock' && (
                                <span className="px-2 py-1 bg-gray-600 text-white text-xs font-bold rounded-md shadow-lg">
                                  OUT OF STOCK
                                </span>
                              )}
                            </div>

                            {product.supplier_verified && (
                              <div className="absolute top-2 right-2">
                                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-md shadow-lg flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Verified
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Product Info */}
                        <div className="p-4 flex-1 flex flex-col">
                          <Link to={`/products/${product.product_id}`}>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                              {product.product_name}
                            </h3>
                          </Link>
                          
                          {product.brand && (
                            <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                          )}

                          {/* Price */}
                          <div className="mb-3">
                            {product.compare_at_price && product.compare_at_price > product.price ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xl font-bold text-gray-900">
                                  ${product.price.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  ${product.compare_at_price.toFixed(2)}
                                </span>
                                <span className="text-xs font-bold text-red-600">
                                  Save {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-xl font-bold text-gray-900">
                                ${product.price.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Supplier info */}
                          <Link
                            to={`/shop/${product.supplier_id}`}
                            className="text-xs text-gray-600 hover:text-blue-600 transition-colors mb-2 flex items-center gap-1"
                          >
                            <span className="font-medium">{product.shop_name}</span>
                            {product.supplier_rating > 0 && (
                              <span className="flex items-center">
                                <span className="text-yellow-500 ml-1">★</span>
                                <span className="ml-0.5">{product.supplier_rating.toFixed(1)}</span>
                              </span>
                            )}
                          </Link>

                          {/* Product rating */}
                          {product.rating_count > 0 && (
                            <div className="flex items-center gap-1 mb-2">
                              <div className="flex items-center">
                                <span className="text-yellow-500 text-sm">★</span>
                                <span className="text-sm font-medium text-gray-700 ml-1">
                                  {parseFloat(product.rating_average).toFixed(1)}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                ({product.rating_count})
                              </span>
                            </div>
                          )}

                          {/* Stock info */}
                          {product.availability === 'low_stock' && product.quantity_on_hand <= product.low_stock_threshold && (
                            <p className="text-xs text-orange-600 font-medium mb-3">
                              Only {product.quantity_on_hand} left!
                            </p>
                          )}

                          {/* Actions */}
                          <div className="mt-auto pt-3 flex gap-2">
                            <button
                              onClick={async (e) => {
                                e.preventDefault();
                                await addToCartMutation.mutateAsync(product);
                              }}
                              disabled={product.availability === 'out_of_stock' || addToCartMutation.isPending}
                              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                product.availability === 'out_of_stock'
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl hover:scale-105'
                              }`}
                              aria-label={product.availability === 'out_of_stock' ? 'Out of stock' : `Add ${product.product_name} to cart`}
                            >
                              {addToCartMutation.isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Adding...
                                </span>
                              ) : product.availability === 'out_of_stock' ? (
                                'Out of Stock'
                              ) : (
                                'Add to Cart'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.total_pages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <nav className="flex items-center gap-2" aria-label="Pagination">
                        <button
                          onClick={() => goToPage(current_page - 1)}
                          disabled={!pagination.has_previous}
                          className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          aria-label="Previous page"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        {/* Page numbers */}
                        {(() => {
                          const maxPagesToShow = 5;
                          const pages: number[] = [];
                          
                          if (pagination.total_pages <= maxPagesToShow) {
                            for (let i = 1; i <= pagination.total_pages; i++) {
                              pages.push(i);
                            }
                          } else {
                            if (current_page <= 3) {
                              for (let i = 1; i <= 4; i++) pages.push(i);
                              pages.push(-1); // Ellipsis
                              pages.push(pagination.total_pages);
                            } else if (current_page >= pagination.total_pages - 2) {
                              pages.push(1);
                              pages.push(-1);
                              for (let i = pagination.total_pages - 3; i <= pagination.total_pages; i++) {
                                pages.push(i);
                              }
                            } else {
                              pages.push(1);
                              pages.push(-1);
                              for (let i = current_page - 1; i <= current_page + 1; i++) {
                                pages.push(i);
                              }
                              pages.push(-1);
                              pages.push(pagination.total_pages);
                            }
                          }

                          return pages.map((pageNum, idx) => {
                            if (pageNum === -1) {
                              return (
                                <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                                  ...
                                </span>
                              );
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => goToPage(pageNum)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  pageNum === current_page
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400'
                                }`}
                                aria-label={`Go to page ${pageNum}`}
                                aria-current={pageNum === current_page ? 'page' : undefined}
                              >
                                {pageNum}
                              </button>
                            );
                          });
                        })()}

                        <button
                          onClick={() => goToPage(current_page + 1)}
                          disabled={!pagination.has_next}
                          className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          aria-label="Next page"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_SearchResults;