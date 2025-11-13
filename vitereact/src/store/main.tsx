import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios, { AxiosError } from 'axios';
import { io, Socket } from 'socket.io-client';

// ============================================================================
// Type Definitions (matching backend schemas exactly)
// ============================================================================

export interface User {
  user_id: string;
  email: string;
  phone: string;
  name: string;
  role: 'customer' | 'supplier' | 'admin';
  account_type: 'personal' | 'business';
  email_verified: boolean;
  phone_verified: boolean;
  profile_photo_url: string | null;
  status: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  cart_item_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  variant_id: string | null;
  variant_name: string | null;
  supplier_id: string;
  supplier_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  availability_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  stock_remaining: number | null;
  reserved_at: string;
}

export interface Notification {
  notification_id: string;
  notification_type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  related_entity_type: string | null;
  related_entity_id: string | null;
  action_url: string | null;
  icon_type: string;
}

export interface Conversation {
  conversation_id: string;
  partner_id: string;
  partner_name: string;
  partner_avatar: string | null;
  partner_type: 'customer' | 'supplier' | 'admin';
  last_message_preview: string;
  last_message_timestamp: string;
  is_unread: boolean;
  related_order_id: string | null;
  related_product_id: string | null;
}

export interface AuthenticationState {
  current_user: User | null;
  auth_token: string | null;
  authentication_status: {
    is_authenticated: boolean;
    is_loading: boolean;
    is_verifying: boolean;
  };
  error_message: string | null;
}

export interface ShoppingCartState {
  items: CartItem[];
  cart_metadata: {
    item_count: number;
    subtotal: number;
    estimated_delivery_cost: number;
    estimated_tax: number;
    total: number;
    currency: string;
  };
  promo_code: {
    code: string;
    discount_amount: number;
    discount_type: string;
  } | null;
  reservation_expiry: string | null;
  last_updated: string;
}

export interface NotificationState {
  unread_count: number;
  notifications: Notification[];
  last_fetched: string;
}

export interface MessagingState {
  unread_message_count: number;
  active_conversation_id: string | null;
  conversations: Conversation[];
  last_fetched: string;
}

export interface UserLocationState {
  postal_code: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  is_location_set: boolean;
}

export interface UIState {
  is_cart_sidebar_open: boolean;
  is_messaging_panel_open: boolean;
  is_notification_dropdown_open: boolean;
  is_mobile_menu_open: boolean;
  active_modal: string | null;
  is_loading: boolean;
}

export interface WebSocketConnection {
  socket: Socket | null;
  is_connected: boolean;
  connection_id: string | null;
}

// ============================================================================
// Main Store Interface
// ============================================================================

export interface AppState {
  // State
  authentication_state: AuthenticationState;
  shopping_cart_state: ShoppingCartState;
  notification_state: NotificationState;
  messaging_state: MessagingState;
  user_location_state: UserLocationState;
  ui_state: UIState;
  websocket_connection: WebSocketConnection;

  // Auth Actions
  login_user: (email: string, password: string) => Promise<void>;
  register_user: (userData: {
    email: string;
    phone: string;
    password: string;
    name: string;
    role?: 'customer' | 'supplier';
    account_type?: 'personal' | 'business';
  }) => Promise<void>;
  logout_user: () => void;
  initialize_auth: () => Promise<void>;
  clear_auth_error: () => void;
  update_user_profile: (userData: Partial<User>) => void;

  // Cart Actions
  load_cart: () => Promise<void>;
  add_to_cart: (item: {
    product_id: string;
    variant_id?: string | null;
    supplier_id: string;
    quantity: number;
    unit_price: number;
  }) => Promise<void>;
  update_cart_item_quantity: (cart_item_id: string, quantity: number) => Promise<void>;
  remove_from_cart: (cart_item_id: string) => Promise<void>;
  clear_cart: () => void;
  apply_promo_code: (code: string) => Promise<void>;

  // Notification Actions
  load_notifications: () => Promise<void>;
  mark_notification_read: (notification_id: string) => Promise<void>;
  mark_all_notifications_read: () => Promise<void>;

  // Messaging Actions
  load_conversations: () => Promise<void>;
  set_active_conversation: (conversation_id: string | null) => void;

  // Location Actions
  set_user_location: (location: Partial<UserLocationState>) => void;

  // UI Actions
  toggle_cart_sidebar: () => void;
  toggle_messaging_panel: () => void;
  toggle_notification_dropdown: () => void;
  toggle_mobile_menu: () => void;
  set_active_modal: (modal: string | null) => void;
  set_loading: (loading: boolean) => void;

  // WebSocket Actions
  connect_websocket: () => void;
  disconnect_websocket: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3000';

const get_auth_headers = (token: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// ============================================================================
// Zustand Store Implementation
// ============================================================================

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ========================================================================
      // Initial State
      // ========================================================================
      
      authentication_state: {
        current_user: null,
        auth_token: null,
        authentication_status: {
          is_authenticated: false,
          is_loading: true,
          is_verifying: false,
        },
        error_message: null,
      },

      shopping_cart_state: {
        items: [],
        cart_metadata: {
          item_count: 0,
          subtotal: 0,
          estimated_delivery_cost: 0,
          estimated_tax: 0,
          total: 0,
          currency: 'USD',
        },
        promo_code: null,
        reservation_expiry: null,
        last_updated: '',
      },

      notification_state: {
        unread_count: 0,
        notifications: [],
        last_fetched: '',
      },

      messaging_state: {
        unread_message_count: 0,
        active_conversation_id: null,
        conversations: [],
        last_fetched: '',
      },

      user_location_state: {
        postal_code: null,
        city: null,
        state: null,
        country: null,
        latitude: null,
        longitude: null,
        is_location_set: false,
      },

      ui_state: {
        is_cart_sidebar_open: false,
        is_messaging_panel_open: false,
        is_notification_dropdown_open: false,
        is_mobile_menu_open: false,
        active_modal: null,
        is_loading: false,
      },

      websocket_connection: {
        socket: null,
        is_connected: false,
        connection_id: null,
      },

      // ========================================================================
      // Authentication Actions
      // ========================================================================

      login_user: async (email: string, password: string) => {
        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            authentication_status: {
              ...state.authentication_state.authentication_status,
              is_loading: true,
            },
            error_message: null,
          },
        }));

        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/login`,
            { email, password },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const { user, token } = response.data;

          set(() => ({
            authentication_state: {
              current_user: user,
              auth_token: token,
              authentication_status: {
                is_authenticated: true,
                is_loading: false,
                is_verifying: false,
              },
              error_message: null,
            },
          }));

          // After successful login, load user data and connect WebSocket
          const { load_cart, load_notifications, load_conversations, connect_websocket } = get();
          await Promise.allSettled([
            load_cart(),
            load_notifications(),
            load_conversations(),
          ]);
          connect_websocket();
        } catch (error) {
          const axiosError = error as AxiosError<{ error?: string; message?: string }>;
          const errorMessage = 
            axiosError.response?.data?.error || 
            axiosError.response?.data?.message || 
            axiosError.message || 
            'Login failed';

          set(() => ({
            authentication_state: {
              current_user: null,
              auth_token: null,
              authentication_status: {
                is_authenticated: false,
                is_loading: false,
                is_verifying: false,
              },
              error_message: errorMessage,
            },
          }));

          throw new Error(errorMessage);
        }
      },

      register_user: async (userData) => {
        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            authentication_status: {
              ...state.authentication_state.authentication_status,
              is_loading: true,
            },
            error_message: null,
          },
        }));

        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/register`,
            {
              email: userData.email,
              phone: userData.phone,
              password_hash: userData.password, // Plain text per DRD requirements
              name: userData.name,
              role: userData.role || 'customer',
              account_type: userData.account_type || 'personal',
              email_verified: false,
              phone_verified: false,
              profile_photo_url: null,
              status: 'active',
            },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const { user, token } = response.data;

          set(() => ({
            authentication_state: {
              current_user: user,
              auth_token: token,
              authentication_status: {
                is_authenticated: true,
                is_loading: false,
                is_verifying: false,
              },
              error_message: null,
            },
          }));

          // After successful registration, load user data and connect WebSocket
          const { load_cart, load_notifications, connect_websocket } = get();
          await Promise.allSettled([load_cart(), load_notifications()]);
          connect_websocket();
        } catch (error) {
          const axiosError = error as AxiosError<{ error?: string; message?: string }>;
          const errorMessage = 
            axiosError.response?.data?.error || 
            axiosError.response?.data?.message || 
            axiosError.message || 
            'Registration failed';

          set((state) => ({
            authentication_state: {
              ...state.authentication_state,
              authentication_status: {
                is_authenticated: false,
                is_loading: false,
                is_verifying: false,
              },
              error_message: errorMessage,
            },
          }));

          throw new Error(errorMessage);
        }
      },

      logout_user: () => {
        const { disconnect_websocket } = get();
        
        // Disconnect WebSocket first
        disconnect_websocket();

        // Clear all state
        set({
          authentication_state: {
            current_user: null,
            auth_token: null,
            authentication_status: {
              is_authenticated: false,
              is_loading: false,
              is_verifying: false,
            },
            error_message: null,
          },
          shopping_cart_state: {
            items: [],
            cart_metadata: {
              item_count: 0,
              subtotal: 0,
              estimated_delivery_cost: 0,
              estimated_tax: 0,
              total: 0,
              currency: 'USD',
            },
            promo_code: null,
            reservation_expiry: null,
            last_updated: '',
          },
          notification_state: {
            unread_count: 0,
            notifications: [],
            last_fetched: '',
          },
          messaging_state: {
            unread_message_count: 0,
            active_conversation_id: null,
            conversations: [],
            last_fetched: '',
          },
        });

        // Optional: Call logout endpoint to invalidate token server-side
        const token = get().authentication_state.auth_token;
        if (token) {
          axios.post(
            `${API_BASE_URL}/api/auth/logout`,
            {},
            { headers: get_auth_headers(token) }
          ).catch(() => {
            // Ignore logout endpoint errors
          });
        }
      },

      initialize_auth: async () => {
        const { authentication_state } = get();
        const token = authentication_state.auth_token;

        if (!token) {
          set((state) => ({
            authentication_state: {
              ...state.authentication_state,
              authentication_status: {
                ...state.authentication_state.authentication_status,
                is_loading: false,
              },
            },
          }));
          return;
        }

        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            authentication_status: {
              ...state.authentication_state.authentication_status,
              is_verifying: true,
            },
          },
        }));

        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/users/me`,
            { headers: get_auth_headers(token) }
          );

          const user = response.data;

          set(() => ({
            authentication_state: {
              current_user: user,
              auth_token: token,
              authentication_status: {
                is_authenticated: true,
                is_loading: false,
                is_verifying: false,
              },
              error_message: null,
            },
          }));

          // Load user data and connect WebSocket
          const { load_cart, load_notifications, load_conversations, connect_websocket } = get();
          await Promise.allSettled([
            load_cart(),
            load_notifications(),
            load_conversations(),
          ]);
          connect_websocket();
        } catch {
          // Token invalid or expired, clear auth state
          set({
            authentication_state: {
              current_user: null,
              auth_token: null,
              authentication_status: {
                is_authenticated: false,
                is_loading: false,
                is_verifying: false,
              },
              error_message: null,
            },
          });
        }
      },

      clear_auth_error: () => {
        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            error_message: null,
          },
        }));
      },

      update_user_profile: (userData: Partial<User>) => {
        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            current_user: state.authentication_state.current_user
              ? { ...state.authentication_state.current_user, ...userData }
              : null,
          },
        }));
      },

      // ========================================================================
      // Shopping Cart Actions
      // ========================================================================

      load_cart: async () => {
        const { authentication_state } = get();
        const token = authentication_state.auth_token;

        if (!token) {
          // Guest cart logic would go here if needed
          return;
        }

        try {
          // Get user's active cart
          const cartsResponse = await axios.get(
            `${API_BASE_URL}/api/users/me/carts`,
            { 
              headers: get_auth_headers(token)
            }
          );

          const activeCarts = Array.isArray(cartsResponse.data) ? cartsResponse.data : [];
          const activeCart = activeCarts.find((c: any) => c.is_active);
          
          if (!activeCart) {
            // No active cart, keep empty state
            return;
          }

          const cart = activeCart;
          
          // Load cart items
          const itemsResponse = await axios.get(
            `${API_BASE_URL}/api/carts/${cart.cart_id}/items`,
            { headers: get_auth_headers(token) }
          );

          const items = itemsResponse.data;

          // Calculate metadata
          const item_count = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
          const subtotal = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);

          set(() => ({
            shopping_cart_state: {
              items: items.map((item: any) => ({
                cart_item_id: item.cart_item_id,
                product_id: item.product_id,
                product_name: item.product_name,
                product_image: item.product_image_url,
                variant_id: item.variant_id,
                variant_name: null, // Would need variant lookup
                supplier_id: item.supplier_id,
                supplier_name: item.shop_name || 'Supplier',
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.subtotal,
                availability_status: item.quantity_on_hand > 0 ? 
                  (item.quantity_on_hand <= 10 ? 'low_stock' : 'in_stock') : 
                  'out_of_stock',
                stock_remaining: item.quantity_on_hand,
                reserved_at: item.reserved_at || item.added_at,
              })),
              cart_metadata: {
                item_count,
                subtotal,
                estimated_delivery_cost: 0, // Would be calculated
                estimated_tax: 0, // Would be calculated
                total: subtotal,
                currency: 'USD',
              },
              promo_code: cart.promo_code ? {
                code: cart.promo_code,
                discount_amount: cart.promo_discount_amount || 0,
                discount_type: cart.promo_discount_type || 'fixed',
              } : null,
              reservation_expiry: cart.reservation_expiry,
              last_updated: new Date().toISOString(),
            },
          }));
        } catch (error) {
          console.error('Failed to load cart:', error);
        }
      },

      add_to_cart: async (item) => {
        const { authentication_state } = get();
        const token = authentication_state.auth_token;

        if (!token) {
          throw new Error('Authentication required to add to cart');
        }

        try {
          // Get or create active cart
          const cartsResponse = await axios.get(
            `${API_BASE_URL}/api/users/me/carts`,
            { 
              headers: get_auth_headers(token)
            }
          );

          let cart_id: string;
          const activeCarts = Array.isArray(cartsResponse.data) ? cartsResponse.data : [];
          const activeCart = activeCarts.find((c: any) => c.is_active);
          
          if (!activeCart) {
            // Create new cart
            const createCartResponse = await axios.post(
              `${API_BASE_URL}/api/users/me/carts`,
              {
                cart_name: null,
                is_active: true,
                project_id: null,
                promo_code: null,
              },
              { headers: get_auth_headers(token) }
            );
            cart_id = createCartResponse.data.cart_id;
          } else {
            cart_id = activeCart.cart_id;
          }

          // Add item to cart
          await axios.post(
            `${API_BASE_URL}/api/carts/${cart_id}/items`,
            {
              product_id: item.product_id,
              variant_id: item.variant_id || null,
              supplier_id: item.supplier_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              subtotal: item.quantity * item.unit_price,
            },
            { headers: get_auth_headers(token) }
          );

          // Reload cart to get updated state
          await get().load_cart();
        } catch (error) {
          const axiosError = error as AxiosError<{ error?: string }>;
          throw new Error(axiosError.response?.data?.error || 'Failed to add to cart');
        }
      },

      update_cart_item_quantity: async (cart_item_id: string, quantity: number) => {
        const { authentication_state } = get();
        const token = authentication_state.auth_token;

        if (!token) {
          throw new Error('Authentication required');
        }

        try {
          await axios.patch(
            `${API_BASE_URL}/api/cart-items/${cart_item_id}`,
            { quantity },
            { headers: get_auth_headers(token) }
          );

          // Reload cart
          await get().load_cart();
        } catch (error) {
          const axiosError = error as AxiosError<{ error?: string }>;
          throw new Error(axiosError.response?.data?.error || 'Failed to update cart');
        }
      },

      remove_from_cart: async (cart_item_id: string) => {
        const { authentication_state } = get();
        const token = authentication_state.auth_token;

        if (!token) {
          throw new Error('Authentication required');
        }

        try {
          await axios.delete(
            `${API_BASE_URL}/api/cart-items/${cart_item_id}`,
            { headers: get_auth_headers(token) }
          );

          // Reload cart
          await get().load_cart();
        } catch (error) {
          const axiosError = error as AxiosError<{ error?: string }>;
          throw new Error(axiosError.response?.data?.error || 'Failed to remove item');
        }
      },

      clear_cart: () => {
        set(() => ({
          shopping_cart_state: {
            items: [],
            cart_metadata: {
              item_count: 0,
              subtotal: 0,
              estimated_delivery_cost: 0,
              estimated_tax: 0,
              total: 0,
              currency: 'USD',
            },
            promo_code: null,
            reservation_expiry: null,
            last_updated: new Date().toISOString(),
          },
        }));
      },

      apply_promo_code: async (code: string) => {
        const { authentication_state } = get();
        const token = authentication_state.auth_token;

        if (!token) {
          throw new Error('Authentication required');
        }

        try {
          // Get active cart
          const cartsResponse = await axios.get(
            `${API_BASE_URL}/api/users/me/carts`,
            { 
              headers: get_auth_headers(token)
            }
          );

          const activeCarts = Array.isArray(cartsResponse.data) ? cartsResponse.data : [];
          const activeCart = activeCarts.find((c: any) => c.is_active);
          
          if (!activeCart) {
            throw new Error('No active cart found');
          }

          // const cart_id = activeCart.cart_id; // unused for now

          // Apply promo code (endpoint inferred from requirements)
          const response = await axios.post(
            `${API_BASE_URL}/api/cart/promo`,
            { promo_code: code },
            { headers: get_auth_headers(token) }
          );

          set((state) => ({
            shopping_cart_state: {
              ...state.shopping_cart_state,
              promo_code: response.data.success ? {
                code: code,
                discount_amount: response.data.discount_amount,
                discount_type: response.data.discount_type,
              } : null,
            },
          }));

          // Reload cart for updated totals
          await get().load_cart();
        } catch (error) {
          const axiosError = error as AxiosError<{ error?: string }>;
          throw new Error(axiosError.response?.data?.error || 'Invalid promo code');
        }
      },

      // ========================================================================
      // Notification Actions
      // ========================================================================

      load_notifications: async () => {
        const { authentication_state } = get();
        const token = authentication_state.auth_token;

        if (!token) {
          return;
        }

        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/notifications`,
            { 
              headers: get_auth_headers(token),
              params: { limit: 50 }
            }
          );

          const { notifications, unread_count } = response.data;

          set(() => ({
            notification_state: {
              unread_count: unread_count || 0,
              notifications: notifications || [],
              last_fetched: new Date().toISOString(),
            },
          }));
        } catch (error) {
          console.error('Failed to load notifications:', error);
        }
      },

      mark_notification_read: async (notification_id: string) => {
        const { authentication_state } = get();
        const token = authentication_state.auth_token;

        if (!token) {
          return;
        }

        try {
          await axios.patch(
            `${API_BASE_URL}/api/notifications/${notification_id}`,
            {},
            { headers: get_auth_headers(token) }
          );

          // Update local state
          set((state) => ({
            notification_state: {
              ...state.notification_state,
              notifications: state.notification_state.notifications.map(n =>
                n.notification_id === notification_id
                  ? { ...n, is_read: true }
                  : n
              ),
              unread_count: Math.max(0, state.notification_state.unread_count - 1),
            },
          }));
        } catch (error) {
          console.error('Failed to mark notification read:', error);
        }
      },

      mark_all_notifications_read: async () => {
        const { authentication_state } = get();
        const token = authentication_state.auth_token;

        if (!token) {
          return;
        }

        try {
          await axios.post(
            `${API_BASE_URL}/api/notifications/mark-all-read`,
            {},
            { headers: get_auth_headers(token) }
          );

          // Update local state
          set((state) => ({
            notification_state: {
              ...state.notification_state,
              notifications: state.notification_state.notifications.map(n => ({
                ...n,
                is_read: true,
              })),
              unread_count: 0,
            },
          }));
        } catch (error) {
          console.error('Failed to mark all notifications read:', error);
        }
      },

      // ========================================================================
      // Messaging Actions
      // ========================================================================

      load_conversations: async () => {
        const { authentication_state } = get();
        const token = authentication_state.auth_token;

        if (!token) {
          return;
        }

        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/conversations`,
            { headers: get_auth_headers(token) }
          );

          const conversations = response.data;

          // Calculate unread count
          const unread_count = conversations.filter((c: any) => c.is_unread).length;

          set((state) => ({
            messaging_state: {
              ...state.messaging_state,
              conversations: conversations.map((c: any) => ({
                conversation_id: c.conversation_id,
                partner_id: c.participant_1_id === authentication_state.current_user?.user_id 
                  ? c.participant_2_id 
                  : c.participant_1_id,
                partner_name: c.participant_1_id === authentication_state.current_user?.user_id
                  ? c.participant_2_name
                  : c.participant_1_name,
                partner_avatar: c.participant_1_id === authentication_state.current_user?.user_id
                  ? c.participant_2_photo
                  : c.participant_1_photo,
                partner_type: 'customer', // Would need proper detection
                last_message_preview: '', // Would need from messages
                last_message_timestamp: c.last_message_at || c.created_at,
                is_unread: false, // Would need proper detection
                related_order_id: c.related_order_id,
                related_product_id: c.related_product_id,
              })),
              unread_message_count: unread_count,
              last_fetched: new Date().toISOString(),
            },
          }));
        } catch (error) {
          console.error('Failed to load conversations:', error);
        }
      },

      set_active_conversation: (conversation_id: string | null) => {
        set((state) => ({
          messaging_state: {
            ...state.messaging_state,
            active_conversation_id: conversation_id,
          },
        }));
      },

      // ========================================================================
      // Location Actions
      // ========================================================================

      set_user_location: (location: Partial<UserLocationState>) => {
        set((state) => ({
          user_location_state: {
            ...state.user_location_state,
            ...location,
            is_location_set: true,
          },
        }));
      },

      // ========================================================================
      // UI Actions
      // ========================================================================

      toggle_cart_sidebar: () => {
        set((state) => ({
          ui_state: {
            ...state.ui_state,
            is_cart_sidebar_open: !state.ui_state.is_cart_sidebar_open,
          },
        }));
      },

      toggle_messaging_panel: () => {
        set((state) => ({
          ui_state: {
            ...state.ui_state,
            is_messaging_panel_open: !state.ui_state.is_messaging_panel_open,
          },
        }));
      },

      toggle_notification_dropdown: () => {
        set((state) => ({
          ui_state: {
            ...state.ui_state,
            is_notification_dropdown_open: !state.ui_state.is_notification_dropdown_open,
          },
        }));
      },

      toggle_mobile_menu: () => {
        set((state) => ({
          ui_state: {
            ...state.ui_state,
            is_mobile_menu_open: !state.ui_state.is_mobile_menu_open,
          },
        }));
      },

      set_active_modal: (modal: string | null) => {
        set((state) => ({
          ui_state: {
            ...state.ui_state,
            active_modal: modal,
          },
        }));
      },

      set_loading: (loading: boolean) => {
        set((state) => ({
          ui_state: {
            ...state.ui_state,
            is_loading: loading,
          },
        }));
      },

      // ========================================================================
      // WebSocket Actions
      // ========================================================================

      connect_websocket: () => {
        const { authentication_state, websocket_connection } = get();
        const token = authentication_state.auth_token;
        const user = authentication_state.current_user;

        // Don't connect if not authenticated
        if (!token || !user) {
          return;
        }

        // Don't reconnect if already connected
        if (websocket_connection.socket?.connected) {
          return;
        }

        try {
          const socket = io(WS_BASE_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 5000,
            reconnectionAttempts: 5,
          });

          socket.on('connect', () => {
            console.log('WebSocket connected');
            set(() => ({
              websocket_connection: {
                socket,
                is_connected: true,
                connection_id: socket.id || null,
              },
            }));

            // Subscribe to user-specific channel
            socket.emit('subscribe:user', { user_id: user.user_id });
          });

          socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            set((state) => ({
              websocket_connection: {
                ...state.websocket_connection,
                is_connected: false,
              },
            }));
          });

          // Handle realtime events
          socket.on('order:status_changed', (data: any) => {
            // Add notification for order status change
            set((state) => ({
              notification_state: {
                ...state.notification_state,
                notifications: [
                  {
                    notification_id: `notif_${Date.now()}`,
                    notification_type: 'order_update',
                    title: 'Order status updated',
                    message: data.message || `Order ${data.order_number} status: ${data.new_status}`,
                    created_at: data.timestamp || new Date().toISOString(),
                    is_read: false,
                    related_entity_type: 'order',
                    related_entity_id: data.order_id,
                    action_url: `/account/orders/${data.order_id}`,
                    icon_type: 'package',
                  },
                  ...state.notification_state.notifications,
                ],
                unread_count: state.notification_state.unread_count + 1,
              },
            }));
          });

          socket.on('message:new', (data: any) => {
            // Update messaging state
            set((state) => ({
              messaging_state: {
                ...state.messaging_state,
                unread_message_count: state.messaging_state.unread_message_count + 1,
              },
              notification_state: {
                ...state.notification_state,
                notifications: [
                  {
                    notification_id: `notif_${Date.now()}`,
                    notification_type: 'message',
                    title: 'New message',
                    message: `${data.sender_name}: ${data.message_text?.substring(0, 50) || ''}`,
                    created_at: data.sent_at || new Date().toISOString(),
                    is_read: false,
                    related_entity_type: 'message',
                    related_entity_id: data.message_id,
                    action_url: `/messages/${data.conversation_id}`,
                    icon_type: 'message',
                  },
                  ...state.notification_state.notifications,
                ],
                unread_count: state.notification_state.unread_count + 1,
              },
            }));
          });

          socket.on('inventory:updated', (data: any) => {
            // Update cart items if affected product is in cart
            set((state) => {
              const updated_items = state.shopping_cart_state.items.map(item => {
                if (item.product_id === data.product_id) {
                  return {
                    ...item,
                    availability_status: data.availability,
                    stock_remaining: data.quantity_on_hand,
                  };
                }
                return item;
              });

              return {
                shopping_cart_state: {
                  ...state.shopping_cart_state,
                  items: updated_items,
                },
              };
            });
          });

          socket.on('cart:updated', async () => {
            // Cart updated from another device, reload
            await get().load_cart();
          });

          socket.on('notification:new', (data: any) => {
            set((state) => ({
              notification_state: {
                ...state.notification_state,
                notifications: [data, ...state.notification_state.notifications],
                unread_count: state.notification_state.unread_count + 1,
              },
            }));
          });

          set(() => ({
            websocket_connection: {
              socket,
              is_connected: socket.connected,
              connection_id: socket.id || null,
            },
          }));
        } catch (error) {
          console.error('WebSocket connection error:', error);
        }
      },

      disconnect_websocket: () => {
        const { websocket_connection } = get();
        
        if (websocket_connection.socket) {
          websocket_connection.socket.disconnect();
        }

        set({
          websocket_connection: {
            socket: null,
            is_connected: false,
            connection_id: null,
          },
        });
      },
    }),
    {
      name: 'buildeasy-app-storage',
      // CRITICAL: Only persist essential data to avoid issues
      partialize: (state) => ({
        authentication_state: {
          current_user: state.authentication_state.current_user,
          auth_token: state.authentication_state.auth_token,
          authentication_status: {
            is_authenticated: state.authentication_state.authentication_status.is_authenticated,
            is_loading: false, // Never persist loading state
            is_verifying: false,
          },
          error_message: null, // Never persist errors
        },
        shopping_cart_state: state.shopping_cart_state,
        user_location_state: state.user_location_state,
        // DO NOT persist: notifications, messaging, UI state, WebSocket
      }),
    }
  )
);

// Types are already exported via export interface above
// No need to re-export them here