import { z } from 'zod';

// ============================================================================
// USERS SCHEMAS
// ============================================================================

export const userSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  phone: z.string(),
  password_hash: z.string(),
  name: z.string(),
  role: z.string(),
  account_type: z.string(),
  email_verified: z.boolean(),
  phone_verified: z.boolean(),
  profile_photo_url: z.string().nullable(),
  status: z.string(),
  last_login: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createUserInputSchema = z.object({
  email: z.string().email().max(255),
  phone: z.string().min(10).max(50),
  password_hash: z.string().min(8),
  name: z.string().min(1).max(255),
  role: z.enum(['customer', 'supplier', 'admin']).default('customer'),
  account_type: z.enum(['personal', 'business']).default('personal'),
  email_verified: z.boolean().default(false),
  phone_verified: z.boolean().default(false),
  profile_photo_url: z.string().url().nullable().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active')
});

export const updateUserInputSchema = z.object({
  user_id: z.string(),
  email: z.string().email().max(255).optional(),
  phone: z.string().min(10).max(50).optional(),
  password_hash: z.string().min(8).optional(),
  name: z.string().min(1).max(255).optional(),
  role: z.enum(['customer', 'supplier', 'admin']).optional(),
  account_type: z.enum(['personal', 'business']).optional(),
  email_verified: z.boolean().optional(),
  phone_verified: z.boolean().optional(),
  profile_photo_url: z.string().url().nullable().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  last_login: z.string().nullable().optional()
});

export const searchUsersInputSchema = z.object({
  query: z.string().optional(),
  role: z.enum(['customer', 'supplier', 'admin']).optional(),
  account_type: z.enum(['personal', 'business']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  email_verified: z.boolean().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['name', 'email', 'created_at', 'last_login']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersInputSchema>;

// ============================================================================
// ADDRESSES SCHEMAS
// ============================================================================

export const addressSchema = z.object({
  address_id: z.string(),
  user_id: z.string(),
  address_label: z.string().nullable(),
  address_line_1: z.string(),
  address_line_2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  country: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  is_default: z.boolean(),
  contact_name: z.string().nullable(),
  contact_phone: z.string().nullable(),
  delivery_instructions: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createAddressInputSchema = z.object({
  user_id: z.string(),
  address_label: z.string().max(255).nullable().optional(),
  address_line_1: z.string().min(1).max(500),
  address_line_2: z.string().max(500).nullable().optional(),
  city: z.string().min(1).max(255),
  state: z.string().min(2).max(255),
  postal_code: z.string().min(5).max(50),
  country: z.string().min(2).max(100).default('USA'),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  is_default: z.boolean().default(false),
  contact_name: z.string().max(255).nullable().optional(),
  contact_phone: z.string().max(50).nullable().optional(),
  delivery_instructions: z.string().max(1000).nullable().optional()
});

export const updateAddressInputSchema = z.object({
  address_id: z.string(),
  address_label: z.string().max(255).nullable().optional(),
  address_line_1: z.string().min(1).max(500).optional(),
  address_line_2: z.string().max(500).nullable().optional(),
  city: z.string().min(1).max(255).optional(),
  state: z.string().min(2).max(255).optional(),
  postal_code: z.string().min(5).max(50).optional(),
  country: z.string().min(2).max(100).optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  is_default: z.boolean().optional(),
  contact_name: z.string().max(255).nullable().optional(),
  contact_phone: z.string().max(50).nullable().optional(),
  delivery_instructions: z.string().max(1000).nullable().optional()
});

export const searchAddressesInputSchema = z.object({
  user_id: z.string(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  is_default: z.boolean().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type Address = z.infer<typeof addressSchema>;
export type CreateAddressInput = z.infer<typeof createAddressInputSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressInputSchema>;
export type SearchAddressesInput = z.infer<typeof searchAddressesInputSchema>;

// ============================================================================
// BUSINESS ACCOUNTS SCHEMAS
// ============================================================================

export const businessAccountSchema = z.object({
  business_account_id: z.string(),
  user_id: z.string(),
  company_name: z.string(),
  company_registration_number: z.string().nullable(),
  tax_id: z.string().nullable(),
  billing_address_id: z.string().nullable(),
  tax_exempt: z.boolean(),
  tax_exemption_document_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createBusinessAccountInputSchema = z.object({
  user_id: z.string(),
  company_name: z.string().min(1).max(255),
  company_registration_number: z.string().max(255).nullable().optional(),
  tax_id: z.string().max(255).nullable().optional(),
  billing_address_id: z.string().nullable().optional(),
  tax_exempt: z.boolean().default(false),
  tax_exemption_document_url: z.string().url().nullable().optional()
});

export const updateBusinessAccountInputSchema = z.object({
  business_account_id: z.string(),
  company_name: z.string().min(1).max(255).optional(),
  company_registration_number: z.string().max(255).nullable().optional(),
  tax_id: z.string().max(255).nullable().optional(),
  billing_address_id: z.string().nullable().optional(),
  tax_exempt: z.boolean().optional(),
  tax_exemption_document_url: z.string().url().nullable().optional()
});

export type BusinessAccount = z.infer<typeof businessAccountSchema>;
export type CreateBusinessAccountInput = z.infer<typeof createBusinessAccountInputSchema>;
export type UpdateBusinessAccountInput = z.infer<typeof updateBusinessAccountInputSchema>;

// ============================================================================
// SUPPLIERS SCHEMAS
// ============================================================================

export const supplierSchema = z.object({
  supplier_id: z.string(),
  user_id: z.string(),
  shop_name: z.string(),
  shop_slug: z.string(),
  shop_description: z.string().nullable(),
  shop_logo_url: z.string().nullable(),
  shop_cover_image_url: z.string().nullable(),
  business_address: z.string(),
  contact_email: z.string(),
  contact_phone: z.string(),
  website_url: z.string().nullable(),
  business_hours: z.any().nullable(), // JSONB
  holiday_schedule: z.any().nullable(), // JSONB
  about_section: z.string().nullable(),
  certifications: z.any().nullable(), // JSONB
  social_media_links: z.any().nullable(), // JSONB
  return_policy: z.string().nullable(),
  shipping_policy: z.string().nullable(),
  privacy_policy: z.string().nullable(),
  terms_and_conditions: z.string().nullable(),
  rating_average: z.number(),
  rating_count: z.number().int(),
  is_verified: z.boolean(),
  verification_date: z.string().nullable(),
  status: z.string(),
  commission_rate: z.number(),
  average_response_time_minutes: z.number().int().nullable(),
  on_time_delivery_percentage: z.number().nullable(),
  order_fulfillment_rate: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createSupplierInputSchema = z.object({
  user_id: z.string(),
  shop_name: z.string().min(1).max(255),
  shop_slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  shop_description: z.string().max(5000).nullable().optional(),
  shop_logo_url: z.string().url().nullable().optional(),
  shop_cover_image_url: z.string().url().nullable().optional(),
  business_address: z.string().min(1).max(1000),
  contact_email: z.string().email().max(255),
  contact_phone: z.string().min(10).max(50),
  website_url: z.string().url().nullable().optional(),
  business_hours: z.record(z.string()).nullable().optional(),
  holiday_schedule: z.array(z.string()).nullable().optional(),
  about_section: z.string().max(10000).nullable().optional(),
  certifications: z.array(z.string()).nullable().optional(),
  social_media_links: z.record(z.string().url()).nullable().optional(),
  return_policy: z.string().max(5000).nullable().optional(),
  shipping_policy: z.string().max(5000).nullable().optional(),
  privacy_policy: z.string().max(5000).nullable().optional(),
  terms_and_conditions: z.string().max(10000).nullable().optional(),
  commission_rate: z.number().min(0).max(100),
  status: z.enum(['pending', 'active', 'inactive', 'suspended']).default('pending')
});

export const updateSupplierInputSchema = z.object({
  supplier_id: z.string(),
  shop_name: z.string().min(1).max(255).optional(),
  shop_slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
  shop_description: z.string().max(5000).nullable().optional(),
  shop_logo_url: z.string().url().nullable().optional(),
  shop_cover_image_url: z.string().url().nullable().optional(),
  business_address: z.string().min(1).max(1000).optional(),
  contact_email: z.string().email().max(255).optional(),
  contact_phone: z.string().min(10).max(50).optional(),
  website_url: z.string().url().nullable().optional(),
  business_hours: z.record(z.string()).nullable().optional(),
  holiday_schedule: z.array(z.string()).nullable().optional(),
  about_section: z.string().max(10000).nullable().optional(),
  certifications: z.array(z.string()).nullable().optional(),
  social_media_links: z.record(z.string().url()).nullable().optional(),
  return_policy: z.string().max(5000).nullable().optional(),
  shipping_policy: z.string().max(5000).nullable().optional(),
  privacy_policy: z.string().max(5000).nullable().optional(),
  terms_and_conditions: z.string().max(10000).nullable().optional(),
  commission_rate: z.number().min(0).max(100).optional(),
  status: z.enum(['pending', 'active', 'inactive', 'suspended']).optional(),
  is_verified: z.boolean().optional(),
  verification_date: z.string().nullable().optional()
});

export const searchSuppliersInputSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['pending', 'active', 'inactive', 'suspended']).optional(),
  is_verified: z.boolean().optional(),
  min_rating: z.number().min(0).max(5).optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['shop_name', 'rating_average', 'created_at']).default('rating_average'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Supplier = z.infer<typeof supplierSchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierInputSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierInputSchema>;
export type SearchSuppliersInput = z.infer<typeof searchSuppliersInputSchema>;

// ============================================================================
// CATEGORIES SCHEMAS
// ============================================================================

export const categorySchema = z.object({
  category_id: z.string(),
  category_name: z.string(),
  category_slug: z.string(),
  parent_category_id: z.string().nullable(),
  category_description: z.string().nullable(),
  category_image_url: z.string().nullable(),
  display_order: z.number().int(),
  is_active: z.boolean(),
  category_attributes: z.any().nullable(), // JSONB
  created_at: z.string()
});

export const createCategoryInputSchema = z.object({
  category_name: z.string().min(1).max(255),
  category_slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  parent_category_id: z.string().nullable().optional(),
  category_description: z.string().max(5000).nullable().optional(),
  category_image_url: z.string().url().nullable().optional(),
  display_order: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true),
  category_attributes: z.record(z.any()).nullable().optional()
});

export const updateCategoryInputSchema = z.object({
  category_id: z.string(),
  category_name: z.string().min(1).max(255).optional(),
  category_slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
  parent_category_id: z.string().nullable().optional(),
  category_description: z.string().max(5000).nullable().optional(),
  category_image_url: z.string().url().nullable().optional(),
  display_order: z.number().int().nonnegative().optional(),
  is_active: z.boolean().optional(),
  category_attributes: z.record(z.any()).nullable().optional()
});

export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;

// ============================================================================
// PRODUCTS SCHEMAS
// ============================================================================

export const productSchema = z.object({
  product_id: z.string(),
  supplier_id: z.string(),
  product_name: z.string(),
  product_slug: z.string(),
  category_id: z.string(),
  subcategory_id: z.string().nullable(),
  brand: z.string().nullable(),
  sku: z.string(),
  manufacturer: z.string().nullable(),
  model_number: z.string().nullable(),
  description: z.string().nullable(),
  specifications: z.any().nullable(), // JSONB
  dimensions: z.any().nullable(), // JSONB
  weight: z.number().nullable(),
  unit_of_measure: z.string(),
  price: z.number(),
  compare_at_price: z.number().nullable(),
  cost_per_item: z.number().nullable(),
  has_variants: z.boolean(),
  bulk_pricing: z.any().nullable(), // JSONB
  trade_price: z.number().nullable(),
  track_inventory: z.boolean(),
  quantity_on_hand: z.number().int(),
  low_stock_threshold: z.number().int(),
  continue_selling_when_out_of_stock: z.boolean(),
  barcode: z.string().nullable(),
  requires_special_handling: z.boolean(),
  tags: z.any().nullable(), // JSONB
  is_eco_friendly: z.boolean(),
  sustainability_info: z.any().nullable(), // JSONB
  safety_information: z.string().nullable(),
  certifications: z.any().nullable(), // JSONB
  technical_datasheet_url: z.string().nullable(),
  installation_guide_url: z.string().nullable(),
  warranty_info_url: z.string().nullable(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  rating_average: z.number(),
  rating_count: z.number().int(),
  view_count: z.number().int(),
  order_count: z.number().int(),
  status: z.string(),
  is_featured: z.boolean(),
  last_inventory_update: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createProductInputSchema = z.object({
  supplier_id: z.string(),
  product_name: z.string().min(1).max(255),
  product_slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  category_id: z.string(),
  subcategory_id: z.string().nullable().optional(),
  brand: z.string().max(255).nullable().optional(),
  sku: z.string().min(1).max(255),
  manufacturer: z.string().max(255).nullable().optional(),
  model_number: z.string().max(255).nullable().optional(),
  description: z.string().max(10000).nullable().optional(),
  specifications: z.record(z.any()).nullable().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    unit: z.string().optional()
  }).nullable().optional(),
  weight: z.number().positive().nullable().optional(),
  unit_of_measure: z.string().min(1).max(50),
  price: z.number().positive(),
  compare_at_price: z.number().positive().nullable().optional(),
  cost_per_item: z.number().positive().nullable().optional(),
  has_variants: z.boolean().default(false),
  bulk_pricing: z.array(z.object({
    quantity: z.number().int().positive(),
    price: z.number().positive()
  })).nullable().optional(),
  trade_price: z.number().positive().nullable().optional(),
  track_inventory: z.boolean().default(true),
  quantity_on_hand: z.number().int().nonnegative().default(0),
  low_stock_threshold: z.number().int().nonnegative().default(10),
  continue_selling_when_out_of_stock: z.boolean().default(false),
  barcode: z.string().max(255).nullable().optional(),
  requires_special_handling: z.boolean().default(false),
  tags: z.array(z.string()).nullable().optional(),
  is_eco_friendly: z.boolean().default(false),
  sustainability_info: z.record(z.any()).nullable().optional(),
  safety_information: z.string().max(5000).nullable().optional(),
  certifications: z.array(z.string()).nullable().optional(),
  technical_datasheet_url: z.string().url().nullable().optional(),
  installation_guide_url: z.string().url().nullable().optional(),
  warranty_info_url: z.string().url().nullable().optional(),
  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(1000).nullable().optional(),
  status: z.enum(['draft', 'active', 'inactive', 'archived']).default('draft'),
  is_featured: z.boolean().default(false)
});

export const updateProductInputSchema = z.object({
  product_id: z.string(),
  product_name: z.string().min(1).max(255).optional(),
  product_slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
  category_id: z.string().optional(),
  subcategory_id: z.string().nullable().optional(),
  brand: z.string().max(255).nullable().optional(),
  sku: z.string().min(1).max(255).optional(),
  manufacturer: z.string().max(255).nullable().optional(),
  model_number: z.string().max(255).nullable().optional(),
  description: z.string().max(10000).nullable().optional(),
  specifications: z.record(z.any()).nullable().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    unit: z.string().optional()
  }).nullable().optional(),
  weight: z.number().positive().nullable().optional(),
  unit_of_measure: z.string().min(1).max(50).optional(),
  price: z.number().positive().optional(),
  compare_at_price: z.number().positive().nullable().optional(),
  cost_per_item: z.number().positive().nullable().optional(),
  has_variants: z.boolean().optional(),
  bulk_pricing: z.array(z.object({
    quantity: z.number().int().positive(),
    price: z.number().positive()
  })).nullable().optional(),
  trade_price: z.number().positive().nullable().optional(),
  track_inventory: z.boolean().optional(),
  quantity_on_hand: z.number().int().nonnegative().optional(),
  low_stock_threshold: z.number().int().nonnegative().optional(),
  continue_selling_when_out_of_stock: z.boolean().optional(),
  barcode: z.string().max(255).nullable().optional(),
  requires_special_handling: z.boolean().optional(),
  tags: z.array(z.string()).nullable().optional(),
  is_eco_friendly: z.boolean().optional(),
  sustainability_info: z.record(z.any()).nullable().optional(),
  safety_information: z.string().max(5000).nullable().optional(),
  certifications: z.array(z.string()).nullable().optional(),
  technical_datasheet_url: z.string().url().nullable().optional(),
  installation_guide_url: z.string().url().nullable().optional(),
  warranty_info_url: z.string().url().nullable().optional(),
  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(1000).nullable().optional(),
  status: z.enum(['draft', 'active', 'inactive', 'archived']).optional(),
  is_featured: z.boolean().optional()
});

export const searchProductsInputSchema = z.object({
  query: z.string().optional(),
  supplier_id: z.string().optional(),
  category_id: z.string().optional(),
  subcategory_id: z.string().optional(),
  brand: z.string().optional(),
  status: z.enum(['draft', 'active', 'inactive', 'archived']).optional(),
  is_featured: z.boolean().optional(),
  is_eco_friendly: z.boolean().optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  min_rating: z.number().min(0).max(5).optional(),
  in_stock: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['product_name', 'price', 'rating_average', 'created_at', 'popularity']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Product = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductInputSchema>;
export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;
export type SearchProductsInput = z.infer<typeof searchProductsInputSchema>;

// ============================================================================
// PRODUCT VARIANTS SCHEMAS
// ============================================================================

export const productVariantSchema = z.object({
  variant_id: z.string(),
  product_id: z.string(),
  variant_name: z.string(),
  variant_type: z.string(),
  sku: z.string(),
  price: z.number(),
  compare_at_price: z.number().nullable(),
  quantity_on_hand: z.number().int(),
  variant_image_url: z.string().nullable(),
  variant_specifications: z.any().nullable(), // JSONB
  display_order: z.number().int(),
  is_active: z.boolean(),
  created_at: z.string()
});

export const createProductVariantInputSchema = z.object({
  product_id: z.string(),
  variant_name: z.string().min(1).max(255),
  variant_type: z.string().min(1).max(100),
  sku: z.string().min(1).max(255),
  price: z.number().positive(),
  compare_at_price: z.number().positive().nullable().optional(),
  quantity_on_hand: z.number().int().nonnegative().default(0),
  variant_image_url: z.string().url().nullable().optional(),
  variant_specifications: z.record(z.any()).nullable().optional(),
  display_order: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true)
});

export const updateProductVariantInputSchema = z.object({
  variant_id: z.string(),
  variant_name: z.string().min(1).max(255).optional(),
  variant_type: z.string().min(1).max(100).optional(),
  sku: z.string().min(1).max(255).optional(),
  price: z.number().positive().optional(),
  compare_at_price: z.number().positive().nullable().optional(),
  quantity_on_hand: z.number().int().nonnegative().optional(),
  variant_image_url: z.string().url().nullable().optional(),
  variant_specifications: z.record(z.any()).nullable().optional(),
  display_order: z.number().int().nonnegative().optional(),
  is_active: z.boolean().optional()
});

export type ProductVariant = z.infer<typeof productVariantSchema>;
export type CreateProductVariantInput = z.infer<typeof createProductVariantInputSchema>;
export type UpdateProductVariantInput = z.infer<typeof updateProductVariantInputSchema>;

// ============================================================================
// SHOPPING CARTS SCHEMAS
// ============================================================================

export const shoppingCartSchema = z.object({
  cart_id: z.string(),
  user_id: z.string().nullable(),
  session_id: z.string().nullable(),
  cart_name: z.string().nullable(),
  is_active: z.boolean(),
  project_id: z.string().nullable(),
  promo_code: z.string().nullable(),
  promo_discount_amount: z.number().nullable(),
  promo_discount_type: z.string().nullable(),
  reservation_expiry: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createShoppingCartInputSchema = z.object({
  user_id: z.string().nullable().optional(),
  session_id: z.string().nullable().optional(),
  cart_name: z.string().max(255).nullable().optional(),
  is_active: z.boolean().default(true),
  project_id: z.string().nullable().optional(),
  promo_code: z.string().max(100).nullable().optional()
});

export const updateShoppingCartInputSchema = z.object({
  cart_id: z.string(),
  cart_name: z.string().max(255).nullable().optional(),
  is_active: z.boolean().optional(),
  project_id: z.string().nullable().optional(),
  promo_code: z.string().max(100).nullable().optional(),
  promo_discount_amount: z.number().nullable().optional(),
  promo_discount_type: z.enum(['percentage', 'fixed']).nullable().optional()
});

export type ShoppingCart = z.infer<typeof shoppingCartSchema>;
export type CreateShoppingCartInput = z.infer<typeof createShoppingCartInputSchema>;
export type UpdateShoppingCartInput = z.infer<typeof updateShoppingCartInputSchema>;

// ============================================================================
// CART ITEMS SCHEMAS
// ============================================================================

export const cartItemSchema = z.object({
  cart_item_id: z.string(),
  cart_id: z.string(),
  product_id: z.string(),
  variant_id: z.string().nullable(),
  supplier_id: z.string(),
  quantity: z.number().int(),
  unit_price: z.number(),
  subtotal: z.number(),
  reserved_at: z.string().nullable(),
  added_at: z.string()
});

export const createCartItemInputSchema = z.object({
  cart_id: z.string(),
  product_id: z.string(),
  variant_id: z.string().nullable().optional(),
  supplier_id: z.string(),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
  subtotal: z.number().nonnegative()
});

export const updateCartItemInputSchema = z.object({
  cart_item_id: z.string(),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
  subtotal: z.number().nonnegative()
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type CreateCartItemInput = z.infer<typeof createCartItemInputSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemInputSchema>;

// ============================================================================
// ORDERS SCHEMAS
// ============================================================================

export const orderSchema = z.object({
  order_id: z.string(),
  order_number: z.string(),
  customer_id: z.string(),
  supplier_id: z.string(),
  project_id: z.string().nullable(),
  delivery_address_id: z.string(),
  billing_address_id: z.string(),
  delivery_contact_name: z.string().nullable(),
  delivery_contact_phone: z.string().nullable(),
  delivery_instructions: z.string().nullable(),
  delivery_window_start: z.string().nullable(),
  delivery_window_end: z.string().nullable(),
  delivery_method: z.string(),
  status: z.string(),
  payment_status: z.string(),
  payment_method: z.string(),
  payment_method_id: z.string().nullable(),
  subtotal: z.number(),
  delivery_cost: z.number(),
  tax_amount: z.number(),
  discount_amount: z.number(),
  promo_code: z.string().nullable(),
  total_amount: z.number(),
  currency: z.string(),
  payment_transaction_id: z.string().nullable(),
  payment_gateway: z.string().nullable(),
  platform_fee: z.number(),
  supplier_payout_amount: z.number(),
  is_guest_order: z.boolean(),
  guest_email: z.string().nullable(),
  guest_phone: z.string().nullable(),
  tracking_token: z.string().nullable(),
  placed_by: z.string(),
  approved_by: z.string().nullable(),
  requires_approval: z.boolean(),
  approval_status: z.string().nullable(),
  notes: z.string().nullable(),
  supplier_notes: z.string().nullable(),
  admin_notes: z.string().nullable(),
  estimated_delivery_date: z.string().nullable(),
  actual_delivery_date: z.string().nullable(),
  accepted_at: z.string().nullable(),
  shipped_at: z.string().nullable(),
  delivered_at: z.string().nullable(),
  canceled_at: z.string().nullable(),
  cancellation_reason: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createOrderInputSchema = z.object({
  customer_id: z.string(),
  supplier_id: z.string(),
  project_id: z.string().nullable().optional(),
  delivery_address_id: z.string(),
  billing_address_id: z.string(),
  delivery_contact_name: z.string().max(255).nullable().optional(),
  delivery_contact_phone: z.string().max(50).nullable().optional(),
  delivery_instructions: z.string().max(1000).nullable().optional(),
  delivery_window_start: z.string().nullable().optional(),
  delivery_window_end: z.string().nullable().optional(),
  delivery_method: z.enum(['standard_delivery', 'express_delivery', 'freight_delivery', 'pickup']),
  payment_method: z.enum(['credit_card', 'debit_card', 'trade_credit', 'invoice']),
  payment_method_id: z.string().nullable().optional(),
  subtotal: z.number().nonnegative(),
  delivery_cost: z.number().nonnegative(),
  tax_amount: z.number().nonnegative(),
  discount_amount: z.number().nonnegative().default(0),
  promo_code: z.string().max(100).nullable().optional(),
  total_amount: z.number().positive(),
  currency: z.string().max(10).default('USD'),
  platform_fee: z.number().nonnegative(),
  supplier_payout_amount: z.number().nonnegative(),
  is_guest_order: z.boolean().default(false),
  guest_email: z.string().email().nullable().optional(),
  guest_phone: z.string().nullable().optional(),
  placed_by: z.string(),
  requires_approval: z.boolean().default(false),
  notes: z.string().max(5000).nullable().optional()
});

export const updateOrderInputSchema = z.object({
  order_id: z.string(),
  status: z.enum(['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'canceled', 'refunded']).optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded', 'partial_refund']).optional(),
  delivery_contact_name: z.string().max(255).nullable().optional(),
  delivery_contact_phone: z.string().max(50).nullable().optional(),
  delivery_instructions: z.string().max(1000).nullable().optional(),
  delivery_window_start: z.string().nullable().optional(),
  delivery_window_end: z.string().nullable().optional(),
  payment_transaction_id: z.string().nullable().optional(),
  payment_gateway: z.string().nullable().optional(),
  approved_by: z.string().nullable().optional(),
  approval_status: z.enum(['pending', 'approved', 'rejected']).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  supplier_notes: z.string().max(5000).nullable().optional(),
  admin_notes: z.string().max(5000).nullable().optional(),
  estimated_delivery_date: z.string().nullable().optional(),
  actual_delivery_date: z.string().nullable().optional(),
  cancellation_reason: z.string().max(1000).nullable().optional()
});

export const searchOrdersInputSchema = z.object({
  customer_id: z.string().optional(),
  supplier_id: z.string().optional(),
  project_id: z.string().optional(),
  status: z.enum(['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'canceled', 'refunded']).optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded', 'partial_refund']).optional(),
  order_number: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  min_total: z.number().optional(),
  max_total: z.number().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['order_number', 'created_at', 'total_amount', 'status']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Order = z.infer<typeof orderSchema>;
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderInputSchema>;
export type SearchOrdersInput = z.infer<typeof searchOrdersInputSchema>;

// ============================================================================
// ORDER ITEMS SCHEMAS
// ============================================================================

export const orderItemSchema = z.object({
  order_item_id: z.string(),
  order_id: z.string(),
  product_id: z.string(),
  variant_id: z.string().nullable(),
  product_name: z.string(),
  variant_name: z.string().nullable(),
  sku: z.string(),
  quantity: z.number().int(),
  unit_price: z.number(),
  subtotal: z.number(),
  product_image_url: z.string().nullable()
});

export const createOrderItemInputSchema = z.object({
  order_id: z.string(),
  product_id: z.string(),
  variant_id: z.string().nullable().optional(),
  product_name: z.string().min(1).max(255),
  variant_name: z.string().max(255).nullable().optional(),
  sku: z.string().min(1).max(255),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
  subtotal: z.number().nonnegative(),
  product_image_url: z.string().url().nullable().optional()
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type CreateOrderItemInput = z.infer<typeof createOrderItemInputSchema>;

// ============================================================================
// PRODUCT REVIEWS SCHEMAS
// ============================================================================

export const productReviewSchema = z.object({
  review_id: z.string(),
  product_id: z.string(),
  order_id: z.string(),
  customer_id: z.string(),
  rating: z.number().int(),
  title: z.string().nullable(),
  review_text: z.string(),
  is_recommended: z.boolean().nullable(),
  is_anonymous: z.boolean(),
  is_verified_purchase: z.boolean(),
  helpful_count: z.number().int(),
  photo_urls: z.any().nullable(), // JSONB
  video_url: z.string().nullable(),
  supplier_response: z.string().nullable(),
  supplier_response_date: z.string().nullable(),
  status: z.string(),
  flagged_reason: z.string().nullable(),
  moderation_notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createProductReviewInputSchema = z.object({
  product_id: z.string(),
  order_id: z.string(),
  customer_id: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(255).nullable().optional(),
  review_text: z.string().min(10).max(5000),
  is_recommended: z.boolean().nullable().optional(),
  is_anonymous: z.boolean().default(false),
  photo_urls: z.array(z.string().url()).nullable().optional(),
  video_url: z.string().url().nullable().optional()
});

export const updateProductReviewInputSchema = z.object({
  review_id: z.string(),
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(255).nullable().optional(),
  review_text: z.string().min(10).max(5000).optional(),
  is_recommended: z.boolean().nullable().optional(),
  supplier_response: z.string().max(2000).nullable().optional(),
  status: z.enum(['pending', 'published', 'rejected', 'flagged']).optional(),
  flagged_reason: z.string().max(500).nullable().optional(),
  moderation_notes: z.string().max(1000).nullable().optional()
});

export const searchProductReviewsInputSchema = z.object({
  product_id: z.string().optional(),
  customer_id: z.string().optional(),
  order_id: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  status: z.enum(['pending', 'published', 'rejected', 'flagged']).optional(),
  is_verified_purchase: z.boolean().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'rating', 'helpful_count']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type ProductReview = z.infer<typeof productReviewSchema>;
export type CreateProductReviewInput = z.infer<typeof createProductReviewInputSchema>;
export type UpdateProductReviewInput = z.infer<typeof updateProductReviewInputSchema>;
export type SearchProductReviewsInput = z.infer<typeof searchProductReviewsInputSchema>;

// ============================================================================
// SUPPLIER REVIEWS SCHEMAS
// ============================================================================

export const supplierReviewSchema = z.object({
  review_id: z.string(),
  supplier_id: z.string(),
  order_id: z.string(),
  customer_id: z.string(),
  overall_rating: z.number().int(),
  product_quality_rating: z.number().int(),
  delivery_rating: z.number().int(),
  customer_service_rating: z.number().int(),
  review_text: z.string().nullable(),
  is_anonymous: z.boolean(),
  photo_urls: z.any().nullable(), // JSONB
  supplier_response: z.string().nullable(),
  supplier_response_date: z.string().nullable(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createSupplierReviewInputSchema = z.object({
  supplier_id: z.string(),
  order_id: z.string(),
  customer_id: z.string(),
  overall_rating: z.number().int().min(1).max(5),
  product_quality_rating: z.number().int().min(1).max(5),
  delivery_rating: z.number().int().min(1).max(5),
  customer_service_rating: z.number().int().min(1).max(5),
  review_text: z.string().max(5000).nullable().optional(),
  is_anonymous: z.boolean().default(false),
  photo_urls: z.array(z.string().url()).nullable().optional()
});

export const updateSupplierReviewInputSchema = z.object({
  review_id: z.string(),
  overall_rating: z.number().int().min(1).max(5).optional(),
  product_quality_rating: z.number().int().min(1).max(5).optional(),
  delivery_rating: z.number().int().min(1).max(5).optional(),
  customer_service_rating: z.number().int().min(1).max(5).optional(),
  review_text: z.string().max(5000).nullable().optional(),
  supplier_response: z.string().max(2000).nullable().optional(),
  status: z.enum(['pending', 'published', 'rejected']).optional()
});

export type SupplierReview = z.infer<typeof supplierReviewSchema>;
export type CreateSupplierReviewInput = z.infer<typeof createSupplierReviewInputSchema>;
export type UpdateSupplierReviewInput = z.infer<typeof updateSupplierReviewInputSchema>;

// ============================================================================
// WISHLISTS SCHEMAS
// ============================================================================

export const wishlistSchema = z.object({
  wishlist_id: z.string(),
  user_id: z.string(),
  wishlist_name: z.string(),
  is_default: z.boolean(),
  is_public: z.boolean(),
  created_at: z.string()
});

export const createWishlistInputSchema = z.object({
  user_id: z.string(),
  wishlist_name: z.string().min(1).max(255).default('My Wishlist'),
  is_default: z.boolean().default(false),
  is_public: z.boolean().default(false)
});

export const updateWishlistInputSchema = z.object({
  wishlist_id: z.string(),
  wishlist_name: z.string().min(1).max(255).optional(),
  is_default: z.boolean().optional(),
  is_public: z.boolean().optional()
});

export type Wishlist = z.infer<typeof wishlistSchema>;
export type CreateWishlistInput = z.infer<typeof createWishlistInputSchema>;
export type UpdateWishlistInput = z.infer<typeof updateWishlistInputSchema>;

// ============================================================================
// WISHLIST ITEMS SCHEMAS
// ============================================================================

export const wishlistItemSchema = z.object({
  wishlist_item_id: z.string(),
  wishlist_id: z.string(),
  product_id: z.string(),
  variant_id: z.string().nullable(),
  added_at: z.string(),
  price_when_added: z.number(),
  notes: z.string().nullable()
});

export const createWishlistItemInputSchema = z.object({
  wishlist_id: z.string(),
  product_id: z.string(),
  variant_id: z.string().nullable().optional(),
  price_when_added: z.number().positive(),
  notes: z.string().max(500).nullable().optional()
});

export const updateWishlistItemInputSchema = z.object({
  wishlist_item_id: z.string(),
  notes: z.string().max(500).nullable().optional()
});

export type WishlistItem = z.infer<typeof wishlistItemSchema>;
export type CreateWishlistItemInput = z.infer<typeof createWishlistItemInputSchema>;
export type UpdateWishlistItemInput = z.infer<typeof updateWishlistItemInputSchema>;

// ============================================================================
// PROJECTS SCHEMAS
// ============================================================================

export const projectSchema = z.object({
  project_id: z.string(),
  business_account_id: z.string(),
  project_name: z.string(),
  project_type: z.string().nullable(),
  budget: z.number().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  status: z.string(),
  notes: z.string().nullable(),
  total_spent: z.number(),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createProjectInputSchema = z.object({
  business_account_id: z.string(),
  project_name: z.string().min(1).max(255),
  project_type: z.string().max(100).nullable().optional(),
  budget: z.number().positive().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  status: z.enum(['active', 'completed', 'on_hold', 'canceled']).default('active'),
  notes: z.string().max(5000).nullable().optional(),
  created_by: z.string()
});

export const updateProjectInputSchema = z.object({
  project_id: z.string(),
  project_name: z.string().min(1).max(255).optional(),
  project_type: z.string().max(100).nullable().optional(),
  budget: z.number().positive().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  status: z.enum(['active', 'completed', 'on_hold', 'canceled']).optional(),
  notes: z.string().max(5000).nullable().optional(),
  total_spent: z.number().nonnegative().optional()
});

export const searchProjectsInputSchema = z.object({
  business_account_id: z.string().optional(),
  status: z.enum(['active', 'completed', 'on_hold', 'canceled']).optional(),
  project_type: z.string().optional(),
  query: z.string().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['project_name', 'created_at', 'budget', 'total_spent']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;
export type SearchProjectsInput = z.infer<typeof searchProjectsInputSchema>;

// ============================================================================
// PAYMENT METHODS SCHEMAS
// ============================================================================

export const paymentMethodSchema = z.object({
  payment_method_id: z.string(),
  user_id: z.string(),
  payment_type: z.string(),
  card_last_four: z.string().nullable(),
  card_brand: z.string().nullable(),
  card_expiry_month: z.string().nullable(),
  card_expiry_year: z.string().nullable(),
  cardholder_name: z.string().nullable(),
  payment_token: z.string(),
  is_default: z.boolean(),
  billing_address_id: z.string().nullable(),
  created_at: z.string()
});

export const createPaymentMethodInputSchema = z.object({
  user_id: z.string(),
  payment_type: z.enum(['credit_card', 'debit_card', 'bank_account', 'digital_wallet']),
  card_last_four: z.string().length(4).nullable().optional(),
  card_brand: z.string().max(50).nullable().optional(),
  card_expiry_month: z.string().regex(/^(0[1-9]|1[0-2])$/).nullable().optional(),
  card_expiry_year: z.string().regex(/^\d{4}$/).nullable().optional(),
  cardholder_name: z.string().max(255).nullable().optional(),
  payment_token: z.string().min(1),
  is_default: z.boolean().default(false),
  billing_address_id: z.string().nullable().optional()
});

export const updatePaymentMethodInputSchema = z.object({
  payment_method_id: z.string(),
  card_expiry_month: z.string().regex(/^(0[1-9]|1[0-2])$/).nullable().optional(),
  card_expiry_year: z.string().regex(/^\d{4}$/).nullable().optional(),
  cardholder_name: z.string().max(255).nullable().optional(),
  is_default: z.boolean().optional(),
  billing_address_id: z.string().nullable().optional()
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodInputSchema>;
export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodInputSchema>;

// ============================================================================
// NOTIFICATIONS SCHEMAS
// ============================================================================

export const notificationSchema = z.object({
  notification_id: z.string(),
  user_id: z.string(),
  notification_type: z.string(),
  title: z.string(),
  message: z.string(),
  icon_type: z.string(),
  related_entity_type: z.string().nullable(),
  related_entity_id: z.string().nullable(),
  action_url: z.string().nullable(),
  is_read: z.boolean(),
  read_at: z.string().nullable(),
  created_at: z.string()
});

export const createNotificationInputSchema = z.object({
  user_id: z.string(),
  notification_type: z.enum(['order_update', 'message', 'promotion', 'system', 'price_drop', 'back_in_stock']),
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(1000),
  icon_type: z.enum(['success', 'info', 'warning', 'error', 'message', 'offer']),
  related_entity_type: z.string().max(100).nullable().optional(),
  related_entity_id: z.string().nullable().optional(),
  action_url: z.string().url().nullable().optional(),
  is_read: z.boolean().default(false)
});

export const updateNotificationInputSchema = z.object({
  notification_id: z.string(),
  is_read: z.boolean()
});

export const searchNotificationsInputSchema = z.object({
  user_id: z.string(),
  notification_type: z.enum(['order_update', 'message', 'promotion', 'system', 'price_drop', 'back_in_stock']).optional(),
  is_read: z.boolean().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type Notification = z.infer<typeof notificationSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationInputSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationInputSchema>;
export type SearchNotificationsInput = z.infer<typeof searchNotificationsInputSchema>;

// ============================================================================
// DELIVERIES SCHEMAS
// ============================================================================

export const deliverySchema = z.object({
  delivery_id: z.string(),
  order_id: z.string(),
  carrier_name: z.string().nullable(),
  tracking_number: z.string().nullable(),
  tracking_url: z.string().nullable(),
  delivery_method: z.string(),
  scheduled_date: z.string().nullable(),
  scheduled_window_start: z.string().nullable(),
  scheduled_window_end: z.string().nullable(),
  estimated_arrival_time: z.string().nullable(),
  actual_delivery_time: z.string().nullable(),
  driver_name: z.string().nullable(),
  driver_phone: z.string().nullable(),
  current_latitude: z.number().nullable(),
  current_longitude: z.number().nullable(),
  status: z.string(),
  delay_reason: z.string().nullable(),
  proof_of_delivery_url: z.string().nullable(),
  recipient_name: z.string().nullable(),
  recipient_signature_url: z.string().nullable(),
  delivery_photo_urls: z.any().nullable(), // JSONB
  delivery_notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createDeliveryInputSchema = z.object({
  order_id: z.string(),
  carrier_name: z.string().max(255).nullable().optional(),
  tracking_number: z.string().max(255).nullable().optional(),
  tracking_url: z.string().url().nullable().optional(),
  delivery_method: z.enum(['standard_delivery', 'express_delivery', 'freight_delivery', 'pickup']),
  scheduled_date: z.string().nullable().optional(),
  scheduled_window_start: z.string().nullable().optional(),
  scheduled_window_end: z.string().nullable().optional(),
  estimated_arrival_time: z.string().nullable().optional(),
  driver_name: z.string().max(255).nullable().optional(),
  driver_phone: z.string().max(50).nullable().optional(),
  status: z.enum(['pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned']).default('pending'),
  delivery_notes: z.string().max(1000).nullable().optional()
});

export const updateDeliveryInputSchema = z.object({
  delivery_id: z.string(),
  tracking_number: z.string().max(255).nullable().optional(),
  tracking_url: z.string().url().nullable().optional(),
  scheduled_date: z.string().nullable().optional(),
  scheduled_window_start: z.string().nullable().optional(),
  scheduled_window_end: z.string().nullable().optional(),
  estimated_arrival_time: z.string().nullable().optional(),
  actual_delivery_time: z.string().nullable().optional(),
  driver_name: z.string().max(255).nullable().optional(),
  driver_phone: z.string().max(50).nullable().optional(),
  current_latitude: z.number().min(-90).max(90).nullable().optional(),
  current_longitude: z.number().min(-180).max(180).nullable().optional(),
  status: z.enum(['pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned']).optional(),
  delay_reason: z.string().max(1000).nullable().optional(),
  proof_of_delivery_url: z.string().url().nullable().optional(),
  recipient_name: z.string().max(255).nullable().optional(),
  recipient_signature_url: z.string().url().nullable().optional(),
  delivery_photo_urls: z.array(z.string().url()).nullable().optional(),
  delivery_notes: z.string().max(1000).nullable().optional()
});

export type Delivery = z.infer<typeof deliverySchema>;
export type CreateDeliveryInput = z.infer<typeof createDeliveryInputSchema>;
export type UpdateDeliveryInput = z.infer<typeof updateDeliveryInputSchema>;

// ============================================================================
// RETURNS SCHEMAS
// ============================================================================

export const returnSchema = z.object({
  return_id: z.string(),
  order_id: z.string(),
  order_item_id: z.string(),
  customer_id: z.string(),
  supplier_id: z.string(),
  return_reason: z.string(),
  detailed_description: z.string().nullable(),
  photo_urls: z.any().nullable(), // JSONB
  quantity: z.number().int(),
  refund_amount: z.number(),
  return_method: z.string().nullable(),
  return_address: z.string().nullable(),
  return_shipping_label_url: z.string().nullable(),
  return_tracking_number: z.string().nullable(),
  status: z.string(),
  supplier_decision: z.string().nullable(),
  supplier_notes: z.string().nullable(),
  decline_reason: z.string().nullable(),
  item_received_at: z.string().nullable(),
  inspection_notes: z.string().nullable(),
  requested_at: z.string(),
  approved_at: z.string().nullable(),
  completed_at: z.string().nullable()
});

export const createReturnInputSchema = z.object({
  order_id: z.string(),
  order_item_id: z.string(),
  customer_id: z.string(),
  supplier_id: z.string(),
  return_reason: z.enum(['defective', 'wrong_item', 'not_as_described', 'damaged', 'changed_mind', 'other']),
  detailed_description: z.string().max(2000).nullable().optional(),
  photo_urls: z.array(z.string().url()).nullable().optional(),
  quantity: z.number().int().positive(),
  refund_amount: z.number().nonnegative(),
  return_method: z.enum(['return_label', 'carrier_pickup', 'drop_off']).nullable().optional()
});

export const updateReturnInputSchema = z.object({
  return_id: z.string(),
  return_shipping_label_url: z.string().url().nullable().optional(),
  return_tracking_number: z.string().max(255).nullable().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'in_transit', 'received', 'completed', 'canceled']).optional(),
  supplier_decision: z.enum(['approved', 'rejected', 'partial_approval']).nullable().optional(),
  supplier_notes: z.string().max(2000).nullable().optional(),
  decline_reason: z.string().max(1000).nullable().optional(),
  inspection_notes: z.string().max(2000).nullable().optional()
});

export type Return = z.infer<typeof returnSchema>;
export type CreateReturnInput = z.infer<typeof createReturnInputSchema>;
export type UpdateReturnInput = z.infer<typeof updateReturnInputSchema>;

// ============================================================================
// PROMOTIONS SCHEMAS
// ============================================================================

export const promotionSchema = z.object({
  promotion_id: z.string(),
  supplier_id: z.string(),
  promotion_name: z.string(),
  promotion_type: z.string(),
  discount_code: z.string().nullable(),
  discount_type: z.string(),
  discount_value: z.number(),
  minimum_purchase_amount: z.number().nullable(),
  applicable_product_ids: z.any().nullable(), // JSONB
  applicable_category_ids: z.any().nullable(), // JSONB
  customer_eligibility: z.string(),
  start_date: z.string(),
  end_date: z.string().nullable(),
  total_usage_limit: z.number().int().nullable(),
  per_customer_limit: z.number().int().nullable(),
  current_usage_count: z.number().int(),
  is_active: z.boolean(),
  show_on_shop_page: z.boolean(),
  show_on_product_pages: z.boolean(),
  email_to_followers: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createPromotionInputSchema = z.object({
  supplier_id: z.string(),
  promotion_name: z.string().min(1).max(255),
  promotion_type: z.enum(['seasonal', 'flash_sale', 'bulk', 'weekly', 'clearance']),
  discount_code: z.string().min(3).max(100).regex(/^[A-Z0-9]+$/).nullable().optional(),
  discount_type: z.enum(['percentage', 'fixed_amount']),
  discount_value: z.number().positive(),
  minimum_purchase_amount: z.number().positive().nullable().optional(),
  applicable_product_ids: z.array(z.string()).nullable().optional(),
  applicable_category_ids: z.array(z.string()).nullable().optional(),
  customer_eligibility: z.enum(['all', 'business', 'new', 'returning']).default('all'),
  start_date: z.string(),
  end_date: z.string().nullable().optional(),
  total_usage_limit: z.number().int().positive().nullable().optional(),
  per_customer_limit: z.number().int().positive().nullable().optional(),
  is_active: z.boolean().default(true),
  show_on_shop_page: z.boolean().default(false),
  show_on_product_pages: z.boolean().default(false),
  email_to_followers: z.boolean().default(false)
});

export const updatePromotionInputSchema = z.object({
  promotion_id: z.string(),
  promotion_name: z.string().min(1).max(255).optional(),
  discount_value: z.number().positive().optional(),
  minimum_purchase_amount: z.number().positive().nullable().optional(),
  applicable_product_ids: z.array(z.string()).nullable().optional(),
  applicable_category_ids: z.array(z.string()).nullable().optional(),
  customer_eligibility: z.enum(['all', 'business', 'new', 'returning']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().nullable().optional(),
  total_usage_limit: z.number().int().positive().nullable().optional(),
  per_customer_limit: z.number().int().positive().nullable().optional(),
  is_active: z.boolean().optional(),
  show_on_shop_page: z.boolean().optional(),
  show_on_product_pages: z.boolean().optional(),
  email_to_followers: z.boolean().optional()
});

export const searchPromotionsInputSchema = z.object({
  supplier_id: z.string().optional(),
  promotion_type: z.enum(['seasonal', 'flash_sale', 'bulk', 'weekly', 'clearance']).optional(),
  is_active: z.boolean().optional(),
  discount_code: z.string().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['promotion_name', 'start_date', 'discount_value']).default('start_date'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Promotion = z.infer<typeof promotionSchema>;
export type CreatePromotionInput = z.infer<typeof createPromotionInputSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionInputSchema>;
export type SearchPromotionsInput = z.infer<typeof searchPromotionsInputSchema>;

// ============================================================================
// SUPPORT TICKETS SCHEMAS
// ============================================================================

export const supportTicketSchema = z.object({
  ticket_id: z.string(),
  ticket_number: z.string(),
  user_id: z.string(),
  category: z.string(),
  subject: z.string(),
  description: z.string(),
  priority: z.string(),
  status: z.string(),
  assigned_to: z.string().nullable(),
  related_order_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  resolved_at: z.string().nullable(),
  closed_at: z.string().nullable()
});

export const createSupportTicketInputSchema = z.object({
  user_id: z.string(),
  category: z.enum(['order_issue', 'product_question', 'account', 'payment', 'delivery', 'return', 'technical', 'other']),
  subject: z.string().min(5).max(255),
  description: z.string().min(20).max(5000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  related_order_id: z.string().nullable().optional()
});

export const updateSupportTicketInputSchema = z.object({
  ticket_id: z.string(),
  status: z.enum(['open', 'in_progress', 'waiting_customer', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigned_to: z.string().nullable().optional()
});

export const searchSupportTicketsInputSchema = z.object({
  user_id: z.string().optional(),
  category: z.enum(['order_issue', 'product_question', 'account', 'payment', 'delivery', 'return', 'technical', 'other']).optional(),
  status: z.enum(['open', 'in_progress', 'waiting_customer', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigned_to: z.string().optional(),
  ticket_number: z.string().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['ticket_number', 'created_at', 'priority', 'status']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type SupportTicket = z.infer<typeof supportTicketSchema>;
export type CreateSupportTicketInput = z.infer<typeof createSupportTicketInputSchema>;
export type UpdateSupportTicketInput = z.infer<typeof updateSupportTicketInputSchema>;
export type SearchSupportTicketsInput = z.infer<typeof searchSupportTicketsInputSchema>;