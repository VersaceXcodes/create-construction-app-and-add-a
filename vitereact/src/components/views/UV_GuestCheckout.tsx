import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

// ============================================================================
// Type Definitions
// ============================================================================

interface DeliveryAddress {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface CardDetails {
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  cardholder_name: string;
}

interface ValidationErrors {
  guest_email: string | null;
  guest_phone: string | null;
  guest_name: string | null;
  delivery_address: string | null;
  payment_method: string | null;
  card_number: string | null;
  card_expiry: string | null;
  card_cvv: string | null;
  terms_accepted: string | null;
}

interface DeliveryWindow {
  window_id: string;
  type: 'same_day' | 'next_day' | 'standard';
  date: string;
  start_time: string;
  end_time: string;
  cost: number;
}

interface SupplierDeliveryOptions {
  supplier_id: string;
  supplier_name: string;
  items: any[];
  available_windows: DeliveryWindow[];
  selected_window: DeliveryWindow | null;
  pickup_available: boolean;
  pickup_address: string | null;
  delivery_method: 'delivery' | 'pickup';
}

// ============================================================================
// Helper Functions
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

const validatePostalCode = (code: string): boolean => {
  const usZipRegex = /^\d{5}(-\d{4})?$/;
  return usZipRegex.test(code);
};

const validateCardNumber = (number: string): boolean => {
  // Luhn algorithm for card validation
  const cleaned = number.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

const getCardType = (number: string): string => {
  const cleaned = number.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';
  return 'unknown';
};

const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ');
};

// Mock delivery windows generator (until backend endpoint available)
const generateMockDeliveryWindows = (supplierId: string): DeliveryWindow[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const twoDaysLater = new Date();
  twoDaysLater.setDate(twoDaysLater.getDate() + 2);

  return [
    {
      window_id: `${supplierId}_same_day`,
      type: 'same_day',
      date: new Date().toISOString().split('T')[0],
      start_time: '16:00',
      end_time: '18:00',
      cost: 25.00,
    },
    {
      window_id: `${supplierId}_next_day`,
      type: 'next_day',
      date: tomorrow.toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '12:00',
      cost: 15.00,
    },
    {
      window_id: `${supplierId}_standard`,
      type: 'standard',
      date: twoDaysLater.toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '17:00',
      cost: 0,
    },
  ];
};

// ============================================================================
// Main Component
// ============================================================================

const UV_GuestCheckout: React.FC = () => {
  const navigate = useNavigate();

  // ========================================================================
  // CRITICAL: Individual Zustand selectors (no object destructuring)
  // ========================================================================
  const cartItems = useAppStore(state => state.shopping_cart_state.items);
  const cartMetadata = useAppStore(state => state.shopping_cart_state.cart_metadata);
  const savedPromoCode = useAppStore(state => state.shopping_cart_state.promo_code);
  const userLocation = useAppStore(state => state.user_location_state);
  const clearCart = useAppStore(state => state.clear_cart);

  // ========================================================================
  // Local State
  // ========================================================================
  const [currentSection, setCurrentSection] = useState(1);
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  // Contact Information (Section 1)
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [smsUpdates, setSmsUpdates] = useState(true);

  // Delivery Information (Section 2)
  const [guestName, setGuestName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: userLocation.postal_code || '',
    country: 'USA',
  });
  const [deliveryContactName, setDeliveryContactName] = useState('');
  const [deliveryContactPhone, setDeliveryContactPhone] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [saveAddress, setSaveAddress] = useState(true);

  // Delivery Options (Section 3) - Per supplier
  const [supplierDeliveryOptions, setSupplierDeliveryOptions] = useState<Record<string, SupplierDeliveryOptions>>({});

  // Payment (Section 4)
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'pay_on_delivery'>('credit_card');
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    cardholder_name: '',
  });
  const [billingAddressSameAsDelivery, setBillingAddressSameAsDelivery] = useState(true);

  // Review & Submit (Section 5)
  const [promoCode, setPromoCode] = useState(savedPromoCode?.code || '');
  const [promoApplying, setPromoApplying] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Post-order account creation
  const [createAccountAfter, setCreateAccountAfter] = useState(false);
  const [createAccountPassword, setCreateAccountPassword] = useState('');

  // Submission state
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [_paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    guest_email: null,
    guest_phone: null,
    guest_name: null,
    delivery_address: null,
    payment_method: null,
    card_number: null,
    card_expiry: null,
    card_cvv: null,
    terms_accepted: null,
  });

  // ========================================================================
  // Calculated Order Summary
  // ========================================================================
  const orderSummary = useMemo(() => {
    const subtotal = cartMetadata.subtotal;
    
    // Calculate total delivery cost from all suppliers
    const deliveryCost = Object.values(supplierDeliveryOptions).reduce(
      (sum, supplier) => {
        if (supplier.delivery_method === 'pickup') return sum;
        return sum + (supplier.selected_window?.cost || 0);
      },
      0
    );

    // Calculate tax (assuming 8.875% - would come from backend in production)
    const taxRate = 0.08875;
    const taxAmount = (subtotal + deliveryCost) * taxRate;

    // Apply discount if promo code is active
    const discountAmount = savedPromoCode?.discount_amount || 0;

    const total = subtotal + deliveryCost + taxAmount - discountAmount;

    return {
      subtotal,
      delivery_cost: deliveryCost,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total_amount: total,
    };
  }, [cartMetadata.subtotal, supplierDeliveryOptions, savedPromoCode]);

  // ========================================================================
  // Initialize Supplier Delivery Options
  // ========================================================================
  useEffect(() => {
    if (cartItems.length === 0) return;

    // Group cart items by supplier
    const supplierGroups = cartItems.reduce((acc, item) => {
      if (!acc[item.supplier_id]) {
        acc[item.supplier_id] = {
          supplier_id: item.supplier_id,
          supplier_name: item.supplier_name,
          items: [],
        };
      }
      acc[item.supplier_id].items.push(item);
      return acc;
    }, {} as Record<string, { supplier_id: string; supplier_name: string; items: any[] }>);

    // Initialize delivery options for each supplier
    const initialOptions: Record<string, SupplierDeliveryOptions> = {};
    
    Object.values(supplierGroups).forEach(group => {
      const windows = generateMockDeliveryWindows(group.supplier_id);
      initialOptions[group.supplier_id] = {
        supplier_id: group.supplier_id,
        supplier_name: group.supplier_name,
        items: group.items,
        available_windows: windows,
        selected_window: windows.find(w => w.type === 'standard') || windows[0],
        pickup_available: true,
        pickup_address: '123 Supplier St, City, ST 12345',
        delivery_method: 'delivery',
      };
    });

    setSupplierDeliveryOptions(initialOptions);
  }, [cartItems]);

  // ========================================================================
  // Redirect if cart is empty
  // ========================================================================
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems.length, navigate]);

  // ========================================================================
  // Validation Functions
  // ========================================================================
  const validateSection1 = useCallback((): boolean => {
    const errors: Partial<ValidationErrors> = {};
    
    if (!guestEmail) {
      errors.guest_email = 'Email is required';
    } else if (!validateEmail(guestEmail)) {
      errors.guest_email = 'Please enter a valid email address';
    }

    if (!guestPhone) {
      errors.guest_phone = 'Phone number is required';
    } else if (!validatePhone(guestPhone)) {
      errors.guest_phone = 'Please enter a valid phone number (minimum 10 digits)';
    }

    setValidationErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  }, [guestEmail, guestPhone]);

  const validateSection2 = useCallback((): boolean => {
    const errors: Partial<ValidationErrors> = {};

    if (!guestName.trim()) {
      errors.guest_name = 'Full name is required';
    }

    if (!deliveryAddress.address_line_1.trim()) {
      errors.delivery_address = 'Street address is required';
    } else if (!deliveryAddress.city.trim()) {
      errors.delivery_address = 'City is required';
    } else if (!deliveryAddress.state) {
      errors.delivery_address = 'State is required';
    } else if (!deliveryAddress.postal_code) {
      errors.delivery_address = 'Postal code is required';
    } else if (!validatePostalCode(deliveryAddress.postal_code)) {
      errors.delivery_address = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
    }

    setValidationErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  }, [guestName, deliveryAddress]);

  const validateSection4 = useCallback((): boolean => {
    const errors: Partial<ValidationErrors> = {};

    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      if (!cardDetails.card_number) {
        errors.card_number = 'Card number is required';
      } else if (!validateCardNumber(cardDetails.card_number.replace(/\s/g, ''))) {
        errors.card_number = 'Please enter a valid card number';
      }

      if (!cardDetails.expiry_month || !cardDetails.expiry_year) {
        errors.card_expiry = 'Expiry date is required';
      } else {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const expiryYear = parseInt(cardDetails.expiry_year);
        const expiryMonth = parseInt(cardDetails.expiry_month);
        
        if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
          errors.card_expiry = 'Card has expired';
        }
      }

      if (!cardDetails.cvv) {
        errors.card_cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
        errors.card_cvv = 'CVV must be 3-4 digits';
      }

      if (!cardDetails.cardholder_name.trim()) {
        errors.payment_method = 'Cardholder name is required';
      }
    }

    setValidationErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  }, [paymentMethod, cardDetails]);

  // ========================================================================
  // Section Completion Handlers
  // ========================================================================
  const completeSection = (section: number) => {
    if (!completedSections.includes(section)) {
      setCompletedSections(prev => [...prev, section]);
    }
    
    // Auto-advance to next section
    if (section < 5) {
      setCurrentSection(section + 1);
      
      // Smooth scroll to next section
      setTimeout(() => {
        const nextSectionElement = document.getElementById(`section-${section + 1}`);
        nextSectionElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleSection1Continue = () => {
    if (validateSection1()) {
      completeSection(1);
    }
  };

  const handleSection2Continue = () => {
    if (validateSection2()) {
      completeSection(2);
      // TODO: Trigger delivery options fetch when backend endpoint available
    }
  };

  const handleSection3Continue = () => {
    // Validate at least one delivery option selected per supplier
    const allSelected = Object.values(supplierDeliveryOptions).every(
      supplier => supplier.selected_window !== null || supplier.delivery_method === 'pickup'
    );
    
    if (allSelected) {
      completeSection(3);
    }
  };

  const handleSection4Continue = () => {
    if (validateSection4()) {
      completeSection(4);
    }
  };

  // ========================================================================
  // Order Submission
  // ========================================================================
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await axios.post(
        `${API_BASE_URL}/api/orders`,
        orderData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Clear cart
      clearCart();
      
      // Redirect to order confirmation
      navigate(`/order-confirmation/${data.order_id}`, {
        state: {
          orderNumber: data.order_number,
          trackingToken: data.tracking_token,
          canCreateAccount: createAccountAfter,
          guestEmail: guestEmail,
          guestName: guestName,
        }
      });
    },
    onError: (error: any) => {
      setOrderError(error.response?.data?.error || error.message || 'Failed to create order');
      setSubmittingOrder(false);
      setPaymentProcessing(false);
    },
  });

  const handlePlaceOrder = async () => {
    // Final validation
    if (!termsAccepted) {
      setValidationErrors(prev => ({ 
        ...prev, 
        terms_accepted: 'You must accept the terms and conditions' 
      }));
      return;
    }

    if (!validateSection1() || !validateSection2() || !validateSection4()) {
      setOrderError('Please complete all required fields');
      return;
    }

    setSubmittingOrder(true);
    setPaymentProcessing(true);
    setOrderError(null);

    // In production, tokenize card with Stripe here
    // const { token, error } = await stripe.createToken(cardElement);
    
    // For now, proceed with order creation
    // Note: Backend should handle payment processing
    
    // Prepare order items from cart
    const orderItems = cartItems.map(item => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      product_name: item.product_name,
      sku: `SKU-${item.product_id}`,
    }));

    // Get first supplier (in multi-supplier scenario, would create multiple orders)
    const firstSupplier = Object.values(supplierDeliveryOptions)[0];
    const selectedWindow = firstSupplier?.selected_window;

    // Calculate platform fee (assume 10% commission)
    const platformFee = orderSummary.subtotal * 0.10;
    const supplierPayout = orderSummary.total_amount - platformFee;

    const orderData = {
      customer_id: 'guest', // Special guest marker
      supplier_id: firstSupplier?.supplier_id || cartItems[0]?.supplier_id,
      project_id: null,
      delivery_address_id: null, // Guest doesn't have saved addresses
      billing_address_id: null,
      delivery_contact_name: deliveryContactName || guestName,
      delivery_contact_phone: deliveryContactPhone || guestPhone,
      delivery_instructions: deliveryInstructions || null,
      delivery_window_start: selectedWindow ? `${selectedWindow.date}T${selectedWindow.start_time}` : null,
      delivery_window_end: selectedWindow ? `${selectedWindow.date}T${selectedWindow.end_time}` : null,
      delivery_method: firstSupplier?.delivery_method || 'standard_delivery',
      payment_method: paymentMethod,
      payment_method_id: null,
      subtotal: orderSummary.subtotal,
      delivery_cost: orderSummary.delivery_cost,
      tax_amount: orderSummary.tax_amount,
      discount_amount: orderSummary.discount_amount,
      promo_code: savedPromoCode?.code || null,
      total_amount: orderSummary.total_amount,
      currency: 'USD',
      platform_fee: platformFee,
      supplier_payout_amount: supplierPayout,
      is_guest_order: true,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      placed_by: 'guest',
      requires_approval: false,
      notes: null,
      items: orderItems,
    };

    createOrderMutation.mutate(orderData);
  };

  // ========================================================================
  // Render Helpers
  // ========================================================================
  const renderProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex items-center relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  completedSections.includes(step)
                    ? 'bg-green-500 text-white'
                    : currentSection === step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {completedSections.includes(step) ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {step < 5 && (
                <div
                  className={`h-1 w-full transition-colors ${
                    completedSections.includes(step) ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between max-w-3xl mx-auto mt-2 text-xs text-gray-600">
        <span>Contact</span>
        <span>Delivery</span>
        <span>Options</span>
        <span>Payment</span>
        <span>Review</span>
      </div>
    </div>
  );

  const renderSection1 = () => (
    <div id="section-1" className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-6">
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold mr-3">
          1
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="guest-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="guest-email"
            type="email"
            value={guestEmail}
            onChange={(e) => {
              setGuestEmail(e.target.value);
              setValidationErrors(prev => ({ ...prev, guest_email: null }));
            }}
            onBlur={() => {
              if (guestEmail && !validateEmail(guestEmail)) {
                setValidationErrors(prev => ({ 
                  ...prev, 
                  guest_email: 'Please enter a valid email address' 
                }));
              }
            }}
            placeholder="your@email.com"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 transition-all ${
              validationErrors.guest_email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            }`}
          />
          {validationErrors.guest_email && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {validationErrors.guest_email}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Order confirmation and tracking information will be sent here
          </p>
        </div>

        <div>
          <label htmlFor="guest-phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="guest-phone"
            type="tel"
            value={guestPhone}
            onChange={(e) => {
              setGuestPhone(e.target.value);
              setValidationErrors(prev => ({ ...prev, guest_phone: null }));
            }}
            onBlur={() => {
              if (guestPhone && !validatePhone(guestPhone)) {
                setValidationErrors(prev => ({ 
                  ...prev, 
                  guest_phone: 'Please enter a valid phone number' 
                }));
              }
            }}
            placeholder="+1 (555) 123-4567"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 transition-all ${
              validationErrors.guest_phone
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            }`}
          />
          {validationErrors.guest_phone && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {validationErrors.guest_phone}
            </p>
          )}
        </div>

        <div className="flex items-start">
          <input
            id="sms-updates"
            type="checkbox"
            checked={smsUpdates}
            onChange={(e) => setSmsUpdates(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="sms-updates" className="ml-2 block text-sm text-gray-700">
            Send me order updates via SMS
          </label>
        </div>
      </div>

      <button
        onClick={handleSection1Continue}
        className="mt-6 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-100"
      >
        Continue to Delivery
      </button>
    </div>
  );

  const renderSection2 = () => {
    const isExpanded = currentSection >= 2;
    const isCompleted = completedSections.includes(2);

    if (!isExpanded && !isCompleted) return null;

    return (
      <div id="section-2" className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-6">
        <div className="flex items-center mb-6">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold mr-3 ${
            isCompleted ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
          }`}>
            {isCompleted ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              '2'
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Delivery Information</h2>
          {isCompleted && (
            <button
              onClick={() => setCurrentSection(2)}
              className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Edit
            </button>
          )}
        </div>

        {(currentSection === 2 || !isCompleted) && (
          <>
            <div className="space-y-4">
              <div>
                <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="guest-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    setValidationErrors(prev => ({ ...prev, guest_name: null }));
                  }}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 transition-all ${
                    validationErrors.guest_name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
                {validationErrors.guest_name && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {validationErrors.guest_name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="address-line-1" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="address-line-1"
                  type="text"
                  value={deliveryAddress.address_line_1}
                  onChange={(e) => {
                    setDeliveryAddress(prev => ({ ...prev, address_line_1: e.target.value }));
                    setValidationErrors(prev => ({ ...prev, delivery_address: null }));
                  }}
                  placeholder="123 Main Street"
                  autoComplete="address-line1"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="address-line-2" className="block text-sm font-medium text-gray-700 mb-1">
                  Apartment, Suite, etc. (Optional)
                </label>
                <input
                  id="address-line-2"
                  type="text"
                  value={deliveryAddress.address_line_2}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                  placeholder="Apt 4B"
                  autoComplete="address-line2"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={deliveryAddress.city}
                    onChange={(e) => {
                      setDeliveryAddress(prev => ({ ...prev, city: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, delivery_address: null }));
                    }}
                    placeholder="New York"
                    autoComplete="address-level2"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="state"
                    value={deliveryAddress.state}
                    onChange={(e) => {
                      setDeliveryAddress(prev => ({ ...prev, state: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, delivery_address: null }));
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select State</option>
                    <option value="NY">New York</option>
                    <option value="CA">California</option>
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                    {/* Add more states as needed */}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="postal-code"
                    type="text"
                    value={deliveryAddress.postal_code}
                    onChange={(e) => {
                      setDeliveryAddress(prev => ({ ...prev, postal_code: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, delivery_address: null }));
                    }}
                    onBlur={() => {
                      if (deliveryAddress.postal_code && !validatePostalCode(deliveryAddress.postal_code)) {
                        setValidationErrors(prev => ({ 
                          ...prev, 
                          delivery_address: 'Invalid ZIP code format' 
                        }));
                      }
                    }}
                    placeholder="12345"
                    autoComplete="postal-code"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="country"
                    value={deliveryAddress.country}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="USA">United States</option>
                    <option value="CAN">Canada</option>
                  </select>
                </div>
              </div>

              {validationErrors.delivery_address && (
                <p className="text-sm text-red-600" role="alert">
                  {validationErrors.delivery_address}
                </p>
              )}

              <div>
                <label htmlFor="delivery-instructions" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  id="delivery-instructions"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value.slice(0, 200))}
                  placeholder="Gate code, parking instructions, etc."
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {deliveryInstructions.length}/200 characters
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">On-site Contact (Optional)</p>
                <p className="text-xs text-gray-500 mb-3">
                  Useful for deliveries to job sites or offices
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={deliveryContactName}
                      onChange={(e) => setDeliveryContactName(e.target.value)}
                      placeholder="Site Manager Name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={deliveryContactPhone}
                      onChange={(e) => setDeliveryContactPhone(e.target.value)}
                      placeholder="+1 (555) 987-6543"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  id="save-address"
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="save-address" className="ml-2 block text-sm text-gray-700">
                  Save this address to my account (if I create one later)
                </label>
              </div>
            </div>

            <button
              onClick={handleSection2Continue}
              className="mt-6 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Continue to Delivery Options
            </button>
          </>
        )}

        {isCompleted && currentSection !== 2 && (
          <div className="text-sm text-gray-600">
            <p>
              <strong>Delivering to:</strong> {guestName}
            </p>
            <p>{deliveryAddress.address_line_1}</p>
            {deliveryAddress.address_line_2 && <p>{deliveryAddress.address_line_2}</p>}
            <p>
              {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.postal_code}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderSection3 = () => {
    const isExpanded = currentSection >= 3;
    const isCompleted = completedSections.includes(3);

    if (!isExpanded && !isCompleted) return null;

    return (
      <div id="section-3" className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-6">
        <div className="flex items-center mb-6">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold mr-3 ${
            isCompleted ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
          }`}>
            {isCompleted ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              '3'
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Delivery Options</h2>
          {isCompleted && (
            <button
              onClick={() => setCurrentSection(3)}
              className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Edit
            </button>
          )}
        </div>

        {(currentSection === 3 || !isCompleted) && (
          <>
            <div className="space-y-6">
              {Object.values(supplierDeliveryOptions).map((supplier) => (
                <div key={supplier.supplier_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{supplier.supplier_name}</h3>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {supplier.items.length} {supplier.items.length === 1 ? 'item' : 'items'} from this supplier
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {supplier.items.slice(0, 3).map((item) => (
                        <div key={item.cart_item_id} className="flex items-center space-x-2 bg-gray-50 rounded px-2 py-1">
                          {item.product_image && (
                            <img src={item.product_image} alt="" className="w-8 h-8 object-cover rounded" />
                          )}
                          <span className="text-xs text-gray-700">{item.product_name}</span>
                        </div>
                      ))}
                      {supplier.items.length > 3 && (
                        <span className="text-xs text-gray-500">+{supplier.items.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {supplier.available_windows.map((window) => (
                      <label
                        key={window.window_id}
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          supplier.selected_window?.window_id === window.window_id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`delivery-${supplier.supplier_id}`}
                          checked={supplier.selected_window?.window_id === window.window_id}
                          onChange={() => {
                            setSupplierDeliveryOptions(prev => ({
                              ...prev,
                              [supplier.supplier_id]: {
                                ...prev[supplier.supplier_id],
                                selected_window: window,
                                delivery_method: 'delivery',
                              },
                            }));
                          }}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {window.type === 'same_day' && 'Same-Day Delivery'}
                                {window.type === 'next_day' && 'Next-Day Delivery'}
                                {window.type === 'standard' && 'Standard Delivery'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {window.date} • {window.start_time} - {window.end_time}
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900">
                              {window.cost === 0 ? 'FREE' : `$${window.cost.toFixed(2)}`}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}

                    {supplier.pickup_available && (
                      <label
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          supplier.delivery_method === 'pickup'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`delivery-${supplier.supplier_id}`}
                          checked={supplier.delivery_method === 'pickup'}
                          onChange={() => {
                            setSupplierDeliveryOptions(prev => ({
                              ...prev,
                              [supplier.supplier_id]: {
                                ...prev[supplier.supplier_id],
                                selected_window: null,
                                delivery_method: 'pickup',
                              },
                            }));
                          }}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Pickup at Store</p>
                              <p className="text-sm text-gray-600">{supplier.pickup_address}</p>
                              <p className="text-xs text-blue-600 mt-1">Ready in 2 hours</p>
                            </div>
                            <p className="font-semibold text-gray-900">FREE</p>
                          </div>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSection3Continue}
              className="mt-6 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Continue to Payment
            </button>
          </>
        )}
      </div>
    );
  };

  const renderSection4 = () => {
    const isExpanded = currentSection >= 4;
    const isCompleted = completedSections.includes(4);

    if (!isExpanded && !isCompleted) return null;

    return (
      <div id="section-4" className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-6">
        <div className="flex items-center mb-6">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold mr-3 ${
            isCompleted ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
          }`}>
            {isCompleted ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              '4'
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
          {isCompleted && (
            <button
              onClick={() => setCurrentSection(4)}
              className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Edit
            </button>
          )}
        </div>

        {(currentSection === 4 || !isCompleted) && (
          <>
            <div className="space-y-6">
              {/* Payment Method Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-gray-200">
                <button
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`px-4 py-2 font-medium transition-all ${
                    paymentMethod === 'credit_card' || paymentMethod === 'debit_card'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Credit/Debit Card
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`px-4 py-2 font-medium transition-all ${
                    paymentMethod === 'paypal'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  PayPal
                </button>
                <button
                  onClick={() => setPaymentMethod('pay_on_delivery')}
                  className={`px-4 py-2 font-medium transition-all ${
                    paymentMethod === 'pay_on_delivery'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pay on Delivery
                </button>
              </div>

              {/* Card Payment Form */}
              {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="card-number"
                        type="text"
                        value={cardDetails.card_number}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value.replace(/\D/g, ''));
                          setCardDetails(prev => ({ ...prev, card_number: formatted }));
                          setValidationErrors(prev => ({ ...prev, card_number: null }));
                        }}
                        onBlur={() => {
                          if (cardDetails.card_number && !validateCardNumber(cardDetails.card_number.replace(/\s/g, ''))) {
                            setValidationErrors(prev => ({ 
                              ...prev, 
                              card_number: 'Invalid card number' 
                            }));
                          }
                        }}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 transition-all ${
                          validationErrors.card_number
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                        }`}
                      />
                      {cardDetails.card_number && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="text-xs text-gray-500 uppercase">{getCardType(cardDetails.card_number)}</span>
                        </div>
                      )}
                    </div>
                    {validationErrors.card_number && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {validationErrors.card_number}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="card-expiry" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-2">
                        <select
                          id="expiry-month"
                          value={cardDetails.expiry_month}
                          onChange={(e) => {
                            setCardDetails(prev => ({ ...prev, expiry_month: e.target.value }));
                            setValidationErrors(prev => ({ ...prev, card_expiry: null }));
                          }}
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                          <option value="">MM</option>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month.toString().padStart(2, '0')}>
                              {month.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        <select
                          id="expiry-year"
                          value={cardDetails.expiry_year}
                          onChange={(e) => {
                            setCardDetails(prev => ({ ...prev, expiry_year: e.target.value }));
                            setValidationErrors(prev => ({ ...prev, card_expiry: null }));
                          }}
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                          <option value="">YYYY</option>
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      {validationErrors.card_expiry && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                          {validationErrors.card_expiry}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="card-cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="card-cvv"
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setCardDetails(prev => ({ ...prev, cvv: value }));
                          setValidationErrors(prev => ({ ...prev, card_cvv: null }));
                        }}
                        placeholder="123"
                        maxLength={4}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 transition-all ${
                          validationErrors.card_cvv
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                        }`}
                      />
                      {validationErrors.card_cvv && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                          {validationErrors.card_cvv}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">3-4 digit code on back of card</p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cardholder-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="cardholder-name"
                      type="text"
                      value={cardDetails.cardholder_name}
                      onChange={(e) => {
                        setCardDetails(prev => ({ ...prev, cardholder_name: e.target.value }));
                        setValidationErrors(prev => ({ ...prev, payment_method: null }));
                      }}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex items-start">
                    <input
                      id="billing-same"
                      type="checkbox"
                      checked={billingAddressSameAsDelivery}
                      onChange={(e) => setBillingAddressSameAsDelivery(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="billing-same" className="ml-2 block text-sm text-gray-700">
                      Billing address same as delivery address
                    </label>
                  </div>
                </div>
              )}

              {/* PayPal */}
              {paymentMethod === 'paypal' && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">You will be redirected to PayPal to complete your payment</p>
                  <button
                    type="button"
                    className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    Continue with PayPal
                  </button>
                </div>
              )}

              {/* Pay on Delivery */}
              {paymentMethod === 'pay_on_delivery' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Pay on Delivery:</strong> You can pay with cash or card when your order arrives.
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    Please have exact change or a card ready for the delivery driver.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleSection4Continue}
              className="mt-6 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Continue to Review Order
            </button>
          </>
        )}
      </div>
    );
  };

  const renderSection5 = () => {
    const isExpanded = currentSection >= 5;

    if (!isExpanded) return null;

    return (
      <div id="section-5" className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-6">
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold mr-3">
            5
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Review & Place Order</h2>
        </div>

        <div className="space-y-6">
          {/* Promo Code */}
          <div className="border border-gray-200 rounded-lg p-4">
            <button
              onClick={() => {}}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-medium text-gray-900">Have a promo code?</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className="mt-4 flex space-x-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoError(null);
                }}
                placeholder="Enter code"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <button
                onClick={() => {
                  // TODO: Apply promo code via API when available
                  setPromoApplying(true);
                  setTimeout(() => {
                    setPromoApplying(false);
                    setPromoError('Promo code feature coming soon');
                  }, 500);
                }}
                disabled={!promoCode || promoApplying}
                className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {promoApplying ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {promoError && (
              <p className="mt-2 text-sm text-red-600">{promoError}</p>
            )}
            {savedPromoCode && (
              <p className="mt-2 text-sm text-green-600">
                ✓ Code "{savedPromoCode.code}" applied - Saving ${savedPromoCode.discount_amount.toFixed(2)}
              </p>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start">
              <input
                id="terms-checkbox"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  setValidationErrors(prev => ({ ...prev, terms_accepted: null }));
                }}
                className={`mt-1 h-4 w-4 border-gray-300 rounded focus:ring-blue-500 ${
                  validationErrors.terms_accepted ? 'border-red-300' : 'text-blue-600'
                }`}
              />
              <label htmlFor="terms-checkbox" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                  Privacy Policy
                </Link>
                <span className="text-red-500"> *</span>
              </label>
            </div>
            {validationErrors.terms_accepted && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {validationErrors.terms_accepted}
              </p>
            )}
          </div>

          {/* Post-Order Account Creation Option */}
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-start mb-3">
              <input
                id="create-account"
                type="checkbox"
                checked={createAccountAfter}
                onChange={(e) => setCreateAccountAfter(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="create-account" className="ml-2 block text-sm font-medium text-blue-900">
                Create an account after checkout for easy tracking and faster future orders
              </label>
            </div>
            
            {createAccountAfter && (
              <div className="mt-3">
                <label htmlFor="account-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Choose a password
                </label>
                <input
                  id="account-password"
                  type="password"
                  value={createAccountPassword}
                  onChange={(e) => setCreateAccountPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-600">
                  Your email ({guestEmail}) will be used for login
                </p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {orderError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">Order Submission Failed</p>
                  <p className="text-sm text-red-700 mt-1">{orderError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={submittingOrder || !termsAccepted}
            className="w-full py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-100"
          >
            {submittingOrder ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Order...
              </span>
            ) : (
              `Place Order - $${orderSummary.total_amount.toFixed(2)}`
            )}
          </button>

          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Checkout
            </span>
            <span>•</span>
            <span>SSL Encrypted</span>
            <span>•</span>
            <span>Money-back Guarantee</span>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderSummary = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>

      {/* Items */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item.cart_item_id} className="flex items-center space-x-3">
            {item.product_image && (
              <img
                src={item.product_image}
                alt={item.product_name}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              ${item.subtotal.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900 font-medium">${orderSummary.subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery</span>
          <span className="text-gray-900 font-medium">
            {orderSummary.delivery_cost === 0 ? 'FREE' : `$${orderSummary.delivery_cost.toFixed(2)}`}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (estimated)</span>
          <span className="text-gray-900 font-medium">${orderSummary.tax_amount.toFixed(2)}</span>
        </div>
        
        {orderSummary.discount_amount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Discount</span>
            <span className="text-green-600 font-medium">-${orderSummary.discount_amount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-2 flex justify-between">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-lg font-bold text-gray-900">${orderSummary.total_amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-3 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Secure Payment</span>
        </div>
      </div>
    </div>
  );

  // ========================================================================
  // Main Render
  // ========================================================================
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Guest Checkout</h1>
            <p className="text-gray-600">Complete your order in just a few steps</p>
            
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Already have an account? Sign in
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create an account
              </Link>
            </div>
          </div>

          {/* Progress Indicator */}
          {renderProgressIndicator()}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Sections */}
            <div className="lg:col-span-2">
              {renderSection1()}
              {renderSection2()}
              {renderSection3()}
              {renderSection4()}
              {renderSection5()}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              {renderOrderSummary()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_GuestCheckout;