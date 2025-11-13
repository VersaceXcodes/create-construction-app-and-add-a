import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';

// Import all unique views
import UV_Homepage from '@/components/views/UV_Homepage';
import UV_ProductDetail from '@/components/views/UV_ProductDetail';
import UV_SearchResults from '@/components/views/UV_SearchResults';
import UV_CategoryBrowse from '@/components/views/UV_CategoryBrowse';
import UV_Login from '@/components/views/UV_Login';
import UV_Registration from '@/components/views/UV_Registration';
import UV_PasswordReset from '@/components/views/UV_PasswordReset';
import UV_GuestCheckout from '@/components/views/UV_GuestCheckout';
import UV_HowItWorks from '@/components/views/UV_HowItWorks';
import UV_BecomeSupplier from '@/components/views/UV_BecomeSupplier';
import UV_HelpCenter from '@/components/views/UV_HelpCenter';
import UV_TermsOfService from '@/components/views/UV_TermsOfService';
import UV_PrivacyPolicy from '@/components/views/UV_PrivacyPolicy';
import UV_CookiePolicy from '@/components/views/UV_CookiePolicy';
import UV_AccessibilityStatement from '@/components/views/UV_AccessibilityStatement';
import UV_ContactUs from '@/components/views/UV_ContactUs';
import UV_AboutUs from '@/components/views/UV_AboutUs';

// Note: Additional views would be imported here when implemented
// For now, using placeholders for views not in the provided list

// ============================================================================
// React Query Setup
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ============================================================================
// Loading Component
// ============================================================================

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      <p className="text-gray-600 text-lg font-medium">Loading BuildEasy...</p>
    </div>
  </div>
);

// ============================================================================
// Placeholder Component for Not Yet Implemented Views
// ============================================================================

const PlaceholderView: React.FC<{ viewName: string }> = ({ viewName }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
    <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="text-6xl mb-4">🚧</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{viewName}</h1>
      <p className="text-gray-600 mb-4">This view is under construction and will be available soon.</p>
      <button
        onClick={() => window.history.back()}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

// ============================================================================
// Route Protection Components
// ============================================================================

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // CRITICAL: Use individual selectors to avoid infinite loops
  const isAuthenticated = useAppStore(
    state => state.authentication_state.authentication_status.is_authenticated
  );
  const isLoading = useAppStore(
    state => state.authentication_state.authentication_status.is_loading
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Redirect to login with return URL
    const currentPath = window.location.pathname + window.location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }

  return <>{children}</>;
};

const RoleProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: Array<'customer' | 'supplier' | 'admin'>;
}> = ({ children, allowedRoles }) => {
  const isAuthenticated = useAppStore(
    state => state.authentication_state.authentication_status.is_authenticated
  );
  const isLoading = useAppStore(
    state => state.authentication_state.authentication_status.is_loading
  );
  const currentUser = useAppStore(
    state => state.authentication_state.current_user
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    const currentPath = window.location.pathname + window.location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }

  if (currentUser && !allowedRoles.includes(currentUser.role)) {
    // Redirect to appropriate dashboard based on user role
    const dashboardMap: Record<string, string> = {
      customer: '/account/dashboard',
      supplier: '/supplier/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboardMap[currentUser.role] || '/'} replace />;
  }

  return <>{children}</>;
};

// ============================================================================
// Main App Component
// ============================================================================

const App: React.FC = () => {
  // Individual selectors to avoid infinite loops
  const isLoading = useAppStore(
    state => state.authentication_state.authentication_status.is_loading
  );
  const initializeAuth = useAppStore(state => state.initialize_auth);

  // Initialize authentication on app mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Show loading spinner during initial auth verification
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <div className="App min-h-screen flex flex-col">
          <main className="flex-1">
            <Routes>
              {/* ============================================================ */}
              {/* Public Routes - Accessible to All Users */}
              {/* ============================================================ */}
              
              <Route path="/" element={<UV_Homepage />} />
              
              {/* Product Browsing */}
              <Route path="/products/:product_id" element={<UV_ProductDetail />} />
              <Route path="/search" element={<UV_SearchResults />} />
              <Route path="/category/:category_slug" element={<UV_CategoryBrowse />} />
              <Route path="/shop/:supplier_id" element={<PlaceholderView viewName="Supplier Shop" />} />
              
              {/* Authentication */}
              <Route path="/login" element={<UV_Login />} />
              <Route path="/register" element={<UV_Registration />} />
              <Route path="/password-reset" element={<UV_PasswordReset />} />
              
              {/* Checkout */}
              <Route path="/checkout/guest" element={<UV_GuestCheckout />} />
              <Route path="/cart" element={<PlaceholderView viewName="Cart" />} />
              
              {/* Informational Pages */}
              <Route path="/how-it-works" element={<UV_HowItWorks />} />
              <Route path="/become-a-supplier" element={<UV_BecomeSupplier />} />
              <Route path="/help" element={<UV_HelpCenter />} />
              <Route path="/about" element={<UV_AboutUs />} />
              <Route path="/contact" element={<UV_ContactUs />} />
              
              {/* Legal Pages */}
              <Route path="/terms" element={<UV_TermsOfService />} />
              <Route path="/privacy" element={<UV_PrivacyPolicy />} />
              <Route path="/cookies" element={<UV_CookiePolicy />} />
              <Route path="/accessibility" element={<UV_AccessibilityStatement />} />
              
              {/* Guest Order Tracking */}
              <Route path="/track/:order_id" element={<PlaceholderView viewName="Guest Order Tracking" />} />
              
              {/* Community Features */}
              <Route path="/community/forums" element={<PlaceholderView viewName="Community Forums" />} />
              <Route path="/community/forums/:thread_id" element={<PlaceholderView viewName="Forum Thread" />} />
              <Route path="/community/guides" element={<PlaceholderView viewName="How-To Guides" />} />
              <Route path="/community/guides/:guide_id" element={<PlaceholderView viewName="Guide Detail" />} />
              <Route path="/community/showcases" element={<PlaceholderView viewName="Project Showcase" />} />
              
              {/* Secondary Marketplace */}
              <Route path="/secondary-marketplace" element={<PlaceholderView viewName="Secondary Marketplace" />} />
              
              {/* ============================================================ */}
              {/* Protected Routes - Require Authentication */}
              {/* ============================================================ */}
              
              {/* Authenticated Checkout */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Checkout" />
                  </ProtectedRoute>
                }
              />
              
              {/* Order Confirmation */}
              <Route
                path="/order-confirmation/:order_id"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Order Confirmation" />
                  </ProtectedRoute>
                }
              />
              
              {/* ============================================================ */}
              {/* Customer Account Routes - Protected */}
              {/* ============================================================ */}
              
              <Route
                path="/account/dashboard"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Customer Dashboard" />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/account/orders"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Order History" />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/account/orders/:order_id"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Order Detail" />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/account/orders/:order_id/track"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Order Tracking" />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/account/reviews/write"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Write Review" />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/account/reviews"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="My Reviews" />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/account/wishlist"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Wishlist" />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/account/settings"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Profile Settings" />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/account/deliveries"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Upcoming Deliveries" />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/account/returns/request"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Return Request" />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/account/team"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Team Management" />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/account/projects"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Project List" />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/account/projects/:project_id"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Project Details" />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/account/analytics"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Budget Analytics" />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/account/notifications"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="Notification Center" />
                  </ProtectedRoute>
                }
              />
              
              {/* List Surplus Material - Protected */}
              <Route
                path="/secondary-marketplace/list"
                element={
                  <ProtectedRoute>
                    <PlaceholderView viewName="List Surplus Material" />
                  </ProtectedRoute>
                }
              />
              
              {/* ============================================================ */}
              {/* Supplier Routes - Role Protected */}
              {/* ============================================================ */}
              
              <Route
                path="/supplier/dashboard"
                element={
                  <RoleProtectedRoute allowedRoles={['supplier']}>
                    <PlaceholderView viewName="Supplier Dashboard" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/supplier/orders"
                element={
                  <RoleProtectedRoute allowedRoles={['supplier']}>
                    <PlaceholderView viewName="Supplier Orders" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/supplier/orders/:order_id"
                element={
                  <RoleProtectedRoute allowedRoles={['supplier']}>
                    <PlaceholderView viewName="Supplier Order Detail" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/supplier/products"
                element={
                  <RoleProtectedRoute allowedRoles={['supplier']}>
                    <PlaceholderView viewName="Product Management" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/supplier/products/new"
                element={
                  <RoleProtectedRoute allowedRoles={['supplier']}>
                    <PlaceholderView viewName="Add New Product" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/supplier/products/:product_id/edit"
                element={
                  <RoleProtectedRoute allowedRoles={['supplier']}>
                    <PlaceholderView viewName="Edit Product" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/supplier/products/bulk-upload"
                element={
                  <RoleProtectedRoute allowedRoles={['supplier']}>
                    <PlaceholderView viewName="Bulk Upload" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/supplier/inventory"
                element={
                  <RoleProtectedRoute allowedRoles={['supplier']}>
                    <PlaceholderView viewName="Inventory Management" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/supplier/analytics"
                element={
                  <RoleProtectedRoute allowedRoles={['supplier']}>
                    <PlaceholderView viewName="Supplier Analytics" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/supplier/settings"
                element={
                  <RoleProtectedRoute allowedRoles={['supplier']}>
                    <PlaceholderView viewName="Shop Settings" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/supplier/payouts"
                element={
                  <RoleProtectedRoute allowedRoles={['supplier']}>
                    <PlaceholderView viewName="Payout Management" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/supplier/reviews"
                element={
                  <RoleProtectedRoute allowedRoles={['supplier']}>
                    <PlaceholderView viewName="Supplier Reviews" />
                  </RoleProtectedRoute>
                }
              />
              
              {/* ============================================================ */}
              {/* Admin Routes - Role Protected */}
              {/* ============================================================ */}
              
              <Route
                path="/admin/dashboard"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="Admin Dashboard" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/suppliers/applications"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="Supplier Applications" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/suppliers/applications/:application_id"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="Supplier Application Review" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/users"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="User Management" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/users/:user_id"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="User Profile Admin" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/suppliers"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="Supplier Management" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/orders"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="Admin Order Management" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/orders/:order_id"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="Admin Order Detail" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/disputes"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="Dispute Management" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/disputes/:dispute_id"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="Dispute Detail" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/moderation"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="Content Moderation" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/financial"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="Financial Management" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/settings"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="Platform Settings" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/support"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="Support Tickets" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/support/:ticket_id"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="Support Ticket Detail" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/announcements"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="Announcement Manager" />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/admin/analytics"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PlaceholderView viewName="Admin Analytics" />
                  </RoleProtectedRoute>
                }
              />
              
              {/* ============================================================ */}
              {/* Catch All - Redirect to Homepage */}
              {/* ============================================================ */}
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </QueryClientProvider>
    </Router>
  );
};

export default App;