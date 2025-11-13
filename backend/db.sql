-- Create all tables

-- Users table
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    account_type VARCHAR(50) NOT NULL DEFAULT 'personal',
    email_verified BOOLEAN NOT NULL DEFAULT false,
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    profile_photo_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    last_login VARCHAR(255),
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Addresses table
CREATE TABLE addresses (
    address_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    address_label VARCHAR(255),
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    postal_code VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN NOT NULL DEFAULT false,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    delivery_instructions TEXT,
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Business accounts table
CREATE TABLE business_accounts (
    business_account_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    company_name VARCHAR(255) NOT NULL,
    company_registration_number VARCHAR(255),
    tax_id VARCHAR(255),
    billing_address_id VARCHAR(255) REFERENCES addresses(address_id),
    tax_exempt BOOLEAN NOT NULL DEFAULT false,
    tax_exemption_document_url TEXT,
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Team members table
CREATE TABLE team_members (
    team_member_id VARCHAR(255) PRIMARY KEY,
    business_account_id VARCHAR(255) NOT NULL REFERENCES business_accounts(business_account_id),
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    role VARCHAR(100) NOT NULL,
    spending_limit DECIMAL(15, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    invited_by VARCHAR(255) NOT NULL REFERENCES users(user_id),
    invited_at VARCHAR(255) NOT NULL,
    joined_at VARCHAR(255)
);

-- Suppliers table
CREATE TABLE suppliers (
    supplier_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    shop_name VARCHAR(255) NOT NULL,
    shop_slug VARCHAR(255) UNIQUE NOT NULL,
    shop_description TEXT,
    shop_logo_url TEXT,
    shop_cover_image_url TEXT,
    business_address TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    website_url TEXT,
    business_hours JSONB,
    holiday_schedule JSONB,
    about_section TEXT,
    certifications JSONB,
    social_media_links JSONB,
    return_policy TEXT,
    shipping_policy TEXT,
    privacy_policy TEXT,
    terms_and_conditions TEXT,
    rating_average DECIMAL(3, 2) NOT NULL DEFAULT 0,
    rating_count INTEGER NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_date VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    commission_rate DECIMAL(5, 2) NOT NULL,
    average_response_time_minutes INTEGER,
    on_time_delivery_percentage DECIMAL(5, 2),
    order_fulfillment_rate DECIMAL(5, 2),
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Supplier applications table
CREATE TABLE supplier_applications (
    application_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    business_name VARCHAR(255) NOT NULL,
    business_registration_number VARCHAR(255) NOT NULL,
    tax_id VARCHAR(255) NOT NULL,
    business_address TEXT NOT NULL,
    years_in_business INTEGER NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    website_url TEXT,
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    product_categories JSONB NOT NULL,
    estimated_product_count INTEGER NOT NULL,
    average_order_value DECIMAL(15, 2),
    delivery_area JSONB NOT NULL,
    delivery_options JSONB NOT NULL,
    pickup_available BOOLEAN NOT NULL DEFAULT false,
    documents JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    admin_notes TEXT,
    reviewed_by VARCHAR(255) REFERENCES users(user_id),
    reviewed_at VARCHAR(255),
    submitted_at VARCHAR(255) NOT NULL,
    reference_number VARCHAR(255) UNIQUE NOT NULL
);

-- Payment methods table
CREATE TABLE payment_methods (
    payment_method_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    payment_type VARCHAR(50) NOT NULL,
    card_last_four VARCHAR(4),
    card_brand VARCHAR(50),
    card_expiry_month VARCHAR(2),
    card_expiry_year VARCHAR(4),
    cardholder_name VARCHAR(255),
    payment_token VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    billing_address_id VARCHAR(255) REFERENCES addresses(address_id),
    created_at VARCHAR(255) NOT NULL
);

-- Categories table
CREATE TABLE categories (
    category_id VARCHAR(255) PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    category_slug VARCHAR(255) UNIQUE NOT NULL,
    parent_category_id VARCHAR(255) REFERENCES categories(category_id),
    category_description TEXT,
    category_image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    category_attributes JSONB,
    created_at VARCHAR(255) NOT NULL
);

-- Products table
CREATE TABLE products (
    product_id VARCHAR(255) PRIMARY KEY,
    supplier_id VARCHAR(255) NOT NULL REFERENCES suppliers(supplier_id),
    product_name VARCHAR(255) NOT NULL,
    product_slug VARCHAR(255) NOT NULL,
    category_id VARCHAR(255) NOT NULL REFERENCES categories(category_id),
    subcategory_id VARCHAR(255) REFERENCES categories(category_id),
    brand VARCHAR(255),
    sku VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    model_number VARCHAR(255),
    description TEXT,
    specifications JSONB,
    dimensions JSONB,
    weight DECIMAL(10, 2),
    unit_of_measure VARCHAR(50) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    compare_at_price DECIMAL(15, 2),
    cost_per_item DECIMAL(15, 2),
    has_variants BOOLEAN NOT NULL DEFAULT false,
    bulk_pricing JSONB,
    trade_price DECIMAL(15, 2),
    track_inventory BOOLEAN NOT NULL DEFAULT true,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,
    continue_selling_when_out_of_stock BOOLEAN NOT NULL DEFAULT false,
    barcode VARCHAR(255),
    requires_special_handling BOOLEAN NOT NULL DEFAULT false,
    tags JSONB,
    is_eco_friendly BOOLEAN NOT NULL DEFAULT false,
    sustainability_info JSONB,
    safety_information TEXT,
    certifications JSONB,
    technical_datasheet_url TEXT,
    installation_guide_url TEXT,
    warranty_info_url TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    rating_average DECIMAL(3, 2) NOT NULL DEFAULT 0,
    rating_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    order_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    last_inventory_update VARCHAR(255),
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Product variants table
CREATE TABLE product_variants (
    variant_id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL REFERENCES products(product_id),
    variant_name VARCHAR(255) NOT NULL,
    variant_type VARCHAR(100) NOT NULL,
    sku VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    compare_at_price DECIMAL(15, 2),
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    variant_image_url TEXT,
    variant_specifications JSONB,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at VARCHAR(255) NOT NULL
);

-- Product images table
CREATE TABLE product_images (
    image_id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL REFERENCES products(product_id),
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    alt_text VARCHAR(255),
    created_at VARCHAR(255) NOT NULL
);

-- Projects table
CREATE TABLE projects (
    project_id VARCHAR(255) PRIMARY KEY,
    business_account_id VARCHAR(255) NOT NULL REFERENCES business_accounts(business_account_id),
    project_name VARCHAR(255) NOT NULL,
    project_type VARCHAR(100),
    budget DECIMAL(15, 2),
    start_date VARCHAR(255),
    end_date VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    notes TEXT,
    total_spent DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_by VARCHAR(255) NOT NULL REFERENCES users(user_id),
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Shopping carts table
CREATE TABLE shopping_carts (
    cart_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    session_id VARCHAR(255),
    cart_name VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    project_id VARCHAR(255) REFERENCES projects(project_id),
    promo_code VARCHAR(100),
    promo_discount_amount DECIMAL(15, 2),
    promo_discount_type VARCHAR(50),
    reservation_expiry VARCHAR(255),
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Cart items table
CREATE TABLE cart_items (
    cart_item_id VARCHAR(255) PRIMARY KEY,
    cart_id VARCHAR(255) NOT NULL REFERENCES shopping_carts(cart_id),
    product_id VARCHAR(255) NOT NULL REFERENCES products(product_id),
    variant_id VARCHAR(255) REFERENCES product_variants(variant_id),
    supplier_id VARCHAR(255) NOT NULL REFERENCES suppliers(supplier_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    reserved_at VARCHAR(255),
    added_at VARCHAR(255) NOT NULL
);

-- Wishlists table
CREATE TABLE wishlists (
    wishlist_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    wishlist_name VARCHAR(255) NOT NULL DEFAULT 'My Wishlist',
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at VARCHAR(255) NOT NULL
);

-- Wishlist items table
CREATE TABLE wishlist_items (
    wishlist_item_id VARCHAR(255) PRIMARY KEY,
    wishlist_id VARCHAR(255) NOT NULL REFERENCES wishlists(wishlist_id),
    product_id VARCHAR(255) NOT NULL REFERENCES products(product_id),
    variant_id VARCHAR(255) REFERENCES product_variants(variant_id),
    added_at VARCHAR(255) NOT NULL,
    price_when_added DECIMAL(15, 2) NOT NULL,
    notes TEXT
);

-- Orders table
CREATE TABLE orders (
    order_id VARCHAR(255) PRIMARY KEY,
    order_number VARCHAR(255) UNIQUE NOT NULL,
    customer_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    supplier_id VARCHAR(255) NOT NULL REFERENCES suppliers(supplier_id),
    project_id VARCHAR(255) REFERENCES projects(project_id),
    delivery_address_id VARCHAR(255) NOT NULL REFERENCES addresses(address_id),
    billing_address_id VARCHAR(255) NOT NULL REFERENCES addresses(address_id),
    delivery_contact_name VARCHAR(255),
    delivery_contact_phone VARCHAR(50),
    delivery_instructions TEXT,
    delivery_window_start VARCHAR(255),
    delivery_window_end VARCHAR(255),
    delivery_method VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    payment_method_id VARCHAR(255) REFERENCES payment_methods(payment_method_id),
    subtotal DECIMAL(15, 2) NOT NULL,
    delivery_cost DECIMAL(15, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) NOT NULL,
    discount_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    promo_code VARCHAR(100),
    total_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    payment_transaction_id VARCHAR(255),
    payment_gateway VARCHAR(100),
    platform_fee DECIMAL(15, 2) NOT NULL,
    supplier_payout_amount DECIMAL(15, 2) NOT NULL,
    is_guest_order BOOLEAN NOT NULL DEFAULT false,
    guest_email VARCHAR(255),
    guest_phone VARCHAR(50),
    tracking_token VARCHAR(255) UNIQUE,
    placed_by VARCHAR(255) NOT NULL REFERENCES users(user_id),
    approved_by VARCHAR(255) REFERENCES users(user_id),
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    approval_status VARCHAR(50),
    notes TEXT,
    supplier_notes TEXT,
    admin_notes TEXT,
    estimated_delivery_date VARCHAR(255),
    actual_delivery_date VARCHAR(255),
    accepted_at VARCHAR(255),
    shipped_at VARCHAR(255),
    delivered_at VARCHAR(255),
    canceled_at VARCHAR(255),
    cancellation_reason TEXT,
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Order items table
CREATE TABLE order_items (
    order_item_id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL REFERENCES orders(order_id),
    product_id VARCHAR(255) NOT NULL REFERENCES products(product_id),
    variant_id VARCHAR(255) REFERENCES product_variants(variant_id),
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    sku VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    product_image_url TEXT
);

-- Inventory movements table
CREATE TABLE inventory_movements (
    movement_id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL REFERENCES products(product_id),
    variant_id VARCHAR(255) REFERENCES product_variants(variant_id),
    movement_type VARCHAR(50) NOT NULL,
    quantity_change INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    notes TEXT,
    related_order_id VARCHAR(255) REFERENCES orders(order_id),
    created_by VARCHAR(255) NOT NULL REFERENCES users(user_id),
    created_at VARCHAR(255) NOT NULL
);

-- Order status history table
CREATE TABLE order_status_history (
    history_id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL REFERENCES orders(order_id),
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    location VARCHAR(255),
    updated_by VARCHAR(255) NOT NULL REFERENCES users(user_id),
    created_at VARCHAR(255) NOT NULL
);

-- Deliveries table
CREATE TABLE deliveries (
    delivery_id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL REFERENCES orders(order_id),
    carrier_name VARCHAR(255),
    tracking_number VARCHAR(255),
    tracking_url TEXT,
    delivery_method VARCHAR(100) NOT NULL,
    scheduled_date VARCHAR(255),
    scheduled_window_start VARCHAR(255),
    scheduled_window_end VARCHAR(255),
    estimated_arrival_time VARCHAR(255),
    actual_delivery_time VARCHAR(255),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(50),
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    status VARCHAR(50) NOT NULL,
    delay_reason TEXT,
    proof_of_delivery_url TEXT,
    recipient_name VARCHAR(255),
    recipient_signature_url TEXT,
    delivery_photo_urls JSONB,
    delivery_notes TEXT,
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Delivery tracking updates table
CREATE TABLE delivery_tracking_updates (
    update_id VARCHAR(255) PRIMARY KEY,
    delivery_id VARCHAR(255) NOT NULL REFERENCES deliveries(delivery_id),
    status_message TEXT NOT NULL,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    checkpoint_date VARCHAR(255) NOT NULL,
    created_at VARCHAR(255) NOT NULL
);

-- Supplier delivery settings table
CREATE TABLE supplier_delivery_settings (
    setting_id VARCHAR(255) PRIMARY KEY,
    supplier_id VARCHAR(255) UNIQUE NOT NULL REFERENCES suppliers(supplier_id),
    delivery_coverage_type VARCHAR(50) NOT NULL,
    radius_miles DECIMAL(10, 2),
    postal_codes JSONB,
    pricing_method VARCHAR(50) NOT NULL,
    flat_rate_price DECIMAL(15, 2),
    distance_based_rates JSONB,
    free_delivery_threshold DECIMAL(15, 2),
    minimum_order_value DECIMAL(15, 2),
    available_days JSONB NOT NULL,
    time_windows JSONB NOT NULL,
    capacity_per_window INTEGER NOT NULL,
    lead_time_hours INTEGER NOT NULL,
    offers_same_day_delivery BOOLEAN NOT NULL DEFAULT false,
    offers_pickup BOOLEAN NOT NULL DEFAULT false,
    pickup_address TEXT,
    pickup_hours JSONB,
    uses_platform_logistics BOOLEAN NOT NULL DEFAULT false,
    third_party_carrier VARCHAR(255),
    gps_tracking_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Product reviews table
CREATE TABLE product_reviews (
    review_id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL REFERENCES products(product_id),
    order_id VARCHAR(255) NOT NULL REFERENCES orders(order_id),
    customer_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    rating INTEGER NOT NULL,
    title VARCHAR(255),
    review_text TEXT NOT NULL,
    is_recommended BOOLEAN,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT true,
    helpful_count INTEGER NOT NULL DEFAULT 0,
    photo_urls JSONB,
    video_url TEXT,
    supplier_response TEXT,
    supplier_response_date VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    flagged_reason TEXT,
    moderation_notes TEXT,
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Supplier reviews table
CREATE TABLE supplier_reviews (
    review_id VARCHAR(255) PRIMARY KEY,
    supplier_id VARCHAR(255) NOT NULL REFERENCES suppliers(supplier_id),
    order_id VARCHAR(255) NOT NULL REFERENCES orders(order_id),
    customer_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    overall_rating INTEGER NOT NULL,
    product_quality_rating INTEGER NOT NULL,
    delivery_rating INTEGER NOT NULL,
    customer_service_rating INTEGER NOT NULL,
    review_text TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    photo_urls JSONB,
    supplier_response TEXT,
    supplier_response_date VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Review helpful votes table
CREATE TABLE review_helpful_votes (
    vote_id VARCHAR(255) PRIMARY KEY,
    review_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    is_helpful BOOLEAN NOT NULL,
    created_at VARCHAR(255) NOT NULL
);

-- Returns table
CREATE TABLE returns (
    return_id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL REFERENCES orders(order_id),
    order_item_id VARCHAR(255) NOT NULL REFERENCES order_items(order_item_id),
    customer_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    supplier_id VARCHAR(255) NOT NULL REFERENCES suppliers(supplier_id),
    return_reason VARCHAR(255) NOT NULL,
    detailed_description TEXT,
    photo_urls JSONB,
    quantity INTEGER NOT NULL,
    refund_amount DECIMAL(15, 2) NOT NULL,
    return_method VARCHAR(100),
    return_address TEXT,
    return_shipping_label_url TEXT,
    return_tracking_number VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    supplier_decision VARCHAR(100),
    supplier_notes TEXT,
    decline_reason TEXT,
    item_received_at VARCHAR(255),
    inspection_notes TEXT,
    requested_at VARCHAR(255) NOT NULL,
    approved_at VARCHAR(255),
    completed_at VARCHAR(255)
);

-- Refunds table
CREATE TABLE refunds (
    refund_id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL REFERENCES orders(order_id),
    return_id VARCHAR(255) REFERENCES returns(return_id),
    customer_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    refund_amount DECIMAL(15, 2) NOT NULL,
    refund_type VARCHAR(50) NOT NULL,
    refund_method VARCHAR(100) NOT NULL,
    payment_transaction_id VARCHAR(255),
    refund_transaction_id VARCHAR(255),
    restocking_fee DECIMAL(15, 2) NOT NULL DEFAULT 0,
    refund_reason TEXT NOT NULL,
    breakdown JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    processed_by VARCHAR(255) REFERENCES users(user_id),
    requested_at VARCHAR(255) NOT NULL,
    processed_at VARCHAR(255),
    completed_at VARCHAR(255)
);

-- Disputes table
CREATE TABLE disputes (
    dispute_id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL REFERENCES orders(order_id),
    customer_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    supplier_id VARCHAR(255) NOT NULL REFERENCES suppliers(supplier_id),
    dispute_type VARCHAR(100) NOT NULL,
    customer_claim TEXT NOT NULL,
    customer_evidence_urls JSONB,
    supplier_response TEXT,
    supplier_evidence_urls JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    assigned_to VARCHAR(255) REFERENCES users(user_id),
    admin_review_notes TEXT,
    resolution_decision VARCHAR(255),
    resolution_description TEXT,
    refund_amount DECIMAL(15, 2),
    opened_at VARCHAR(255) NOT NULL,
    resolved_at VARCHAR(255),
    closed_at VARCHAR(255)
);

-- Conversations table
CREATE TABLE conversations (
    conversation_id VARCHAR(255) PRIMARY KEY,
    participant_1_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    participant_2_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    related_order_id VARCHAR(255) REFERENCES orders(order_id),
    related_product_id VARCHAR(255) REFERENCES products(product_id),
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    last_message_at VARCHAR(255),
    created_at VARCHAR(255) NOT NULL
);

-- Messages table
CREATE TABLE messages (
    message_id VARCHAR(255) PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL REFERENCES conversations(conversation_id),
    sender_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    message_text TEXT NOT NULL,
    attachment_urls JSONB,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at VARCHAR(255),
    sent_at VARCHAR(255) NOT NULL
);

-- Notifications table
CREATE TABLE notifications (
    notification_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    icon_type VARCHAR(50) NOT NULL,
    related_entity_type VARCHAR(100),
    related_entity_id VARCHAR(255),
    action_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at VARCHAR(255),
    created_at VARCHAR(255) NOT NULL
);

-- Project materials table
CREATE TABLE project_materials (
    material_id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(project_id),
    product_id VARCHAR(255) NOT NULL REFERENCES products(product_id),
    variant_id VARCHAR(255) REFERENCES product_variants(variant_id),
    quantity_needed INTEGER NOT NULL,
    quantity_ordered INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    added_at VARCHAR(255) NOT NULL
);

-- Project documents table
CREATE TABLE project_documents (
    document_id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(project_id),
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by VARCHAR(255) NOT NULL REFERENCES users(user_id),
    uploaded_at VARCHAR(255) NOT NULL
);

-- Promotions table
CREATE TABLE promotions (
    promotion_id VARCHAR(255) PRIMARY KEY,
    supplier_id VARCHAR(255) NOT NULL REFERENCES suppliers(supplier_id),
    promotion_name VARCHAR(255) NOT NULL,
    promotion_type VARCHAR(100) NOT NULL,
    discount_code VARCHAR(100) UNIQUE,
    discount_type VARCHAR(50) NOT NULL,
    discount_value DECIMAL(15, 2) NOT NULL,
    minimum_purchase_amount DECIMAL(15, 2),
    applicable_product_ids JSONB,
    applicable_category_ids JSONB,
    customer_eligibility VARCHAR(50) NOT NULL DEFAULT 'all',
    start_date VARCHAR(255) NOT NULL,
    end_date VARCHAR(255),
    total_usage_limit INTEGER,
    per_customer_limit INTEGER,
    current_usage_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    show_on_shop_page BOOLEAN NOT NULL DEFAULT false,
    show_on_product_pages BOOLEAN NOT NULL DEFAULT false,
    email_to_followers BOOLEAN NOT NULL DEFAULT false,
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Promotion usage table
CREATE TABLE promotion_usage (
    usage_id VARCHAR(255) PRIMARY KEY,
    promotion_id VARCHAR(255) NOT NULL REFERENCES promotions(promotion_id),
    order_id VARCHAR(255) NOT NULL REFERENCES orders(order_id),
    customer_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    discount_amount DECIMAL(15, 2) NOT NULL,
    used_at VARCHAR(255) NOT NULL
);

-- Trade credit applications table
CREATE TABLE trade_credit_applications (
    application_id VARCHAR(255) PRIMARY KEY,
    business_account_id VARCHAR(255) NOT NULL REFERENCES business_accounts(business_account_id),
    requested_credit_limit DECIMAL(15, 2) NOT NULL,
    desired_terms VARCHAR(100) NOT NULL,
    business_financials JSONB,
    bank_references JSONB,
    trade_references JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    approved_credit_limit DECIMAL(15, 2),
    approved_terms VARCHAR(100),
    rejection_reason TEXT,
    reviewed_by VARCHAR(255) REFERENCES users(user_id),
    submitted_at VARCHAR(255) NOT NULL,
    reviewed_at VARCHAR(255)
);

-- Trade credit accounts table
CREATE TABLE trade_credit_accounts (
    credit_account_id VARCHAR(255) PRIMARY KEY,
    business_account_id VARCHAR(255) UNIQUE NOT NULL REFERENCES business_accounts(business_account_id),
    credit_limit DECIMAL(15, 2) NOT NULL,
    available_credit DECIMAL(15, 2) NOT NULL,
    credit_terms VARCHAR(100) NOT NULL,
    outstanding_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Credit invoices table
CREATE TABLE credit_invoices (
    invoice_id VARCHAR(255) PRIMARY KEY,
    credit_account_id VARCHAR(255) NOT NULL REFERENCES trade_credit_accounts(credit_account_id),
    order_id VARCHAR(255) NOT NULL REFERENCES orders(order_id),
    invoice_number VARCHAR(255) UNIQUE NOT NULL,
    invoice_amount DECIMAL(15, 2) NOT NULL,
    due_date VARCHAR(255) NOT NULL,
    paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'outstanding',
    issued_at VARCHAR(255) NOT NULL,
    paid_at VARCHAR(255)
);

-- Credit payments table
CREATE TABLE credit_payments (
    payment_id VARCHAR(255) PRIMARY KEY,
    invoice_id VARCHAR(255) NOT NULL REFERENCES credit_invoices(invoice_id),
    credit_account_id VARCHAR(255) NOT NULL REFERENCES trade_credit_accounts(credit_account_id),
    payment_amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    payment_transaction_id VARCHAR(255),
    payment_date VARCHAR(255) NOT NULL,
    created_at VARCHAR(255) NOT NULL
);

-- Payouts table
CREATE TABLE payouts (
    payout_id VARCHAR(255) PRIMARY KEY,
    supplier_id VARCHAR(255) NOT NULL REFERENCES suppliers(supplier_id),
    period_start VARCHAR(255) NOT NULL,
    period_end VARCHAR(255) NOT NULL,
    gross_amount DECIMAL(15, 2) NOT NULL,
    platform_fees DECIMAL(15, 2) NOT NULL,
    payment_processing_fees DECIMAL(15, 2) NOT NULL,
    refunds_deducted DECIMAL(15, 2) NOT NULL DEFAULT 0,
    chargebacks_deducted DECIMAL(15, 2) NOT NULL DEFAULT 0,
    net_amount DECIMAL(15, 2) NOT NULL,
    order_count INTEGER NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    bank_account_last_four VARCHAR(4) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    bank_transfer_id VARCHAR(255),
    scheduled_date VARCHAR(255) NOT NULL,
    paid_date VARCHAR(255),
    created_at VARCHAR(255) NOT NULL
);

-- Payout line items table
CREATE TABLE payout_line_items (
    line_item_id VARCHAR(255) PRIMARY KEY,
    payout_id VARCHAR(255) NOT NULL REFERENCES payouts(payout_id),
    order_id VARCHAR(255) NOT NULL REFERENCES orders(order_id),
    order_date VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    order_amount DECIMAL(15, 2) NOT NULL,
    platform_fee DECIMAL(15, 2) NOT NULL,
    net_amount DECIMAL(15, 2) NOT NULL
);

-- Secondary marketplace listings table
CREATE TABLE secondary_marketplace_listings (
    listing_id VARCHAR(255) PRIMARY KEY,
    seller_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    product_description TEXT NOT NULL,
    category_id VARCHAR(255) NOT NULL REFERENCES categories(category_id),
    quantity INTEGER NOT NULL,
    condition VARCHAR(100) NOT NULL,
    original_purchase_date VARCHAR(255),
    asking_price DECIMAL(15, 2) NOT NULL,
    is_negotiable BOOLEAN NOT NULL DEFAULT false,
    postal_code VARCHAR(50) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    offers_delivery BOOLEAN NOT NULL DEFAULT false,
    offers_pickup BOOLEAN NOT NULL DEFAULT true,
    pickup_location TEXT,
    photo_urls JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    view_count INTEGER NOT NULL DEFAULT 0,
    marked_sold_at VARCHAR(255),
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Forum threads table
CREATE TABLE forum_threads (
    thread_id VARCHAR(255) PRIMARY KEY,
    topic_category VARCHAR(100) NOT NULL,
    author_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    images JSONB,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    has_solution BOOLEAN NOT NULL DEFAULT false,
    solution_post_id VARCHAR(255),
    view_count INTEGER NOT NULL DEFAULT 0,
    reply_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    last_activity_at VARCHAR(255) NOT NULL,
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Forum posts table
CREATE TABLE forum_posts (
    post_id VARCHAR(255) PRIMARY KEY,
    thread_id VARCHAR(255) NOT NULL REFERENCES forum_threads(thread_id),
    author_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    content TEXT NOT NULL,
    images JSONB,
    is_solution BOOLEAN NOT NULL DEFAULT false,
    like_count INTEGER NOT NULL DEFAULT 0,
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Forum likes table
CREATE TABLE forum_likes (
    like_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    created_at VARCHAR(255) NOT NULL
);

-- How-to guides table
CREATE TABLE how_to_guides (
    guide_id VARCHAR(255) PRIMARY KEY,
    author_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    skill_level VARCHAR(50) NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    time_required VARCHAR(100),
    introduction TEXT NOT NULL,
    steps JSONB NOT NULL,
    materials_list JSONB,
    cover_image_url TEXT,
    video_url TEXT,
    rating_average DECIMAL(3, 2) NOT NULL DEFAULT 0,
    rating_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    save_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Guide ratings table
CREATE TABLE guide_ratings (
    rating_id VARCHAR(255) PRIMARY KEY,
    guide_id VARCHAR(255) NOT NULL REFERENCES how_to_guides(guide_id),
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    rating INTEGER NOT NULL,
    review_text TEXT,
    created_at VARCHAR(255) NOT NULL
);

-- Project showcases table
CREATE TABLE project_showcases (
    showcase_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    before_photos JSONB,
    after_photos JSONB NOT NULL,
    materials_used JSONB,
    estimated_cost DECIMAL(15, 2),
    project_duration VARCHAR(100),
    like_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at VARCHAR(255) NOT NULL
);

-- Showcase likes table
CREATE TABLE showcase_likes (
    like_id VARCHAR(255) PRIMARY KEY,
    showcase_id VARCHAR(255) NOT NULL REFERENCES project_showcases(showcase_id),
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    created_at VARCHAR(255) NOT NULL
);

-- Showcase comments table
CREATE TABLE showcase_comments (
    comment_id VARCHAR(255) PRIMARY KEY,
    showcase_id VARCHAR(255) NOT NULL REFERENCES project_showcases(showcase_id),
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    comment_text TEXT NOT NULL,
    created_at VARCHAR(255) NOT NULL
);

-- Support tickets table
CREATE TABLE support_tickets (
    ticket_id VARCHAR(255) PRIMARY KEY,
    ticket_number VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    assigned_to VARCHAR(255) REFERENCES users(user_id),
    related_order_id VARCHAR(255) REFERENCES orders(order_id),
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL,
    resolved_at VARCHAR(255),
    closed_at VARCHAR(255)
);

-- Ticket responses table
CREATE TABLE ticket_responses (
    response_id VARCHAR(255) PRIMARY KEY,
    ticket_id VARCHAR(255) NOT NULL REFERENCES support_tickets(ticket_id),
    responder_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    response_text TEXT NOT NULL,
    attachment_urls JSONB,
    is_internal BOOLEAN NOT NULL DEFAULT false,
    created_at VARCHAR(255) NOT NULL
);

-- Canned responses table
CREATE TABLE canned_responses (
    response_id VARCHAR(255) PRIMARY KEY,
    supplier_id VARCHAR(255) NOT NULL REFERENCES suppliers(supplier_id),
    response_name VARCHAR(255) NOT NULL,
    message_text TEXT NOT NULL,
    category_tag VARCHAR(100),
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Announcements table
CREATE TABLE announcements (
    announcement_id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_audience VARCHAR(100) NOT NULL,
    audience_filter JSONB,
    delivery_methods JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    scheduled_for VARCHAR(255),
    sent_at VARCHAR(255),
    recipient_count INTEGER,
    open_rate DECIMAL(5, 2),
    click_rate DECIMAL(5, 2),
    created_by VARCHAR(255) NOT NULL REFERENCES users(user_id),
    created_at VARCHAR(255) NOT NULL
);

-- User preferences table
CREATE TABLE user_preferences (
    preference_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(user_id),
    preferred_brands JSONB,
    preferred_suppliers JSONB,
    category_interests JSONB,
    preferred_units VARCHAR(50) NOT NULL DEFAULT 'imperial',
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    timezone VARCHAR(100),
    email_notifications JSONB NOT NULL,
    sms_notifications JSONB NOT NULL,
    push_notifications JSONB NOT NULL,
    marketing_emails_opt_in BOOLEAN NOT NULL DEFAULT false,
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Supplier followers table
CREATE TABLE supplier_followers (
    follow_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    supplier_id VARCHAR(255) NOT NULL REFERENCES suppliers(supplier_id),
    notify_new_products BOOLEAN NOT NULL DEFAULT true,
    notify_promotions BOOLEAN NOT NULL DEFAULT true,
    followed_at VARCHAR(255) NOT NULL
);

-- Approval workflows table
CREATE TABLE approval_workflows (
    workflow_id VARCHAR(255) PRIMARY KEY,
    business_account_id VARCHAR(255) NOT NULL REFERENCES business_accounts(business_account_id),
    threshold_amount DECIMAL(15, 2) NOT NULL,
    approver_ids JSONB NOT NULL,
    require_all_approvers BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at VARCHAR(255) NOT NULL
);

-- Order approvals table
CREATE TABLE order_approvals (
    approval_id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL REFERENCES orders(order_id),
    workflow_id VARCHAR(255) NOT NULL REFERENCES approval_workflows(workflow_id),
    approver_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    decision_notes TEXT,
    requested_at VARCHAR(255) NOT NULL,
    decided_at VARCHAR(255)
);

-- Platform settings table
CREATE TABLE platform_settings (
    setting_id VARCHAR(255) PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type VARCHAR(50) NOT NULL,
    description TEXT,
    updated_by VARCHAR(255) NOT NULL REFERENCES users(user_id),
    updated_at VARCHAR(255) NOT NULL
);

-- Activity logs table
CREATE TABLE activity_logs (
    log_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    activity_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at VARCHAR(255) NOT NULL
);

-- Search analytics table
CREATE TABLE search_analytics (
    search_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    session_id VARCHAR(255),
    search_query TEXT NOT NULL,
    filters_applied JSONB,
    results_count INTEGER NOT NULL,
    clicked_product_ids JSONB,
    resulted_in_purchase BOOLEAN NOT NULL DEFAULT false,
    searched_at VARCHAR(255) NOT NULL
);

-- Page views table
CREATE TABLE page_views (
    view_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    session_id VARCHAR(255) NOT NULL,
    page_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    referrer_url TEXT,
    duration_seconds INTEGER,
    viewed_at VARCHAR(255) NOT NULL
);

-- Bank accounts table
CREATE TABLE bank_accounts (
    bank_account_id VARCHAR(255) PRIMARY KEY,
    supplier_id VARCHAR(255) UNIQUE NOT NULL REFERENCES suppliers(supplier_id),
    account_holder_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number_last_four VARCHAR(4) NOT NULL,
    routing_number VARCHAR(50) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_method VARCHAR(100),
    verification_date VARCHAR(255),
    created_at VARCHAR(255) NOT NULL
);

-- Supplier inventory alerts table
CREATE TABLE supplier_inventory_alerts (
    alert_id VARCHAR(255) PRIMARY KEY,
    supplier_id VARCHAR(255) NOT NULL REFERENCES suppliers(supplier_id),
    product_id VARCHAR(255) NOT NULL REFERENCES products(product_id),
    alert_type VARCHAR(100) NOT NULL,
    threshold_value DECIMAL(15, 2) NOT NULL,
    current_value DECIMAL(15, 2) NOT NULL,
    is_acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_at VARCHAR(255),
    created_at VARCHAR(255) NOT NULL
);

-- Price drop alerts table
CREATE TABLE price_drop_alerts (
    alert_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    product_id VARCHAR(255) NOT NULL REFERENCES products(product_id),
    original_price DECIMAL(15, 2) NOT NULL,
    alert_price DECIMAL(15, 2) NOT NULL,
    current_price DECIMAL(15, 2) NOT NULL,
    is_notified BOOLEAN NOT NULL DEFAULT false,
    notified_at VARCHAR(255),
    created_at VARCHAR(255) NOT NULL
);

-- Back in stock alerts table
CREATE TABLE back_in_stock_alerts (
    alert_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    product_id VARCHAR(255) NOT NULL REFERENCES products(product_id),
    variant_id VARCHAR(255) REFERENCES product_variants(variant_id),
    is_notified BOOLEAN NOT NULL DEFAULT false,
    notified_at VARCHAR(255),
    created_at VARCHAR(255) NOT NULL
);

-- Recurring orders table
CREATE TABLE recurring_orders (
    recurring_order_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    order_name VARCHAR(255) NOT NULL,
    items JSONB NOT NULL,
    delivery_address_id VARCHAR(255) NOT NULL REFERENCES addresses(address_id),
    payment_method_id VARCHAR(255) NOT NULL REFERENCES payment_methods(payment_method_id),
    frequency VARCHAR(50) NOT NULL,
    next_order_date VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    last_order_id VARCHAR(255) REFERENCES orders(order_id),
    last_processed_at VARCHAR(255),
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

-- Saved carts table
CREATE TABLE saved_carts (
    saved_cart_id VARCHAR(255) PRIMARY KEY,
    cart_id VARCHAR(255) NOT NULL REFERENCES shopping_carts(cart_id),
    saved_by VARCHAR(255) NOT NULL REFERENCES users(user_id),
    saved_at VARCHAR(255) NOT NULL
);

-- ========================================
-- SEED DATA
-- ========================================

-- Insert users (customers, suppliers, admins, team members)
INSERT INTO users (user_id, email, phone, password_hash, name, role, account_type, email_verified, phone_verified, profile_photo_url, status, last_login, created_at, updated_at) VALUES
('user_001', 'john.contractor@email.com', '+1-555-0101', 'password123', 'John Anderson', 'customer', 'business', true, true, 'https://picsum.photos/seed/user001/200', 'active', '2024-01-15T10:30:00Z', '2023-06-15T08:00:00Z', '2024-01-15T10:30:00Z'),
('user_002', 'sarah.builder@email.com', '+1-555-0102', 'password123', 'Sarah Mitchell', 'customer', 'business', true, true, 'https://picsum.photos/seed/user002/200', 'active', '2024-01-14T15:20:00Z', '2023-07-20T09:00:00Z', '2024-01-14T15:20:00Z'),
('user_003', 'mike.homeowner@email.com', '+1-555-0103', 'password123', 'Mike Thompson', 'customer', 'personal', true, false, 'https://picsum.photos/seed/user003/200', 'active', '2024-01-13T11:45:00Z', '2023-08-10T10:30:00Z', '2024-01-13T11:45:00Z'),
('user_004', 'emily.renovator@email.com', '+1-555-0104', 'password123', 'Emily Davis', 'customer', 'personal', true, true, 'https://picsum.photos/seed/user004/200', 'active', '2024-01-12T14:00:00Z', '2023-09-05T11:00:00Z', '2024-01-12T14:00:00Z'),
('user_005', 'robert.builder@email.com', '+1-555-0105', 'password123', 'Robert Wilson', 'customer', 'business', true, true, 'https://picsum.photos/seed/user005/200', 'active', '2024-01-10T09:30:00Z', '2023-05-12T08:00:00Z', '2024-01-10T09:30:00Z'),
('user_006', 'supplier.acme@email.com', '+1-555-0201', 'supplier123', 'David Johnson', 'supplier', 'business', true, true, 'https://picsum.photos/seed/user006/200', 'active', '2024-01-15T08:00:00Z', '2023-04-01T07:00:00Z', '2024-01-15T08:00:00Z'),
('user_007', 'supplier.probuilding@email.com', '+1-555-0202', 'supplier123', 'Lisa Martinez', 'supplier', 'business', true, true, 'https://picsum.photos/seed/user007/200', 'active', '2024-01-15T07:30:00Z', '2023-04-15T07:00:00Z', '2024-01-15T07:30:00Z'),
('user_008', 'supplier.quality@email.com', '+1-555-0203', 'supplier123', 'James Brown', 'supplier', 'business', true, true, 'https://picsum.photos/seed/user008/200', 'active', '2024-01-14T16:00:00Z', '2023-05-01T07:00:00Z', '2024-01-14T16:00:00Z'),
('user_009', 'supplier.elite@email.com', '+1-555-0204', 'supplier123', 'Maria Garcia', 'supplier', 'business', true, true, 'https://picsum.photos/seed/user009/200', 'active', '2024-01-14T14:30:00Z', '2023-05-20T07:00:00Z', '2024-01-14T14:30:00Z'),
('user_010', 'supplier.builders@email.com', '+1-555-0205', 'supplier123', 'Kevin Lee', 'supplier', 'business', true, true, 'https://picsum.photos/seed/user010/200', 'active', '2024-01-13T13:00:00Z', '2023-06-01T07:00:00Z', '2024-01-13T13:00:00Z'),
('user_011', 'admin@platform.com', '+1-555-0301', 'admin123', 'Admin User', 'admin', 'personal', true, true, 'https://picsum.photos/seed/user011/200', 'active', '2024-01-15T12:00:00Z', '2023-01-01T00:00:00Z', '2024-01-15T12:00:00Z'),
('user_012', 'support@platform.com', '+1-555-0302', 'admin123', 'Support Team', 'admin', 'personal', true, true, 'https://picsum.photos/seed/user012/200', 'active', '2024-01-15T11:00:00Z', '2023-01-01T00:00:00Z', '2024-01-15T11:00:00Z'),
('user_013', 'jennifer.assistant@email.com', '+1-555-0106', 'password123', 'Jennifer Clark', 'customer', 'business', true, true, 'https://picsum.photos/seed/user013/200', 'active', '2024-01-11T10:00:00Z', '2023-10-01T09:00:00Z', '2024-01-11T10:00:00Z'),
('user_014', 'thomas.buyer@email.com', '+1-555-0107', 'password123', 'Thomas White', 'customer', 'personal', true, true, 'https://picsum.photos/seed/user014/200', 'active', '2024-01-10T08:00:00Z', '2023-11-15T10:00:00Z', '2024-01-10T08:00:00Z'),
('user_015', 'amanda.designer@email.com', '+1-555-0108', 'password123', 'Amanda Rodriguez', 'customer', 'personal', true, false, 'https://picsum.photos/seed/user015/200', 'active', '2024-01-09T16:00:00Z', '2023-12-01T11:00:00Z', '2024-01-09T16:00:00Z');

-- Insert addresses
INSERT INTO addresses (address_id, user_id, address_label, address_line_1, address_line_2, city, state, postal_code, country, latitude, longitude, is_default, contact_name, contact_phone, delivery_instructions, created_at, updated_at) VALUES
('addr_001', 'user_001', 'Office', '123 Construction Ave', 'Suite 100', 'Austin', 'TX', '78701', 'USA', 30.2672, -97.7431, true, 'John Anderson', '+1-555-0101', 'Deliver to loading dock in rear', '2023-06-15T08:00:00Z', '2023-06-15T08:00:00Z'),
('addr_002', 'user_002', 'Main Site', '456 Builder Blvd', NULL, 'Dallas', 'TX', '75201', 'USA', 32.7767, -96.7970, true, 'Sarah Mitchell', '+1-555-0102', 'Call upon arrival', '2023-07-20T09:00:00Z', '2023-07-20T09:00:00Z'),
('addr_003', 'user_003', 'Home', '789 Oak Street', NULL, 'Houston', 'TX', '77001', 'USA', 29.7604, -95.3698, true, 'Mike Thompson', '+1-555-0103', 'Leave at front porch if not home', '2023-08-10T10:30:00Z', '2023-08-10T10:30:00Z'),
('addr_004', 'user_004', 'Renovation Site', '321 Pine Road', 'Unit 5', 'San Antonio', 'TX', '78201', 'USA', 29.4241, -98.4936, true, 'Emily Davis', '+1-555-0104', 'Gate code: 1234', '2023-09-05T11:00:00Z', '2023-09-05T11:00:00Z'),
('addr_005', 'user_005', 'Warehouse', '555 Industrial Pkwy', NULL, 'Austin', 'TX', '78702', 'USA', 30.2550, -97.7200, true, 'Robert Wilson', '+1-555-0105', 'Dock B available 8am-5pm', '2023-05-12T08:00:00Z', '2023-05-12T08:00:00Z'),
('addr_006', 'user_006', 'Business', '777 Supply Street', NULL, 'Austin', 'TX', '78703', 'USA', 30.2800, -97.7500, true, 'David Johnson', '+1-555-0201', NULL, '2023-04-01T07:00:00Z', '2023-04-01T07:00:00Z'),
('addr_007', 'user_007', 'Store', '888 Materials Lane', NULL, 'Dallas', 'TX', '75202', 'USA', 32.7850, -96.8000, true, 'Lisa Martinez', '+1-555-0202', NULL, '2023-04-15T07:00:00Z', '2023-04-15T07:00:00Z'),
('addr_008', 'user_008', 'Headquarters', '999 Quality Drive', NULL, 'Houston', 'TX', '77002', 'USA', 29.7700, -95.3800, true, 'James Brown', '+1-555-0203', NULL, '2023-05-01T07:00:00Z', '2023-05-01T07:00:00Z'),
('addr_009', 'user_009', 'Shop', '111 Elite Avenue', NULL, 'San Antonio', 'TX', '78202', 'USA', 29.4300, -98.5000, true, 'Maria Garcia', '+1-555-0204', NULL, '2023-05-20T07:00:00Z', '2023-05-20T07:00:00Z'),
('addr_010', 'user_010', 'Showroom', '222 Builders Way', NULL, 'Austin', 'TX', '78704', 'USA', 30.2400, -97.7600, true, 'Kevin Lee', '+1-555-0205', NULL, '2023-06-01T07:00:00Z', '2023-06-01T07:00:00Z');

-- Insert business accounts
INSERT INTO business_accounts (business_account_id, user_id, company_name, company_registration_number, tax_id, billing_address_id, tax_exempt, tax_exemption_document_url, created_at, updated_at) VALUES
('biz_001', 'user_001', 'Anderson Construction LLC', 'REG123456', 'TAX-001-456', 'addr_001', false, NULL, '2023-06-15T08:00:00Z', '2023-06-15T08:00:00Z'),
('biz_002', 'user_002', 'Mitchell Builders Inc', 'REG234567', 'TAX-002-567', 'addr_002', false, NULL, '2023-07-20T09:00:00Z', '2023-07-20T09:00:00Z'),
('biz_003', 'user_005', 'Wilson Development Corp', 'REG345678', 'TAX-003-678', 'addr_005', true, 'https://picsum.photos/seed/taxdoc003/400', '2023-05-12T08:00:00Z', '2023-05-12T08:00:00Z');

-- Insert team members
INSERT INTO team_members (team_member_id, business_account_id, user_id, role, spending_limit, status, invited_by, invited_at, joined_at) VALUES
('team_001', 'biz_001', 'user_013', 'buyer', 5000.00, 'active', 'user_001', '2023-10-01T09:00:00Z', '2023-10-02T10:00:00Z'),
('team_002', 'biz_002', 'user_014', 'viewer', NULL, 'active', 'user_002', '2023-11-15T10:00:00Z', '2023-11-16T11:00:00Z');

-- Insert suppliers
INSERT INTO suppliers (supplier_id, user_id, shop_name, shop_slug, shop_description, shop_logo_url, shop_cover_image_url, business_address, contact_email, contact_phone, website_url, business_hours, holiday_schedule, about_section, certifications, social_media_links, return_policy, shipping_policy, privacy_policy, terms_and_conditions, rating_average, rating_count, is_verified, verification_date, status, commission_rate, average_response_time_minutes, on_time_delivery_percentage, order_fulfillment_rate, created_at, updated_at) VALUES
('sup_001', 'user_006', 'ACME Building Supplies', 'acme-building-supplies', 'Your trusted partner for quality building materials', 'https://picsum.photos/seed/sup001logo/300', 'https://picsum.photos/seed/sup001cover/1200/400', '777 Supply Street, Austin, TX 78703', 'contact@acmebuilding.com', '+1-555-0201', 'https://acmebuilding.com', '{"monday": "7:00-18:00", "tuesday": "7:00-18:00", "wednesday": "7:00-18:00", "thursday": "7:00-18:00", "friday": "7:00-18:00", "saturday": "8:00-16:00", "sunday": "closed"}', '["2024-01-01", "2024-07-04", "2024-12-25"]', 'ACME Building Supplies has been serving contractors and homeowners since 1985. We pride ourselves on quality products and excellent service.', '["ISO 9001", "Green Building Certified"]', '{"facebook": "https://facebook.com/acmebuilding", "instagram": "https://instagram.com/acmebuilding"}', 'Returns accepted within 30 days with receipt. Restocking fee may apply.', 'Free delivery on orders over $500 within 25 miles. Same-day delivery available.', 'We respect your privacy and protect your data.', 'By ordering, you agree to our terms and conditions.', 4.7, 287, true, '2023-05-01T00:00:00Z', 'active', 8.5, 45, 96.5, 98.2, '2023-04-01T07:00:00Z', '2024-01-15T08:00:00Z'),
('sup_002', 'user_007', 'Pro Building Materials', 'pro-building-materials', 'Professional grade materials for serious builders', 'https://picsum.photos/seed/sup002logo/300', 'https://picsum.photos/seed/sup002cover/1200/400', '888 Materials Lane, Dallas, TX 75202', 'sales@probuilding.com', '+1-555-0202', 'https://probuilding.com', '{"monday": "6:00-19:00", "tuesday": "6:00-19:00", "wednesday": "6:00-19:00", "thursday": "6:00-19:00", "friday": "6:00-19:00", "saturday": "7:00-17:00", "sunday": "9:00-14:00"}', '["2024-01-01", "2024-12-25"]', 'Pro Building Materials specializes in professional-grade construction materials for commercial and residential projects.', '["LEED Certified", "EPA Approved"]', '{"facebook": "https://facebook.com/probuilding", "twitter": "https://twitter.com/probuilding"}', '30-day return policy on unopened items. Custom orders are non-returnable.', 'Delivery available within 50 mile radius. Expedited shipping options available.', 'Your privacy is important to us.', 'Please read our complete terms before ordering.', 4.5, 198, true, '2023-06-01T00:00:00Z', 'active', 9.0, 60, 94.0, 96.5, '2023-04-15T07:00:00Z', '2024-01-15T07:30:00Z'),
('sup_003', 'user_008', 'Quality Hardware & Tools', 'quality-hardware-tools', 'Everything you need for your construction project', 'https://picsum.photos/seed/sup003logo/300', 'https://picsum.photos/seed/sup003cover/1200/400', '999 Quality Drive, Houston, TX 77002', 'info@qualityhardware.com', '+1-555-0203', 'https://qualityhardware.com', '{"monday": "8:00-17:00", "tuesday": "8:00-17:00", "wednesday": "8:00-17:00", "thursday": "8:00-17:00", "friday": "8:00-17:00", "saturday": "9:00-15:00", "sunday": "closed"}', '["2024-01-01", "2024-07-04", "2024-11-28", "2024-12-25"]', 'Quality Hardware & Tools offers the finest selection of tools and hardware for professionals and DIY enthusiasts.', '["BBB Accredited", "Trade Certified"]', '{"instagram": "https://instagram.com/qualityhardware", "linkedin": "https://linkedin.com/company/qualityhardware"}', 'Returns within 60 days with original packaging. Power tools must be unused.', 'Free shipping on orders over $300. Next-day delivery available in Houston area.', 'We protect your personal information.', 'Terms apply to all purchases.', 4.8, 342, true, '2023-06-15T00:00:00Z', 'active', 7.5, 30, 97.5, 99.0, '2023-05-01T07:00:00Z', '2024-01-14T16:00:00Z'),
('sup_004', 'user_009', 'Elite Lumber & Materials', 'elite-lumber-materials', 'Premium lumber and building materials', 'https://picsum.photos/seed/sup004logo/300', 'https://picsum.photos/seed/sup004cover/1200/400', '111 Elite Avenue, San Antonio, TX 78202', 'orders@elitelumber.com', '+1-555-0204', 'https://elitelumber.com', '{"monday": "7:00-18:00", "tuesday": "7:00-18:00", "wednesday": "7:00-18:00", "thursday": "7:00-18:00", "friday": "7:00-18:00", "saturday": "8:00-16:00", "sunday": "closed"}', '["2024-01-01", "2024-12-25"]', 'Elite Lumber & Materials provides premium quality lumber and building materials to contractors across Texas.', '["FSC Certified", "SFI Certified"]', '{"facebook": "https://facebook.com/elitelumber"}', 'Returns accepted on unused materials within 14 days.', 'Delivery available. Large orders may qualify for free delivery.', 'Privacy policy available on our website.', 'Standard terms and conditions apply.', 4.6, 156, true, '2023-07-01T00:00:00Z', 'active', 8.0, 50, 95.0, 97.0, '2023-05-20T07:00:00Z', '2024-01-14T14:30:00Z'),
('sup_005', 'user_010', 'Builders Depot', 'builders-depot', 'One-stop shop for all construction needs', 'https://picsum.photos/seed/sup005logo/300', 'https://picsum.photos/seed/sup005cover/1200/400', '222 Builders Way, Austin, TX 78704', 'support@buildersdepot.com', '+1-555-0205', 'https://buildersdepot.com', '{"monday": "6:30-19:00", "tuesday": "6:30-19:00", "wednesday": "6:30-19:00", "thursday": "6:30-19:00", "friday": "6:30-19:00", "saturday": "7:00-18:00", "sunday": "9:00-15:00"}', '["2024-01-01", "2024-07-04", "2024-12-25"]', 'Builders Depot is your complete construction supply center with everything from lumber to finishing materials.', '["Green Certified", "Eco-Friendly"]', '{"facebook": "https://facebook.com/buildersdepot", "instagram": "https://instagram.com/buildersdepot", "youtube": "https://youtube.com/buildersdepot"}', 'Easy returns within 45 days. See store for details.', 'Same-day delivery available on most items. Free delivery over $750.', 'We value your privacy and data security.', 'Terms of service apply to all transactions.', 4.9, 421, true, '2023-07-15T00:00:00Z', 'active', 7.0, 25, 98.0, 99.5, '2023-06-01T07:00:00Z', '2024-01-13T13:00:00Z');

-- Insert supplier applications
INSERT INTO supplier_applications (application_id, user_id, business_name, business_registration_number, tax_id, business_address, years_in_business, business_type, website_url, contact_name, contact_email, contact_phone, product_categories, estimated_product_count, average_order_value, delivery_area, delivery_options, pickup_available, documents, status, rejection_reason, admin_notes, reviewed_by, reviewed_at, submitted_at, reference_number) VALUES
('app_001', 'user_015', 'NewSupply Co', 'REG999888', 'TAX-999-888', '333 Startup Street, Austin, TX 78705', 2, 'LLC', 'https://newsupply.com', 'Amanda Rodriguez', 'amanda@newsupply.com', '+1-555-0108', '["lumber", "hardware", "tools"]', 150, 450.00, '["Austin", "Round Rock", "Cedar Park"]', '["delivery", "pickup"]', true, '{"business_license": "https://picsum.photos/seed/license999/400", "insurance": "https://picsum.photos/seed/insurance999/400"}', 'pending', NULL, NULL, NULL, NULL, '2024-01-10T14:00:00Z', 'APP-2024-001');

-- Insert payment methods
INSERT INTO payment_methods (payment_method_id, user_id, payment_type, card_last_four, card_brand, card_expiry_month, card_expiry_year, cardholder_name, payment_token, is_default, billing_address_id, created_at) VALUES
('pm_001', 'user_001', 'credit_card', '4242', 'Visa', '12', '2026', 'John Anderson', 'tok_visa_4242', true, 'addr_001', '2023-06-15T08:30:00Z'),
('pm_002', 'user_002', 'credit_card', '5555', 'Mastercard', '08', '2025', 'Sarah Mitchell', 'tok_mc_5555', true, 'addr_002', '2023-07-20T09:30:00Z'),
('pm_003', 'user_003', 'credit_card', '3782', 'Amex', '05', '2027', 'Mike Thompson', 'tok_amex_3782', true, 'addr_003', '2023-08-10T11:00:00Z'),
('pm_004', 'user_004', 'credit_card', '6011', 'Discover', '11', '2026', 'Emily Davis', 'tok_disc_6011', true, 'addr_004', '2023-09-05T11:30:00Z'),
('pm_005', 'user_005', 'credit_card', '4111', 'Visa', '03', '2028', 'Robert Wilson', 'tok_visa_4111', true, 'addr_005', '2023-05-12T08:30:00Z');

-- Insert categories
INSERT INTO categories (category_id, category_name, category_slug, parent_category_id, category_description, category_image_url, display_order, is_active, category_attributes, created_at) VALUES
('cat_001', 'Lumber & Wood', 'lumber-wood', NULL, 'All types of lumber and wood products', 'https://picsum.photos/seed/cat001/400', 1, true, '{"material_types": ["hardwood", "softwood", "engineered"]}', '2023-01-01T00:00:00Z'),
('cat_002', 'Hardware', 'hardware', NULL, 'Fasteners, hinges, locks, and more', 'https://picsum.photos/seed/cat002/400', 2, true, '{"includes": ["fasteners", "door_hardware", "cabinet_hardware"]}', '2023-01-01T00:00:00Z'),
('cat_003', 'Tools', 'tools', NULL, 'Power tools and hand tools', 'https://picsum.photos/seed/cat003/400', 3, true, '{"types": ["power_tools", "hand_tools", "measuring"]}', '2023-01-01T00:00:00Z'),
('cat_004', 'Electrical', 'electrical', NULL, 'Electrical supplies and fixtures', 'https://picsum.photos/seed/cat004/400', 4, true, '{"voltage": ["120V", "240V"]}', '2023-01-01T00:00:00Z'),
('cat_005', 'Plumbing', 'plumbing', NULL, 'Pipes, fittings, and fixtures', 'https://picsum.photos/seed/cat005/400', 5, true, '{"materials": ["copper", "PVC", "PEX"]}', '2023-01-01T00:00:00Z'),
('cat_006', 'Paint & Supplies', 'paint-supplies', NULL, 'Interior and exterior paint products', 'https://picsum.photos/seed/cat006/400', 6, true, '{"finishes": ["matte", "satin", "gloss"]}', '2023-01-01T00:00:00Z'),
('cat_007', 'Flooring', 'flooring', NULL, 'Hardwood, tile, carpet, and more', 'https://picsum.photos/seed/cat007/400', 7, true, '{"types": ["hardwood", "laminate", "tile", "carpet"]}', '2023-01-01T00:00:00Z'),
('cat_008', 'Roofing', 'roofing', NULL, 'Shingles, underlayment, and accessories', 'https://picsum.photos/seed/cat008/400', 8, true, '{"materials": ["asphalt", "metal", "tile"]}', '2023-01-01T00:00:00Z'),
('cat_009', 'Insulation', 'insulation', NULL, 'Insulation materials for walls and attics', 'https://picsum.photos/seed/cat009/400', 9, true, '{"r_values": ["R-13", "R-19", "R-30", "R-38"]}', '2023-01-01T00:00:00Z'),
('cat_010', 'Drywall & Supplies', 'drywall-supplies', NULL, 'Drywall sheets, joint compound, tape', 'https://picsum.photos/seed/cat010/400', 10, true, '{"thicknesses": ["1/4", "3/8", "1/2", "5/8"]}', '2023-01-01T00:00:00Z'),
('cat_011', 'Dimensional Lumber', 'dimensional-lumber', 'cat_001', '2x4, 2x6, and other dimensional lumber', 'https://picsum.photos/seed/cat011/400', 1, true, NULL, '2023-01-01T00:00:00Z'),
('cat_012', 'Plywood & Panels', 'plywood-panels', 'cat_001', 'Plywood, OSB, and panel products', 'https://picsum.photos/seed/cat012/400', 2, true, NULL, '2023-01-01T00:00:00Z'),
('cat_013', 'Power Drills', 'power-drills', 'cat_003', 'Corded and cordless drills', 'https://picsum.photos/seed/cat013/400', 1, true, NULL, '2023-01-01T00:00:00Z'),
('cat_014', 'Saws', 'saws', 'cat_003', 'Circular saws, miter saws, and more', 'https://picsum.photos/seed/cat014/400', 2, true, NULL, '2023-01-01T00:00:00Z'),
('cat_015', 'Screws & Bolts', 'screws-bolts', 'cat_002', 'Various fasteners', 'https://picsum.photos/seed/cat015/400', 1, true, NULL, '2023-01-01T00:00:00Z');

-- Insert products
INSERT INTO products (product_id, supplier_id, product_name, product_slug, category_id, subcategory_id, brand, sku, manufacturer, model_number, description, specifications, dimensions, weight, unit_of_measure, price, compare_at_price, cost_per_item, has_variants, bulk_pricing, trade_price, track_inventory, quantity_on_hand, low_stock_threshold, continue_selling_when_out_of_stock, barcode, requires_special_handling, tags, is_eco_friendly, sustainability_info, safety_information, certifications, technical_datasheet_url, installation_guide_url, warranty_info_url, meta_title, meta_description, rating_average, rating_count, view_count, order_count, status, is_featured, last_inventory_update, created_at, updated_at) VALUES
('prod_001', 'sup_001', '2x4x8 Premium Pine Stud', '2x4x8-premium-pine-stud', 'cat_001', 'cat_011', 'ACME Lumber', 'SKU-LUM-001', 'ACME Manufacturing', 'PS-2x4x8', 'High-quality kiln-dried pine stud, perfect for framing projects', '{"grade": "Premium", "moisture_content": "19%", "treatment": "Kiln-dried"}', '{"length": 96, "width": 3.5, "height": 1.5, "unit": "inches"}', 8.5, 'each', 6.99, 8.99, 4.50, false, '[{"quantity": 100, "price": 6.49}, {"quantity": 500, "price": 5.99}]', 5.75, true, 850, 50, false, '123456789012', false, '["lumber", "framing", "construction"]', false, NULL, 'Wear gloves when handling', '["Grade Stamp"]', 'https://picsum.photos/seed/datasheet001/400', 'https://picsum.photos/seed/guide001/400', 'https://picsum.photos/seed/warranty001/400', '2x4x8 Premium Pine Stud - Quality Lumber', 'Buy premium 2x4x8 pine studs for your construction project', 4.5, 45, 1823, 234, 'active', true, '2024-01-15T06:00:00Z', '2023-04-01T08:00:00Z', '2024-01-15T07:00:00Z'),
('prod_002', 'sup_001', '2x6x10 Pressure Treated Lumber', '2x6x10-pressure-treated', 'cat_001', 'cat_011', 'ACME Lumber', 'SKU-LUM-002', 'ACME Manufacturing', 'PT-2x6x10', 'Pressure-treated lumber ideal for outdoor decking and fencing', '{"grade": "Standard", "treatment": "Pressure-treated", "chemical": "ACQ"}', '{"length": 120, "width": 5.5, "height": 1.5, "unit": "inches"}', 18.5, 'each', 18.99, 22.99, 12.50, false, '[{"quantity": 50, "price": 17.99}, {"quantity": 200, "price": 16.99}]', 15.50, true, 425, 30, false, '123456789013', true, '["lumber", "outdoor", "pressure-treated"]', true, '{"eco_cert": "FSC Certified"}', 'Contains treated chemicals. Wear mask when cutting.', '["FSC", "Treated Wood"]', 'https://picsum.photos/seed/datasheet002/400', 'https://picsum.photos/seed/guide002/400', 'https://picsum.photos/seed/warranty002/400', 'Pressure Treated 2x6x10 Lumber for Outdoor Projects', 'Durable pressure-treated lumber for decks and fences', 4.7, 67, 2341, 187, 'active', true, '2024-01-14T06:00:00Z', '2023-04-01T08:00:00Z', '2024-01-14T07:00:00Z'),
('prod_003', 'sup_002', '18V Cordless Drill/Driver Kit', '18v-cordless-drill-kit', 'cat_003', 'cat_013', 'ProTool', 'SKU-TOOL-001', 'ProTool Industries', 'CD-18V-PRO', 'Professional 18V cordless drill with 2 batteries and charger', '{"voltage": "18V", "battery_type": "Lithium-ion", "max_torque": "450 in-lbs", "speed": "0-400/0-1500 RPM"}', '{"length": 8, "width": 3, "height": 9, "unit": "inches"}', 4.2, 'each', 129.99, 179.99, 75.00, false, NULL, 99.99, true, 85, 10, false, '234567890123', false, '["tools", "power-tools", "drill"]', false, NULL, 'Always wear safety glasses', '["UL Listed", "ETL Certified"]', 'https://picsum.photos/seed/datasheet003/400', 'https://picsum.photos/seed/guide003/400', 'https://picsum.photos/seed/warranty003/400', 'ProTool 18V Cordless Drill Kit', 'Professional cordless drill with batteries', 4.8, 123, 4256, 312, 'active', true, '2024-01-15T06:00:00Z', '2023-04-15T08:00:00Z', '2024-01-15T07:30:00Z'),
('prod_004', 'sup_003', 'Galvanized Deck Screws - 3" (1lb box)', 'galvanized-deck-screws-3in', 'cat_002', 'cat_015', 'Quality Hardware', 'SKU-HW-001', 'Quality Manufacturing', 'DW-3-GAL', 'Premium galvanized deck screws for outdoor projects', '{"material": "Steel", "coating": "Galvanized", "drive_type": "#2 Phillips", "thread": "Coarse"}', '{"length": 3, "diameter": 0.19, "unit": "inches"}', 1.0, 'box', 12.99, 15.99, 7.50, false, '[{"quantity": 10, "price": 11.99}, {"quantity": 50, "price": 10.99}]', 9.25, true, 340, 20, false, '345678901234', false, '["hardware", "screws", "fasteners"]', false, NULL, 'Use appropriate drill bit size', '["ASTM Compliant"]', 'https://picsum.photos/seed/datasheet004/400', NULL, NULL, 'Galvanized Deck Screws 3 inch', 'Quality deck screws for outdoor construction', 4.6, 89, 1678, 267, 'active', false, '2024-01-14T06:00:00Z', '2023-05-01T08:00:00Z', '2024-01-14T16:00:00Z'),
('prod_005', 'sup_003', '7-1/4" Circular Saw', '7-1-4-circular-saw', 'cat_003', 'cat_014', 'ProPower', 'SKU-TOOL-002', 'ProPower Tools', 'CS-7.25-PRO', 'Powerful 15-amp circular saw for professional cutting', '{"blade_size": "7.25 inches", "motor": "15 amp", "max_depth": "2.5 inches", "bevel_capacity": "56 degrees"}', '{"length": 12, "width": 10, "height": 11, "unit": "inches"}', 9.5, 'each', 89.99, 119.99, 52.00, false, NULL, 69.99, true, 52, 8, false, '456789012345', false, '["tools", "power-tools", "saw"]', false, NULL, 'Always use blade guard. Wear eye protection.', '["UL Listed", "CSA Approved"]', 'https://picsum.photos/seed/datasheet005/400', 'https://picsum.photos/seed/guide005/400', 'https://picsum.photos/seed/warranty005/400', 'ProPower 7-1/4 inch Circular Saw', 'Professional grade circular saw for cutting', 4.7, 98, 2876, 178, 'active', true, '2024-01-13T06:00:00Z', '2023-05-01T08:00:00Z', '2024-01-13T16:00:00Z'),
('prod_006', 'sup_004', 'Red Oak Hardwood Flooring - 3/4" x 2-1/4"', 'red-oak-hardwood-flooring', 'cat_007', NULL, 'Elite Wood', 'SKU-FLOOR-001', 'Elite Lumber', 'ROF-34-2.25', 'Beautiful solid red oak hardwood flooring', '{"species": "Red Oak", "grade": "Select", "finish": "Unfinished", "edges": "Tongue and groove"}', '{"thickness": 0.75, "width": 2.25, "length": 84, "unit": "inches"}', 2.8, 'sq ft', 5.99, 7.99, 3.75, false, '[{"quantity": 500, "price": 5.49}, {"quantity": 1000, "price": 4.99}]', 4.50, true, 2850, 100, false, '567890123456', false, '["flooring", "hardwood", "oak"]', true, '{"certification": "FSC Certified"}', 'Acclimate wood before installation', '["FSC Certified", "CARB Compliant"]', 'https://picsum.photos/seed/datasheet006/400', 'https://picsum.photos/seed/guide006/400', 'https://picsum.photos/seed/warranty006/400', 'Red Oak Hardwood Flooring - Premium Quality', 'Solid red oak hardwood flooring for beautiful interiors', 4.8, 76, 3421, 145, 'active', true, '2024-01-12T06:00:00Z', '2023-05-20T08:00:00Z', '2024-01-12T14:30:00Z'),
('prod_007', 'sup_005', 'Interior Latex Paint - White (1 Gallon)', 'interior-latex-paint-white', 'cat_006', NULL, 'ColorPro', 'SKU-PAINT-001', 'ColorPro Paints', 'IL-WHT-1G', 'Premium interior latex paint with excellent coverage', '{"type": "Latex", "finish": "Eggshell", "coverage": "400 sq ft", "voc": "Low VOC"}', '{"container": "1 gallon"}', 11.0, 'gallon', 34.99, 44.99, 18.50, true, '[{"quantity": 5, "price": 32.99}, {"quantity": 20, "price": 29.99}]', 26.50, true, 175, 15, false, '678901234567', false, '["paint", "interior", "latex"]', true, '{"low_voc": true, "eco_friendly": true}', 'Use in well-ventilated area', '["Green Seal Certified"]', 'https://picsum.photos/seed/datasheet007/400', 'https://picsum.photos/seed/guide007/400', NULL, 'Interior Latex Paint White - Premium Coverage', 'High-quality interior paint for walls and ceilings', 4.5, 134, 2987, 298, 'active', false, '2024-01-11T06:00:00Z', '2023-06-01T08:00:00Z', '2024-01-11T13:00:00Z'),
('prod_008', 'sup_005', '1/2" x 4x8 Plywood Sheet - BC Grade', 'plywood-sheet-bc-grade', 'cat_001', 'cat_012', 'Builders Ply', 'SKU-PLY-001', 'Builders Depot', 'PLY-BC-4x8', 'High-quality BC grade plywood for various applications', '{"grade": "BC", "core": "Veneer", "glue": "Interior"}', '{"thickness": 0.5, "length": 96, "width": 48, "unit": "inches"}', 45.0, 'sheet', 42.99, 52.99, 28.00, false, '[{"quantity": 25, "price": 39.99}, {"quantity": 100, "price": 37.99}]', 34.50, true, 285, 20, false, '789012345678', true, '["plywood", "panels", "wood"]', true, '{"certification": "CARB2 Compliant"}', 'Heavy item. Use proper lifting techniques.', '["CARB2", "PS 1-09"]', 'https://picsum.photos/seed/datasheet008/400', NULL, NULL, '1/2 inch Plywood Sheet BC Grade 4x8', 'Quality plywood sheets for construction', 4.6, 87, 2145, 198, 'active', false, '2024-01-10T06:00:00Z', '2023-06-01T08:00:00Z', '2024-01-10T13:00:00Z'),
('prod_009', 'sup_001', 'R-19 Fiberglass Insulation Batts', 'r19-fiberglass-insulation', 'cat_009', NULL, 'InsulPro', 'SKU-INSUL-001', 'ACME Manufacturing', 'FG-R19-16', 'R-19 fiberglass insulation for 2x6 wall cavities', '{"r_value": "R-19", "width": "16 inches", "thickness": "6.25 inches", "coverage": "64 sq ft per bag"}', '{"length": 96, "width": 16, "thickness": 6.25, "unit": "inches"}', 18.0, 'bag', 44.99, 54.99, 28.50, false, '[{"quantity": 10, "price": 42.99}, {"quantity": 50, "price": 39.99}]', 36.50, true, 165, 15, false, '890123456789', false, '["insulation", "fiberglass", "energy-efficiency"]', true, '{"energy_efficient": true}', 'Wear protective clothing, gloves, and mask', '["GREENGUARD Certified"]', 'https://picsum.photos/seed/datasheet009/400', 'https://picsum.photos/seed/guide009/400', NULL, 'R-19 Fiberglass Insulation for Walls', 'Energy-efficient insulation for 2x6 walls', 4.4, 52, 1567, 124, 'active', false, '2024-01-09T06:00:00Z', '2023-04-01T08:00:00Z', '2024-01-09T07:00:00Z'),
('prod_010', 'sup_002', '1/2" x 4x8 Drywall Sheet - Standard', 'drywall-sheet-standard', 'cat_010', NULL, 'SheetRock Pro', 'SKU-DW-001', 'ProBuilding Materials', 'DW-STD-4x8', 'Standard 1/2" drywall sheet for walls and ceilings', '{"thickness": "1/2 inch", "edge": "Tapered", "type": "Standard"}', '{"thickness": 0.5, "length": 96, "width": 48, "unit": "inches"}', 52.0, 'sheet', 12.99, 16.99, 8.25, false, '[{"quantity": 50, "price": 11.99}, {"quantity": 200, "price": 10.99}]', 9.50, true, 420, 30, false, '901234567890', true, '["drywall", "sheetrock", "wallboard"]', false, NULL, 'Heavy. Use drywall lift or helper for installation.', '["ASTM C1396"]', 'https://picsum.photos/seed/datasheet010/400', 'https://picsum.photos/seed/guide010/400', NULL, 'Standard 1/2 inch Drywall Sheet 4x8', 'Quality drywall for interior walls', 4.6, 143, 3245, 387, 'active', false, '2024-01-08T06:00:00Z', '2023-04-15T08:00:00Z', '2024-01-08T07:30:00Z');

-- Insert product variants for paint (different finishes)
INSERT INTO product_variants (variant_id, product_id, variant_name, variant_type, sku, price, compare_at_price, quantity_on_hand, variant_image_url, variant_specifications, display_order, is_active, created_at) VALUES
('var_001', 'prod_007', 'Flat Finish', 'finish', 'SKU-PAINT-001-FLAT', 32.99, 42.99, 120, 'https://picsum.photos/seed/var001/300', '{"finish": "Flat", "sheen": "0-5%"}', 1, true, '2023-06-01T08:00:00Z'),
('var_002', 'prod_007', 'Satin Finish', 'finish', 'SKU-PAINT-001-SATIN', 36.99, 46.99, 95, 'https://picsum.photos/seed/var002/300', '{"finish": "Satin", "sheen": "26-40%"}', 2, true, '2023-06-01T08:00:00Z'),
('var_003', 'prod_007', 'Semi-Gloss Finish', 'finish', 'SKU-PAINT-001-SGLOSS', 38.99, 48.99, 78, 'https://picsum.photos/seed/var003/300', '{"finish": "Semi-Gloss", "sheen": "41-69%"}', 3, true, '2023-06-01T08:00:00Z');

-- Insert product images
INSERT INTO product_images (image_id, product_id, image_url, is_primary, display_order, alt_text, created_at) VALUES
('img_001', 'prod_001', 'https://picsum.photos/seed/prod001a/800', true, 1, '2x4x8 Premium Pine Stud', '2023-04-01T08:00:00Z'),
('img_002', 'prod_001', 'https://picsum.photos/seed/prod001b/800', false, 2, '2x4 lumber close-up', '2023-04-01T08:00:00Z'),
('img_003', 'prod_002', 'https://picsum.photos/seed/prod002a/800', true, 1, 'Pressure treated lumber', '2023-04-01T08:00:00Z'),
('img_004', 'prod_003', 'https://picsum.photos/seed/prod003a/800', true, 1, 'ProTool cordless drill kit', '2023-04-15T08:00:00Z'),
('img_005', 'prod_003', 'https://picsum.photos/seed/prod003b/800', false, 2, 'Drill in use', '2023-04-15T08:00:00Z'),
('img_006', 'prod_004', 'https://picsum.photos/seed/prod004a/800', true, 1, 'Galvanized deck screws box', '2023-05-01T08:00:00Z'),
('img_007', 'prod_005', 'https://picsum.photos/seed/prod005a/800', true, 1, 'Circular saw', '2023-05-01T08:00:00Z'),
('img_008', 'prod_006', 'https://picsum.photos/seed/prod006a/800', true, 1, 'Red oak hardwood flooring', '2023-05-20T08:00:00Z'),
('img_009', 'prod_006', 'https://picsum.photos/seed/prod006b/800', false, 2, 'Oak flooring installed', '2023-05-20T08:00:00Z'),
('img_010', 'prod_007', 'https://picsum.photos/seed/prod007a/800', true, 1, 'Interior paint can', '2023-06-01T08:00:00Z');

-- Insert projects
INSERT INTO projects (project_id, business_account_id, project_name, project_type, budget, start_date, end_date, status, notes, total_spent, created_by, created_at, updated_at) VALUES
('proj_001', 'biz_001', 'Downtown Office Renovation', 'commercial', 125000.00, '2024-02-01', '2024-06-30', 'active', 'Complete renovation of 5000 sq ft office space', 18750.50, 'user_001', '2024-01-05T10:00:00Z', '2024-01-15T14:30:00Z'),
('proj_002', 'biz_002', 'Residential Complex Building', 'residential', 550000.00, '2024-01-15', '2024-12-31', 'active', '20-unit apartment building construction', 87340.25, 'user_002', '2023-12-20T09:00:00Z', '2024-01-14T16:20:00Z'),
('proj_003', 'biz_003', 'Warehouse Expansion', 'commercial', 280000.00, '2024-03-01', '2024-08-15', 'active', 'Adding 10,000 sq ft to existing warehouse', 0.00, 'user_005', '2024-01-10T11:00:00Z', '2024-01-10T11:00:00Z');

-- Insert shopping carts
INSERT INTO shopping_carts (cart_id, user_id, session_id, cart_name, is_active, project_id, promo_code, promo_discount_amount, promo_discount_type, reservation_expiry, created_at, updated_at) VALUES
('cart_001', 'user_001', NULL, 'Current Cart', true, 'proj_001', 'SAVE10', 45.50, 'percentage', '2024-01-16T10:00:00Z', '2024-01-14T08:30:00Z', '2024-01-15T09:45:00Z'),
('cart_002', 'user_003', NULL, 'Main Cart', true, NULL, NULL, NULL, NULL, NULL, '2024-01-13T11:00:00Z', '2024-01-15T10:20:00Z'),
('cart_003', 'user_004', NULL, 'Renovation Supplies', true, NULL, NULL, NULL, NULL, NULL, '2024-01-12T14:30:00Z', '2024-01-14T15:00:00Z');

-- Insert cart items
INSERT INTO cart_items (cart_item_id, cart_id, product_id, variant_id, supplier_id, quantity, unit_price, subtotal, reserved_at, added_at) VALUES
('ci_001', 'cart_001', 'prod_001', NULL, 'sup_001', 150, 6.49, 973.50, '2024-01-15T09:45:00Z', '2024-01-14T08:30:00Z'),
('ci_002', 'cart_001', 'prod_002', NULL, 'sup_001', 50, 17.99, 899.50, '2024-01-15T09:45:00Z', '2024-01-14T09:00:00Z'),
('ci_003', 'cart_002', 'prod_003', NULL, 'sup_002', 2, 129.99, 259.98, NULL, '2024-01-13T11:00:00Z'),
('ci_004', 'cart_002', 'prod_004', NULL, 'sup_003', 5, 11.99, 59.95, NULL, '2024-01-13T11:30:00Z'),
('ci_005', 'cart_003', 'prod_007', 'var_002', 'sup_005', 8, 32.99, 263.92, NULL, '2024-01-12T14:30:00Z');

-- Insert wishlists
INSERT INTO wishlists (wishlist_id, user_id, wishlist_name, is_default, is_public, created_at) VALUES
('wish_001', 'user_001', 'My Wishlist', true, false, '2023-06-15T08:30:00Z'),
('wish_002', 'user_003', 'Future Projects', true, false, '2023-08-10T11:00:00Z'),
('wish_003', 'user_004', 'Kitchen Renovation', false, true, '2023-09-05T11:30:00Z');

-- Insert wishlist items
INSERT INTO wishlist_items (wishlist_item_id, wishlist_id, product_id, variant_id, added_at, price_when_added, notes) VALUES
('wi_001', 'wish_001', 'prod_005', NULL, '2024-01-10T14:00:00Z', 89.99, 'Need for project site'),
('wi_002', 'wish_001', 'prod_006', NULL, '2024-01-12T09:30:00Z', 5.99, 'For office renovation flooring'),
('wi_003', 'wish_002', 'prod_003', NULL, '2024-01-08T16:00:00Z', 129.99, NULL),
('wi_004', 'wish_003', 'prod_007', 'var_003', '2024-01-05T13:00:00Z', 38.99, 'For kitchen walls');

-- Insert orders
INSERT INTO orders (order_id, order_number, customer_id, supplier_id, project_id, delivery_address_id, billing_address_id, delivery_contact_name, delivery_contact_phone, delivery_instructions, delivery_window_start, delivery_window_end, delivery_method, status, payment_status, payment_method, payment_method_id, subtotal, delivery_cost, tax_amount, discount_amount, promo_code, total_amount, currency, payment_transaction_id, payment_gateway, platform_fee, supplier_payout_amount, is_guest_order, guest_email, guest_phone, tracking_token, placed_by, approved_by, requires_approval, approval_status, notes, supplier_notes, admin_notes, estimated_delivery_date, actual_delivery_date, accepted_at, shipped_at, delivered_at, canceled_at, cancellation_reason, created_at, updated_at) VALUES
('ord_001', 'ORD-2024-001', 'user_001', 'sup_001', 'proj_001', 'addr_001', 'addr_001', 'John Anderson', '+1-555-0101', 'Deliver to loading dock', '2024-01-10T08:00:00Z', '2024-01-10T12:00:00Z', 'standard_delivery', 'delivered', 'paid', 'credit_card', 'pm_001', 1845.50, 75.00, 147.64, 92.28, 'SAVE5', 1975.86, 'USD', 'txn_001_stripe', 'Stripe', 167.95, 1807.91, false, NULL, NULL, 'track_ord001', 'user_001', NULL, false, NULL, 'Large lumber order for framing', 'Delivered on time', NULL, '2024-01-10', '2024-01-10', '2024-01-08T14:00:00Z', '2024-01-09T09:00:00Z', '2024-01-10T10:30:00Z', NULL, NULL, '2024-01-08T10:00:00Z', '2024-01-10T10:30:00Z'),
('ord_002', 'ORD-2024-002', 'user_002', 'sup_002', 'proj_002', 'addr_002', 'addr_002', 'Sarah Mitchell', '+1-555-0102', 'Call before delivery', '2024-01-12T10:00:00Z', '2024-01-12T14:00:00Z', 'express_delivery', 'delivered', 'paid', 'credit_card', 'pm_002', 649.95, 45.00, 55.75, 0.00, NULL, 750.70, 'USD', 'txn_002_stripe', 'Stripe', 58.50, 691.45, false, NULL, NULL, 'track_ord002', 'user_002', NULL, false, NULL, 'Tools for new project', 'Great products', NULL, '2024-01-12', '2024-01-12', '2024-01-09T15:00:00Z', '2024-01-11T08:00:00Z', '2024-01-12T11:00:00Z', NULL, NULL, '2024-01-09T12:00:00Z', '2024-01-12T11:00:00Z'),
('ord_003', 'ORD-2024-003', 'user_003', 'sup_003', NULL, 'addr_003', 'addr_003', 'Mike Thompson', '+1-555-0103', 'Leave at front porch', NULL, NULL, 'standard_delivery', 'shipped', 'paid', 'credit_card', 'pm_003', 158.88, 25.00, 14.71, 0.00, NULL, 198.59, 'USD', 'txn_003_stripe', 'Stripe', 13.99, 184.60, false, NULL, NULL, 'track_ord003', 'user_003', NULL, false, NULL, 'Home improvement supplies', NULL, NULL, '2024-01-16', NULL, '2024-01-13T16:00:00Z', '2024-01-15T10:00:00Z', NULL, NULL, NULL, '2024-01-13T14:00:00Z', '2024-01-15T10:00:00Z'),
('ord_004', 'ORD-2024-004', 'user_004', 'sup_005', NULL, 'addr_004', 'addr_004', 'Emily Davis', '+1-555-0104', 'Gate code 1234', '2024-01-14T13:00:00Z', '2024-01-14T17:00:00Z', 'standard_delivery', 'processing', 'paid', 'credit_card', 'pm_004', 479.85, 35.00, 41.19, 0.00, NULL, 556.04, 'USD', 'txn_004_stripe', 'Stripe', 33.59, 522.45, false, NULL, NULL, 'track_ord004', 'user_004', NULL, false, NULL, 'Paint and flooring samples', 'Processing order', NULL, '2024-01-17', NULL, '2024-01-14T09:00:00Z', NULL, NULL, NULL, NULL, '2024-01-14T08:00:00Z', '2024-01-14T09:00:00Z'),
('ord_005', 'ORD-2024-005', 'user_005', 'sup_001', 'proj_003', 'addr_005', 'addr_005', 'Robert Wilson', '+1-555-0105', 'Dock B available 8am-5pm', '2024-01-11T08:00:00Z', '2024-01-11T17:00:00Z', 'freight_delivery', 'delivered', 'paid', 'credit_card', 'pm_005', 3845.75, 150.00, 319.89, 192.29, 'BULK10', 4123.35, 'USD', 'txn_005_stripe', 'Stripe', 326.89, 3796.46, false, NULL, NULL, 'track_ord005', 'user_005', NULL, true, 'approved', 'Bulk order for warehouse expansion', 'Large delivery completed', NULL, '2024-01-11', '2024-01-11', '2024-01-09T11:00:00Z', '2024-01-10T07:00:00Z', '2024-01-11T09:30:00Z', NULL, NULL, '2024-01-09T09:00:00Z', '2024-01-11T09:30:00Z'),
('ord_006', 'ORD-2024-006', 'user_001', 'sup_005', 'proj_001', 'addr_001', 'addr_001', 'John Anderson', '+1-555-0101', 'Loading dock', '2024-01-15T09:00:00Z', '2024-01-15T13:00:00Z', 'standard_delivery', 'pending', 'pending', 'credit_card', 'pm_001', 845.20, 50.00, 71.64, 0.00, NULL, 966.84, 'USD', NULL, NULL, 59.39, 907.45, false, NULL, NULL, 'track_ord006', 'user_001', NULL, false, NULL, 'Additional materials needed', NULL, NULL, '2024-01-18', NULL, NULL, NULL, NULL, NULL, NULL, '2024-01-15T11:00:00Z', '2024-01-15T11:00:00Z');

-- Insert order items
INSERT INTO order_items (order_item_id, order_id, product_id, variant_id, product_name, variant_name, sku, quantity, unit_price, subtotal, product_image_url) VALUES
('oi_001', 'ord_001', 'prod_001', NULL, '2x4x8 Premium Pine Stud', NULL, 'SKU-LUM-001', 150, 6.49, 973.50, 'https://picsum.photos/seed/prod001a/800'),
('oi_002', 'ord_001', 'prod_002', NULL, '2x6x10 Pressure Treated Lumber', NULL, 'SKU-LUM-002', 50, 17.99, 899.50, 'https://picsum.photos/seed/prod002a/800'),
('oi_003', 'ord_002', 'prod_003', NULL, '18V Cordless Drill/Driver Kit', NULL, 'SKU-TOOL-001', 3, 129.99, 389.97, 'https://picsum.photos/seed/prod003a/800'),
('oi_004', 'ord_002', 'prod_005', NULL, '7-1/4" Circular Saw', NULL, 'SKU-TOOL-002', 2, 89.99, 179.98, 'https://picsum.photos/seed/prod005a/800'),
('oi_005', 'ord_002', 'prod_004', NULL, 'Galvanized Deck Screws - 3" (1lb box)', NULL, 'SKU-HW-001', 8, 11.99, 95.92, 'https://picsum.photos/seed/prod004a/800'),
('oi_006', 'ord_003', 'prod_004', NULL, 'Galvanized Deck Screws - 3" (1lb box)', NULL, 'SKU-HW-001', 12, 11.99, 143.88, 'https://picsum.photos/seed/prod004a/800'),
('oi_007', 'ord_004', 'prod_007', 'var_002', 'Interior Latex Paint - White (1 Gallon)', 'Satin Finish', 'SKU-PAINT-001-SATIN', 10, 32.99, 329.90, 'https://picsum.photos/seed/prod007a/800'),
('oi_008', 'ord_004', 'prod_006', NULL, 'Red Oak Hardwood Flooring - 3/4" x 2-1/4"', NULL, 'SKU-FLOOR-001', 25, 5.99, 149.75, 'https://picsum.photos/seed/prod006a/800'),
('oi_009', 'ord_005', 'prod_001', NULL, '2x4x8 Premium Pine Stud', NULL, 'SKU-LUM-001', 500, 5.99, 2995.00, 'https://picsum.photos/seed/prod001a/800'),
('oi_010', 'ord_005', 'prod_008', NULL, '1/2" x 4x8 Plywood Sheet - BC Grade', NULL, 'SKU-PLY-001', 25, 37.99, 949.75, 'https://picsum.photos/seed/prod008a/800'),
('oi_011', 'ord_006', 'prod_009', NULL, 'R-19 Fiberglass Insulation Batts', NULL, 'SKU-INSUL-001', 20, 42.99, 859.80, 'https://picsum.photos/seed/prod009a/800');

-- Insert inventory movements
INSERT INTO inventory_movements (movement_id, product_id, variant_id, movement_type, quantity_change, quantity_after, reason, notes, related_order_id, created_by, created_at) VALUES
('mov_001', 'prod_001', NULL, 'sale', -150, 850, 'order_fulfillment', 'Order ORD-2024-001', 'ord_001', 'user_006', '2024-01-08T14:00:00Z'),
('mov_002', 'prod_002', NULL, 'sale', -50, 425, 'order_fulfillment', 'Order ORD-2024-001', 'ord_001', 'user_006', '2024-01-08T14:00:00Z'),
('mov_003', 'prod_003', NULL, 'sale', -3, 85, 'order_fulfillment', 'Order ORD-2024-002', 'ord_002', 'user_007', '2024-01-09T15:00:00Z'),
('mov_004', 'prod_004', NULL, 'restock', 50, 340, 'supplier_restock', 'Weekly restock', NULL, 'user_008', '2024-01-10T08:00:00Z'),
('mov_005', 'prod_006', NULL, 'adjustment', -5, 2850, 'inventory_adjustment', 'Damaged units removed', NULL, 'user_009', '2024-01-11T10:00:00Z');

-- Insert order status history
INSERT INTO order_status_history (history_id, order_id, status, notes, location, updated_by, created_at) VALUES
('osh_001', 'ord_001', 'pending', 'Order received', 'Austin, TX', 'user_006', '2024-01-08T10:00:00Z'),
('osh_002', 'ord_001', 'processing', 'Order being prepared', 'ACME Warehouse', 'user_006', '2024-01-08T14:00:00Z'),
('osh_003', 'ord_001', 'shipped', 'Order dispatched', 'ACME Warehouse', 'user_006', '2024-01-09T09:00:00Z'),
('osh_004', 'ord_001', 'delivered', 'Order delivered successfully', 'Customer Site', 'user_006', '2024-01-10T10:30:00Z'),
('osh_005', 'ord_002', 'pending', 'Order received', 'Dallas, TX', 'user_007', '2024-01-09T12:00:00Z'),
('osh_006', 'ord_002', 'processing', 'Items picked and packed', 'ProBuilding Warehouse', 'user_007', '2024-01-09T15:00:00Z'),
('osh_007', 'ord_002', 'shipped', 'Out for delivery', 'ProBuilding Warehouse', 'user_007', '2024-01-11T08:00:00Z'),
('osh_008', 'ord_002', 'delivered', 'Customer received order', 'Customer Site', 'user_007', '2024-01-12T11:00:00Z');

-- Insert deliveries
INSERT INTO deliveries (delivery_id, order_id, carrier_name, tracking_number, tracking_url, delivery_method, scheduled_date, scheduled_window_start, scheduled_window_end, estimated_arrival_time, actual_delivery_time, driver_name, driver_phone, current_latitude, current_longitude, status, delay_reason, proof_of_delivery_url, recipient_name, recipient_signature_url, delivery_photo_urls, delivery_notes, created_at, updated_at) VALUES
('del_001', 'ord_001', 'ACME Logistics', 'TRK-001-2024', 'https://tracking.acme.com/TRK-001-2024', 'standard_delivery', '2024-01-10', '2024-01-10T08:00:00Z', '2024-01-10T12:00:00Z', '2024-01-10T10:00:00Z', '2024-01-10T10:30:00Z', 'Tom Driver', '+1-555-9001', NULL, NULL, 'delivered', NULL, 'https://picsum.photos/seed/pod001/400', 'John Anderson', 'https://picsum.photos/seed/sig001/300', '["https://picsum.photos/seed/delphoto001a/400", "https://picsum.photos/seed/delphoto001b/400"]', 'Delivered to loading dock as requested', '2024-01-08T14:00:00Z', '2024-01-10T10:30:00Z'),
('del_002', 'ord_002', 'ProShip Express', 'TRK-002-2024', 'https://tracking.proship.com/TRK-002-2024', 'express_delivery', '2024-01-12', '2024-01-12T10:00:00Z', '2024-01-12T14:00:00Z', '2024-01-12T11:00:00Z', '2024-01-12T11:15:00Z', 'Linda Courier', '+1-555-9002', NULL, NULL, 'delivered', NULL, 'https://picsum.photos/seed/pod002/400', 'Sarah Mitchell', 'https://picsum.photos/seed/sig002/300', '["https://picsum.photos/seed/delphoto002a/400"]', 'Customer was very satisfied', '2024-01-09T15:00:00Z', '2024-01-12T11:15:00Z'),
('del_003', 'ord_003', 'FastTrack Delivery', 'TRK-003-2024', 'https://tracking.fasttrack.com/TRK-003-2024', 'standard_delivery', '2024-01-16', NULL, NULL, '2024-01-16T14:00:00Z', NULL, 'Mike Transporter', '+1-555-9003', 30.2604, -97.7500, 'in_transit', NULL, NULL, NULL, NULL, NULL, 'En route to customer', '2024-01-13T16:00:00Z', '2024-01-15T10:00:00Z');

-- Insert delivery tracking updates
INSERT INTO delivery_tracking_updates (update_id, delivery_id, status_message, location, latitude, longitude, checkpoint_date, created_at) VALUES
('upd_001', 'del_001', 'Package picked up from warehouse', 'ACME Warehouse, Austin, TX', 30.2800, -97.7500, '2024-01-09T09:00:00Z', '2024-01-09T09:00:00Z'),
('upd_002', 'del_001', 'Out for delivery', 'Austin Distribution Center', 30.2672, -97.7431, '2024-01-10T08:00:00Z', '2024-01-10T08:00:00Z'),
('upd_003', 'del_001', 'Delivered', '123 Construction Ave, Austin, TX', 30.2672, -97.7431, '2024-01-10T10:30:00Z', '2024-01-10T10:30:00Z'),
('upd_004', 'del_002', 'Package received', 'ProBuilding Materials, Dallas, TX', 32.7850, -96.8000, '2024-01-11T08:00:00Z', '2024-01-11T08:00:00Z'),
('upd_005', 'del_002', 'Delivered', '456 Builder Blvd, Dallas, TX', 32.7767, -96.7970, '2024-01-12T11:15:00Z', '2024-01-12T11:15:00Z');

-- Insert supplier delivery settings
INSERT INTO supplier_delivery_settings (setting_id, supplier_id, delivery_coverage_type, radius_miles, postal_codes, pricing_method, flat_rate_price, distance_based_rates, free_delivery_threshold, minimum_order_value, available_days, time_windows, capacity_per_window, lead_time_hours, offers_same_day_delivery, offers_pickup, pickup_address, pickup_hours, uses_platform_logistics, third_party_carrier, gps_tracking_enabled, created_at, updated_at) VALUES
('sds_001', 'sup_001', 'radius', 25.0, NULL, 'flat_rate', 75.00, NULL, 500.00, 100.00, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]', '[{"start": "08:00", "end": "12:00"}, {"start": "13:00", "end": "17:00"}]', 10, 24, false, true, '777 Supply Street, Austin, TX 78703', '{"monday": "7:00-18:00", "tuesday": "7:00-18:00", "wednesday": "7:00-18:00", "thursday": "7:00-18:00", "friday": "7:00-18:00", "saturday": "8:00-16:00"}', false, 'ACME Logistics', true, '2023-04-01T07:00:00Z', '2024-01-15T08:00:00Z'),
('sds_002', 'sup_002', 'radius', 50.0, NULL, 'tiered', NULL, '[{"min_distance": 0, "max_distance": 10, "price": 25}, {"min_distance": 10, "max_distance": 25, "price": 45}, {"min_distance": 25, "max_distance": 50, "price": 85}]', 300.00, 75.00, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', '[{"start": "06:00", "end": "10:00"}, {"start": "10:00", "end": "14:00"}, {"start": "14:00", "end": "18:00"}]', 15, 12, true, true, '888 Materials Lane, Dallas, TX 75202', '{"daily": "6:00-19:00"}', true, NULL, true, '2023-04-15T07:00:00Z', '2024-01-15T07:30:00Z');

-- Insert product reviews
INSERT INTO product_reviews (review_id, product_id, order_id, customer_id, rating, title, review_text, is_recommended, is_anonymous, is_verified_purchase, helpful_count, photo_urls, video_url, supplier_response, supplier_response_date, status, flagged_reason, moderation_notes, created_at, updated_at) VALUES
('pr_001', 'prod_001', 'ord_001', 'user_001', 5, 'Excellent Quality Lumber', 'These studs are top quality. Very straight and minimal defects. Perfect for our framing project.', true, false, true, 12, '["https://picsum.photos/seed/review001a/400", "https://picsum.photos/seed/review001b/400"]', NULL, 'Thank you for your feedback! We''re glad you''re satisfied with our products.', '2024-01-12T09:00:00Z', 'published', NULL, NULL, '2024-01-11T15:30:00Z', '2024-01-12T09:00:00Z'),
('pr_002', 'prod_002', 'ord_001', 'user_001', 5, 'Great for Outdoor Projects', 'Pressure treated lumber arrived in perfect condition. Using it for our deck and it''s holding up great.', true, false, true, 8, '["https://picsum.photos/seed/review002a/400"]', NULL, 'We appreciate your business! Let us know if you need more materials.', '2024-01-13T10:00:00Z', 'published', NULL, NULL, '2024-01-12T14:00:00Z', '2024-01-13T10:00:00Z'),
('pr_003', 'prod_003', 'ord_002', 'user_002', 5, 'Best Drill I''ve Owned', 'This drill is powerful and the batteries last a long time. Great for professional use.', true, false, true, 15, NULL, NULL, 'Thank you! We stand behind our ProTool products.', '2024-01-14T11:00:00Z', 'published', NULL, NULL, '2024-01-13T16:00:00Z', '2024-01-14T11:00:00Z'),
('pr_004', 'prod_004', 'ord_002', 'user_002', 4, 'Good Screws', 'Quality screws at a fair price. Would buy again.', true, false, true, 3, NULL, NULL, NULL, NULL, 'published', NULL, NULL, '2024-01-13T17:00:00Z', '2024-01-13T17:00:00Z'),
('pr_005', 'prod_006', 'ord_004', 'user_004', 5, 'Beautiful Flooring', 'The red oak is gorgeous. Can''t wait to get it installed throughout the house.', true, false, true, 6, '["https://picsum.photos/seed/review005a/400", "https://picsum.photos/seed/review005b/400"]', NULL, 'Thank you for choosing Elite Lumber!', '2024-01-15T13:00:00Z', 'published', NULL, NULL, '2024-01-15T10:00:00Z', '2024-01-15T13:00:00Z');

-- Insert supplier reviews
INSERT INTO supplier_reviews (review_id, supplier_id, order_id, customer_id, overall_rating, product_quality_rating, delivery_rating, customer_service_rating, review_text, is_anonymous, photo_urls, supplier_response, supplier_response_date, status, created_at, updated_at) VALUES
('sr_001', 'sup_001', 'ord_001', 'user_001', 5, 5, 5, 5, 'ACME Building Supplies is fantastic. Great products, fast delivery, and excellent customer service.', false, NULL, 'We appreciate your business and look forward to serving you again!', '2024-01-12T09:30:00Z', 'published', '2024-01-11T16:00:00Z', '2024-01-12T09:30:00Z'),
('sr_002', 'sup_002', 'ord_002', 'user_002', 5, 5, 4, 5, 'Pro Building Materials has a great selection and knowledgeable staff. Delivery was quick.', false, NULL, 'Thank you for the kind words!', '2024-01-14T11:30:00Z', 'published', '2024-01-13T17:30:00Z', '2024-01-14T11:30:00Z'),
('sr_003', 'sup_003', 'ord_003', 'user_003', 5, 5, 5, 5, 'Quality Hardware & Tools is my go-to supplier. Never disappointed.', false, NULL, 'We''re honored to be your preferred supplier!', '2024-01-15T14:00:00Z', 'published', '2024-01-15T12:00:00Z', '2024-01-15T14:00:00Z');

-- Insert review helpful votes
INSERT INTO review_helpful_votes (vote_id, review_id, user_id, is_helpful, created_at) VALUES
('rhv_001', 'pr_001', 'user_003', true, '2024-01-12T10:00:00Z'),
('rhv_002', 'pr_001', 'user_004', true, '2024-01-12T11:00:00Z'),
('rhv_003', 'pr_003', 'user_001', true, '2024-01-14T12:00:00Z');

-- Insert returns
INSERT INTO returns (return_id, order_id, order_item_id, customer_id, supplier_id, return_reason, detailed_description, photo_urls, quantity, refund_amount, return_method, return_address, return_shipping_label_url, return_tracking_number, status, supplier_decision, supplier_notes, decline_reason, item_received_at, inspection_notes, requested_at, approved_at, completed_at) VALUES
('ret_001', 'ord_002', 'oi_004', 'user_002', 'sup_002', 'defective', 'One of the saws arrived with a defective blade guard', '["https://picsum.photos/seed/return001a/400", "https://picsum.photos/seed/return001b/400"]', 1, 89.99, 'return_label', '888 Materials Lane, Dallas, TX 75202', 'https://picsum.photos/seed/label001/400', 'RET-TRK-001', 'completed', 'approved', 'Item received and inspected. Refund processed.', NULL, '2024-01-14T10:00:00Z', 'Blade guard mechanism indeed defective', '2024-01-13T09:00:00Z', '2024-01-13T14:00:00Z', '2024-01-14T15:00:00Z');

-- Insert refunds
INSERT INTO refunds (refund_id, order_id, return_id, customer_id, refund_amount, refund_type, refund_method, payment_transaction_id, refund_transaction_id, restocking_fee, refund_reason, breakdown, status, processed_by, requested_at, processed_at, completed_at) VALUES
('ref_001', 'ord_002', 'ret_001', 'user_002', 89.99, 'full_refund', 'original_payment', 'txn_002_stripe', 'ref_stripe_001', 0.00, 'Defective product', '{"product_cost": 89.99, "tax": 0, "restocking_fee": 0}', 'completed', 'user_012', '2024-01-13T14:00:00Z', '2024-01-14T11:00:00Z', '2024-01-14T15:00:00Z');

-- Insert disputes (none active for now, but structure is ready)

-- Insert conversations
INSERT INTO conversations (conversation_id, participant_1_id, participant_2_id, related_order_id, related_product_id, status, last_message_at, created_at) VALUES
('conv_001', 'user_001', 'user_006', 'ord_001', NULL, 'closed', '2024-01-08T15:30:00Z', '2024-01-08T11:00:00Z'),
('conv_002', 'user_003', 'user_008', NULL, 'prod_005', 'open', '2024-01-15T14:20:00Z', '2024-01-15T13:00:00Z');

-- Insert messages
INSERT INTO messages (message_id, conversation_id, sender_id, message_text, attachment_urls, is_read, read_at, sent_at) VALUES
('msg_001', 'conv_001', 'user_001', 'What time can you deliver on Tuesday?', NULL, true, '2024-01-08T11:05:00Z', '2024-01-08T11:00:00Z'),
('msg_002', 'conv_001', 'user_006', 'We can deliver between 8am and 12pm. Would that work for you?', NULL, true, '2024-01-08T11:10:00Z', '2024-01-08T11:07:00Z'),
('msg_003', 'conv_001', 'user_001', 'Perfect! Please schedule for that window.', NULL, true, '2024-01-08T15:30:00Z', '2024-01-08T11:12:00Z'),
('msg_004', 'conv_002', 'user_003', 'Does this saw come with a carrying case?', NULL, true, '2024-01-15T13:05:00Z', '2024-01-15T13:00:00Z'),
('msg_005', 'conv_002', 'user_008', 'Yes, it includes a soft carry bag. Would you like to place an order?', NULL, true, '2024-01-15T14:20:00Z', '2024-01-15T13:10:00Z');

-- Insert notifications
INSERT INTO notifications (notification_id, user_id, notification_type, title, message, icon_type, related_entity_type, related_entity_id, action_url, is_read, read_at, created_at) VALUES
('notif_001', 'user_001', 'order_update', 'Order Delivered', 'Your order ORD-2024-001 has been delivered', 'success', 'order', 'ord_001', '/orders/ord_001', true, '2024-01-10T11:00:00Z', '2024-01-10T10:30:00Z'),
('notif_002', 'user_002', 'order_update', 'Order Shipped', 'Your order ORD-2024-002 has been shipped', 'info', 'order', 'ord_002', '/orders/ord_002', true, '2024-01-11T09:00:00Z', '2024-01-11T08:00:00Z'),
('notif_003', 'user_003', 'message', 'New Message', 'You have a new message from Quality Hardware & Tools', 'message', 'conversation', 'conv_002', '/messages/conv_002', true, '2024-01-15T13:15:00Z', '2024-01-15T13:10:00Z'),
('notif_004', 'user_001', 'promotion', 'New Sale!', 'ACME Building Supplies has a new promotion - Save 15% on lumber', 'offer', 'supplier', 'sup_001', '/suppliers/sup_001', false, NULL, '2024-01-15T08:00:00Z');

-- Insert project materials
INSERT INTO project_materials (material_id, project_id, product_id, variant_id, quantity_needed, quantity_ordered, notes, added_at) VALUES
('pm_001', 'proj_001', 'prod_001', NULL, 500, 150, 'Framing lumber for walls', '2024-01-05T10:30:00Z'),
('pm_002', 'proj_001', 'prod_002', NULL, 150, 50, 'Outdoor framing', '2024-01-05T10:45:00Z'),
('pm_003', 'proj_001', 'prod_007', 'var_002', 50, 0, 'Interior walls painting', '2024-01-06T14:00:00Z'),
('pm_004', 'proj_002', 'prod_010', NULL, 800, 0, 'Interior walls', '2024-12-20T09:30:00Z');

-- Insert project documents
INSERT INTO project_documents (document_id, project_id, document_name, document_url, document_type, file_size, uploaded_by, uploaded_at) VALUES
('doc_001', 'proj_001', 'Floor Plans.pdf', 'https://picsum.photos/seed/doc001/400', 'plans', 2458624, 'user_001', '2024-01-05T11:00:00Z'),
('doc_002', 'proj_001', 'Building Permit.pdf', 'https://picsum.photos/seed/doc002/400', 'permit', 1854720, 'user_001', '2024-01-05T11:15:00Z'),
('doc_003', 'proj_002', 'Site Survey.pdf', 'https://picsum.photos/seed/doc003/400', 'survey', 3145728, 'user_002', '2023-12-20T10:00:00Z');

-- Insert promotions
INSERT INTO promotions (promotion_id, supplier_id, promotion_name, promotion_type, discount_code, discount_type, discount_value, minimum_purchase_amount, applicable_product_ids, applicable_category_ids, customer_eligibility, start_date, end_date, total_usage_limit, per_customer_limit, current_usage_count, is_active, show_on_shop_page, show_on_product_pages, email_to_followers, created_at, updated_at) VALUES
('promo_001', 'sup_001', 'New Year Lumber Sale', 'seasonal', 'SAVE10', 'percentage', 10.00, 200.00, NULL, '["cat_001"]', 'all', '2024-01-01T00:00:00Z', '2024-01-31T23:59:59Z', 500, 3, 45, true, true, true, true, '2023-12-28T10:00:00Z', '2024-01-15T08:00:00Z'),
('promo_002', 'sup_002', 'Tool Tuesday', 'weekly', 'TOOLTUES', 'percentage', 15.00, 100.00, NULL, '["cat_003"]', 'all', '2024-01-09T00:00:00Z', '2024-01-31T23:59:59Z', NULL, 1, 23, true, true, true, false, '2024-01-08T08:00:00Z', '2024-01-09T08:00:00Z'),
('promo_003', 'sup_005', 'Bulk Order Discount', 'bulk', 'BULK10', 'percentage', 10.00, 1000.00, NULL, NULL, 'business', '2024-01-01T00:00:00Z', '2024-12-31T23:59:59Z', NULL, NULL, 12, true, false, false, false, '2023-12-15T10:00:00Z', '2024-01-05T10:00:00Z');

-- Insert promotion usage
INSERT INTO promotion_usage (usage_id, promotion_id, order_id, customer_id, discount_amount, used_at) VALUES
('pu_001', 'promo_001', 'ord_001', 'user_001', 92.28, '2024-01-08T10:00:00Z'),
('pu_002', 'promo_003', 'ord_005', 'user_005', 192.29, '2024-01-09T09:00:00Z');

-- Insert trade credit applications
INSERT INTO trade_credit_applications (application_id, business_account_id, requested_credit_limit, desired_terms, business_financials, bank_references, trade_references, status, approved_credit_limit, approved_terms, rejection_reason, reviewed_by, submitted_at, reviewed_at) VALUES
('tca_001', 'biz_001', 50000.00, 'net_30', '{"annual_revenue": 2500000, "years_in_business": 8}', '[{"bank_name": "First National Bank", "account_years": 5, "contact": "Jane Smith"}]', '[{"company": "ABC Suppliers", "contact": "John Doe", "phone": "+1-555-1234"}]', 'approved', 50000.00, 'net_30', NULL, 'user_011', '2023-12-01T10:00:00Z', '2023-12-05T14:00:00Z');

-- Insert trade credit accounts
INSERT INTO trade_credit_accounts (credit_account_id, business_account_id, credit_limit, available_credit, credit_terms, outstanding_balance, status, created_at, updated_at) VALUES
('tca_act_001', 'biz_001', 50000.00, 48024.14, 'net_30', 1975.86, 'active', '2023-12-05T14:00:00Z', '2024-01-08T10:00:00Z');

-- Insert credit invoices
INSERT INTO credit_invoices (invoice_id, credit_account_id, order_id, invoice_number, invoice_amount, due_date, paid_amount, status, issued_at, paid_at) VALUES
('ci_001', 'tca_act_001', 'ord_001', 'INV-2024-001', 1975.86, '2024-02-07', 0.00, 'outstanding', '2024-01-08T10:00:00Z', NULL);

-- Insert credit payments (none yet)

-- Insert payouts
INSERT INTO payouts (payout_id, supplier_id, period_start, period_end, gross_amount, platform_fees, payment_processing_fees, refunds_deducted, chargebacks_deducted, net_amount, order_count, currency, bank_account_last_four, status, bank_transfer_id, scheduled_date, paid_date, created_at) VALUES
('payout_001', 'sup_001', '2024-01-01', '2024-01-07', 5845.25, 496.85, 116.91, 0.00, 0.00, 5231.49, 2, 'USD', '1234', 'completed', 'BT-2024-001', '2024-01-14', '2024-01-14', '2024-01-08T00:00:00Z'),
('payout_002', 'sup_002', '2024-01-01', '2024-01-14', 785.95, 58.50, 15.72, 89.99, 0.00, 621.74, 1, 'USD', '5678', 'completed', 'BT-2024-002', '2024-01-21', '2024-01-21', '2024-01-15T00:00:00Z');

-- Insert payout line items
INSERT INTO payout_line_items (line_item_id, payout_id, order_id, order_date, customer_name, order_amount, platform_fee, net_amount) VALUES
('pli_001', 'payout_001', 'ord_001', '2024-01-08', 'John Anderson', 1975.86, 167.95, 1807.91),
('pli_002', 'payout_002', 'ord_002', '2024-01-09', 'Sarah Mitchell', 750.70, 58.50, 692.20);

-- Insert secondary marketplace listings
INSERT INTO secondary_marketplace_listings (listing_id, seller_id, product_description, category_id, quantity, condition, original_purchase_date, asking_price, is_negotiable, postal_code, city, state, offers_delivery, offers_pickup, pickup_location, photo_urls, status, view_count, marked_sold_at, created_at, updated_at) VALUES
('sml_001', 'user_003', 'Dewalt 20V Cordless Drill - Lightly Used', 'cat_003', 1, 'like_new', '2023-06-15', 85.00, true, '77001', 'Houston', 'TX', false, true, '789 Oak Street, Houston', '["https://picsum.photos/seed/listing001a/400", "https://picsum.photos/seed/listing001b/400"]', 'active', 45, NULL, '2024-01-10T15:00:00Z', '2024-01-10T15:00:00Z'),
('sml_002', 'user_014', 'Extra Hardwood Flooring - Red Oak', 'cat_007', 75, 'new', '2023-12-01', 4.50, false, '78201', 'San Antonio', 'TX', true, true, 'San Antonio area', '["https://picsum.photos/seed/listing002a/400"]', 'active', 23, NULL, '2024-01-12T10:00:00Z', '2024-01-12T10:00:00Z');

-- Insert forum threads
INSERT INTO forum_threads (thread_id, topic_category, author_id, title, content, images, is_pinned, is_locked, has_solution, solution_post_id, view_count, reply_count, like_count, last_activity_at, created_at, updated_at) VALUES
('thread_001', 'advice', 'user_003', 'Best way to install hardwood flooring?', 'I''m planning to install hardwood flooring in my living room. Any tips for a first-timer?', NULL, false, false, true, 'post_002', 234, 12, 18, '2024-01-14T16:30:00Z', '2024-01-10T09:00:00Z', '2024-01-14T16:30:00Z'),
('thread_002', 'product_recommendation', 'user_004', 'Best circular saw under $100?', 'Looking for recommendations for a good circular saw for occasional DIY projects. Budget is around $100.', NULL, false, false, false, NULL, 156, 8, 12, '2024-01-13T14:00:00Z', '2024-01-11T13:00:00Z', '2024-01-13T14:00:00Z'),
('thread_003', 'showcase', 'user_005', 'Completed deck project with pressure treated lumber', 'Just finished building a 400 sq ft deck using pressure treated lumber from ACME. Here are some photos!', '["https://picsum.photos/seed/thread003a/600", "https://picsum.photos/seed/thread003b/600"]', true, false, false, NULL, 512, 24, 67, '2024-01-15T11:00:00Z', '2024-01-08T14:00:00Z', '2024-01-15T11:00:00Z');

-- Insert forum posts
INSERT INTO forum_posts (post_id, thread_id, author_id, content, images, is_solution, like_count, created_at, updated_at) VALUES
('post_001', 'thread_001', 'user_001', 'Make sure to acclimate the wood for at least 72 hours before installation. Also rent a pneumatic nailer, it makes the job so much easier!', NULL, false, 8, '2024-01-10T10:30:00Z', '2024-01-10T10:30:00Z'),
('post_002', 'thread_001', 'user_014', 'I just finished installing hardwood. Key tips: 1) Leave expansion gaps around edges 2) Stagger the joints 3) Use proper underlayment. Let me know if you need more details!', '["https://picsum.photos/seed/post002a/400"]', true, 15, '2024-01-11T14:00:00Z', '2024-01-11T14:00:00Z'),
('post_003', 'thread_002', 'user_003', 'I have the ProPower 7-1/4" saw and it''s been great for the price. Plenty of power for DIY work.', NULL, false, 5, '2024-01-11T15:00:00Z', '2024-01-11T15:00:00Z'),
('post_004', 'thread_003', 'user_003', 'Looks amazing! How long did it take you?', NULL, false, 12, '2024-01-09T10:00:00Z', '2024-01-09T10:00:00Z');

-- Insert forum likes
INSERT INTO forum_likes (like_id, user_id, target_type, target_id, created_at) VALUES
('fl_001', 'user_003', 'thread', 'thread_003', '2024-01-09T11:00:00Z'),
('fl_002', 'user_004', 'thread', 'thread_003', '2024-01-10T14:00:00Z'),
('fl_003', 'user_001', 'post', 'post_002', '2024-01-12T09:00:00Z');

-- Insert how-to guides
INSERT INTO how_to_guides (guide_id, author_id, title, slug, category, skill_level, project_type, time_required, introduction, steps, materials_list, cover_image_url, video_url, rating_average, rating_count, view_count, save_count, status, created_at, updated_at) VALUES
('guide_001', 'user_005', 'How to Build a Simple Deck', 'how-to-build-simple-deck', 'outdoor', 'intermediate', 'deck_building', '2-3 days', 'Building a deck is a rewarding DIY project that can add value and living space to your home. This guide will walk you through building a simple ground-level deck.', '[{"step": 1, "title": "Plan and Measure", "description": "Measure your space and create a design plan", "image": "https://picsum.photos/seed/step001a/600"}, {"step": 2, "title": "Prepare the Ground", "description": "Level the ground and install concrete footings", "image": "https://picsum.photos/seed/step001b/600"}, {"step": 3, "title": "Build the Frame", "description": "Construct the deck frame with treated lumber", "image": "https://picsum.photos/seed/step001c/600"}, {"step": 4, "title": "Install Decking", "description": "Lay and secure decking boards", "image": "https://picsum.photos/seed/step001d/600"}]', '[{"item": "4x4 Pressure Treated Posts", "quantity": 8}, {"item": "2x8 Pressure Treated Joists", "quantity": 12}, {"item": "5/4x6 Decking Boards", "quantity": 50}, {"item": "Concrete Mix", "quantity": 6}, {"item": "Galvanized Deck Screws", "quantity": 5}]', 'https://picsum.photos/seed/guide001/800', NULL, 4.8, 34, 1456, 89, 'published', '2024-01-05T10:00:00Z', '2024-01-15T14:00:00Z'),
('guide_002', 'user_001', 'Installing Hardwood Flooring: Complete Guide', 'installing-hardwood-flooring', 'flooring', 'intermediate', 'flooring', '1-2 days per room', 'Hardwood flooring adds beauty and value to any home. Learn how to install it like a pro in this comprehensive guide.', '[{"step": 1, "title": "Acclimate the Wood", "description": "Let flooring sit in the room for 72+ hours", "image": "https://picsum.photos/seed/step002a/600"}, {"step": 2, "title": "Prepare Subfloor", "description": "Ensure subfloor is clean, level, and dry", "image": "https://picsum.photos/seed/step002b/600"}, {"step": 3, "title": "Install Underlayment", "description": "Roll out and secure moisture barrier", "image": "https://picsum.photos/seed/step002c/600"}, {"step": 4, "title": "Lay First Row", "description": "Start with straightest boards along longest wall", "image": "https://picsum.photos/seed/step002d/600"}, {"step": 5, "title": "Continue Installation", "description": "Stagger joints and nail boards securely", "image": "https://picsum.photos/seed/step002e/600"}]', '[{"item": "Hardwood Flooring", "quantity": "per sq ft"}, {"item": "Underlayment", "quantity": "per sq ft"}, {"item": "Finishing Nails", "quantity": 2}, {"item": "Wood Glue", "quantity": 1}]', 'https://picsum.photos/seed/guide002/800', NULL, 4.6, 28, 987, 56, 'published', '2024-01-08T11:00:00Z', '2024-01-14T10:00:00Z');

-- Insert guide ratings
INSERT INTO guide_ratings (rating_id, guide_id, user_id, rating, review_text, created_at) VALUES
('gr_001', 'guide_001', 'user_003', 5, 'Very helpful guide! Built my deck following these steps and it turned out great.', '2024-01-12T15:00:00Z'),
('gr_002', 'guide_001', 'user_004', 5, 'Clear instructions with good photos. Highly recommend.', '2024-01-14T10:00:00Z'),
('gr_003', 'guide_002', 'user_003', 4, 'Good guide overall. Would have liked more detail on the sanding and finishing process.', '2024-01-13T16:00:00Z');

-- Insert project showcases
INSERT INTO project_showcases (showcase_id, user_id, title, project_type, description, before_photos, after_photos, materials_used, estimated_cost, project_duration, like_count, status, is_featured, created_at) VALUES
('showcase_001', 'user_005', 'Backyard Deck Transformation', 'outdoor', 'Transformed our boring backyard into an amazing outdoor living space with a beautiful deck. Used all pressure treated lumber from ACME Building Supplies.', '["https://picsum.photos/seed/before001a/600", "https://picsum.photos/seed/before001b/600"]', '["https://picsum.photos/seed/after001a/600", "https://picsum.photos/seed/after001b/600", "https://picsum.photos/seed/after001c/600"]', '[{"item": "Pressure Treated Lumber", "quantity": "2000 linear feet"}, {"item": "Concrete Footings", "quantity": 12}, {"item": "Deck Screws", "quantity": "10 lbs"}]', 3500.00, '3 weekends', 67, 'published', true, '2024-01-09T14:00:00Z'),
('showcase_002', 'user_004', 'Kitchen Renovation', 'interior', 'Complete kitchen makeover including new flooring, paint, and fixtures. So happy with the results!', '["https://picsum.photos/seed/before002a/600"]', '["https://picsum.photos/seed/after002a/600", "https://picsum.photos/seed/after002b/600"]', '[{"item": "Hardwood Flooring", "quantity": "250 sq ft"}, {"item": "Interior Paint", "quantity": "5 gallons"}, {"item": "Cabinet Hardware", "quantity": "various"}]', 8500.00, '2 months', 43, 'published', false, '2024-01-11T16:00:00Z');

-- Insert showcase likes
INSERT INTO showcase_likes (like_id, showcase_id, user_id, created_at) VALUES
('sl_001', 'showcase_001', 'user_003', '2024-01-10T10:00:00Z'),
('sl_002', 'showcase_001', 'user_004', '2024-01-10T15:00:00Z'),
('sl_003', 'showcase_002', 'user_003', '2024-01-12T11:00:00Z');

-- Insert showcase comments
INSERT INTO showcase_comments (comment_id, showcase_id, user_id, comment_text, created_at) VALUES
('sc_001', 'showcase_001', 'user_003', 'This looks incredible! Great work!', '2024-01-10T10:30:00Z'),
('sc_002', 'showcase_001', 'user_001', 'Beautiful deck! What stain did you use?', '2024-01-11T09:00:00Z'),
('sc_003', 'showcase_002', 'user_005', 'Love the hardwood floors! What species is that?', '2024-01-12T14:00:00Z');

-- Insert support tickets
INSERT INTO support_tickets (ticket_id, ticket_number, user_id, category, subject, description, priority, status, assigned_to, related_order_id, created_at, updated_at, resolved_at, closed_at) VALUES
('ticket_001', 'TICK-2024-001', 'user_003', 'order_issue', 'Missing items in delivery', 'I received my order ORD-2024-003 but it seems to be missing 2 boxes of screws that were listed on the invoice.', 'high', 'resolved', 'user_012', 'ord_003', '2024-01-14T10:00:00Z', '2024-01-14T16:00:00Z', '2024-01-14T16:00:00Z', '2024-01-14T16:00:00Z'),
('ticket_002', 'TICK-2024-002', 'user_004', 'product_question', 'Compatibility question about paint', 'I''m wondering if the Interior Latex Paint is compatible with previously painted surfaces, or do I need to use a primer first?', 'medium', 'open', 'user_012', NULL, '2024-01-15T13:00:00Z', '2024-01-15T13:00:00Z', NULL, NULL);

-- Insert ticket responses
INSERT INTO ticket_responses (response_id, ticket_id, responder_id, response_text, attachment_urls, is_internal, created_at) VALUES
('tr_001', 'ticket_001', 'user_012', 'Thank you for contacting us. I''ve checked with the warehouse and confirmed we''ll send out the missing screws today via expedited shipping at no charge. You should receive them tomorrow.', NULL, false, '2024-01-14T11:00:00Z'),
('tr_002', 'ticket_001', 'user_003', 'Thank you so much! That''s great customer service.', NULL, false, '2024-01-14T14:00:00Z'),
('tr_003', 'ticket_002', 'user_012', 'Great question! Our Interior Latex Paint has excellent adhesion and can be applied directly over previously painted surfaces in good condition. However, if the existing paint is glossy or in poor condition, we recommend using a primer for best results.', NULL, false, '2024-01-15T14:00:00Z');

-- Insert canned responses
INSERT INTO canned_responses (response_id, supplier_id, response_name, message_text, category_tag, usage_count, created_at, updated_at) VALUES
('cr_001', 'sup_001', 'Delivery ETA', 'Thank you for your inquiry. Standard deliveries typically arrive within 2-3 business days. We''ll send you tracking information once your order ships.', 'delivery', 45, '2023-04-01T08:00:00Z', '2024-01-15T08:00:00Z'),
('cr_002', 'sup_001', 'Product Availability', 'Thanks for asking! This item is currently in stock. We have ample inventory to fulfill your order.', 'inventory', 32, '2023-04-01T08:00:00Z', '2024-01-10T10:00:00Z'),
('cr_003', 'sup_003', 'Return Policy', 'We accept returns within 60 days of purchase. Items must be unused and in original packaging. Please contact us to initiate a return.', 'returns', 18, '2023-05-01T08:00:00Z', '2024-01-08T14:00:00Z');

-- Insert announcements
INSERT INTO announcements (announcement_id, title, message, target_audience, audience_filter, delivery_methods, status, scheduled_for, sent_at, recipient_count, open_rate, click_rate, created_by, created_at) VALUES
('ann_001', 'New Supplier Onboarded', 'We''re excited to announce that Elite Lumber & Materials has joined our platform! Check out their premium lumber selection.', 'all_users', NULL, '["email", "in_app"]', 'sent', NULL, '2024-01-05T10:00:00Z', 1245, 45.5, 12.3, 'user_011', '2024-01-04T15:00:00Z'),
('ann_002', 'January Promotions', 'Start the new year right! Multiple suppliers are offering special discounts this month. Check out the promotions page.', 'customers', '{"account_type": "all"}', '["email", "in_app", "push"]', 'sent', NULL, '2024-01-08T09:00:00Z', 987, 52.3, 18.7, 'user_011', '2024-01-07T16:00:00Z');

-- Insert user preferences
INSERT INTO user_preferences (preference_id, user_id, preferred_brands, preferred_suppliers, category_interests, preferred_units, language, timezone, email_notifications, sms_notifications, push_notifications, marketing_emails_opt_in, created_at, updated_at) VALUES
('pref_001', 'user_001', '["ACME Lumber", "ProTool"]', '["sup_001", "sup_002"]', '["cat_001", "cat_002", "cat_003"]', 'imperial', 'en', 'America/Chicago', '{"order_updates": true, "promotions": true, "newsletters": true}', '{"order_updates": true, "delivery_alerts": true}', '{"order_updates": true, "messages": true, "promotions": false}', true, '2023-06-15T08:00:00Z', '2024-01-10T14:00:00Z'),
('pref_002', 'user_003', NULL, '["sup_003"]', '["cat_003", "cat_006"]', 'imperial', 'en', 'America/Chicago', '{"order_updates": true, "promotions": false, "newsletters": false}', '{"order_updates": true, "delivery_alerts": false}', '{"order_updates": true, "messages": true, "promotions": false}', false, '2023-08-10T10:30:00Z', '2024-01-12T09:00:00Z');

-- Insert supplier followers
INSERT INTO supplier_followers (follow_id, user_id, supplier_id, notify_new_products, notify_promotions, followed_at) VALUES
('follow_001', 'user_001', 'sup_001', true, true, '2023-06-16T10:00:00Z'),
('follow_002', 'user_001', 'sup_002', true, true, '2023-07-01T11:00:00Z'),
('follow_003', 'user_003', 'sup_003', true, false, '2023-08-15T14:00:00Z'),
('follow_004', 'user_004', 'sup_005', true, true, '2023-09-10T09:00:00Z');

-- Insert approval workflows
INSERT INTO approval_workflows (workflow_id, business_account_id, threshold_amount, approver_ids, require_all_approvers, is_active, created_at) VALUES
('workflow_001', 'biz_001', 2000.00, '["user_001"]', false, true, '2023-06-15T09:00:00Z'),
('workflow_002', 'biz_003', 5000.00, '["user_005"]', false, true, '2023-05-12T09:00:00Z');

-- Insert order approvals
INSERT INTO order_approvals (approval_id, order_id, workflow_id, approver_id, status, decision_notes, requested_at, decided_at) VALUES
('appr_001', 'ord_005', 'workflow_002', 'user_005', 'approved', 'Approved for warehouse expansion project', '2024-01-09T09:00:00Z', '2024-01-09T10:00:00Z');

-- Insert platform settings
INSERT INTO platform_settings (setting_id, setting_key, setting_value, setting_type, description, updated_by, updated_at) VALUES
('set_001', 'commission_rate_default', '8.5', 'number', 'Default commission rate for new suppliers', 'user_011', '2023-01-01T00:00:00Z'),
('set_002', 'minimum_order_value', '50.00', 'number', 'Minimum order value for checkout', 'user_011', '2023-01-01T00:00:00Z'),
('set_003', 'tax_rate', '8.25', 'number', 'Default tax rate percentage', 'user_011', '2023-01-01T00:00:00Z');

-- Insert activity logs
INSERT INTO activity_logs (log_id, user_id, activity_type, entity_type, entity_id, action, details, ip_address, user_agent, created_at) VALUES
('log_001', 'user_001', 'order', 'order', 'ord_001', 'created', '{"order_total": 1975.86, "items_count": 2}', '192.168.1.100', 'Mozilla/5.0', '2024-01-08T10:00:00Z'),
('log_002', 'user_001', 'cart', 'cart', 'cart_001', 'updated', '{"items_added": 1}', '192.168.1.100', 'Mozilla/5.0', '2024-01-14T09:00:00Z'),
('log_003', 'user_006', 'product', 'product', 'prod_001', 'updated', '{"field": "quantity_on_hand", "old_value": 1000, "new_value": 850}', '192.168.2.50', 'Mozilla/5.0', '2024-01-08T14:00:00Z');

-- Insert search analytics
INSERT INTO search_analytics (search_id, user_id, session_id, search_query, filters_applied, results_count, clicked_product_ids, resulted_in_purchase, searched_at) VALUES
('search_001', 'user_003', 'sess_001', 'cordless drill', '{"category": "cat_003", "price_max": 150}', 12, '["prod_003"]', true, '2024-01-13T10:00:00Z'),
('search_002', 'user_004', 'sess_002', 'interior paint white', '{"category": "cat_006"}', 8, '["prod_007"]', true, '2024-01-12T13:00:00Z'),
('search_003', 'user_001', 'sess_003', '2x4 lumber', NULL, 25, '["prod_001"]', true, '2024-01-07T15:00:00Z');

-- Insert page views
INSERT INTO page_views (view_id, user_id, session_id, page_type, entity_id, referrer_url, duration_seconds, viewed_at) VALUES
('view_001', 'user_003', 'sess_001', 'product', 'prod_003', 'https://google.com', 125, '2024-01-13T10:05:00Z'),
('view_002', 'user_004', 'sess_002', 'product', 'prod_007', 'https://google.com', 87, '2024-01-12T13:10:00Z'),
('view_003', 'user_001', 'sess_003', 'supplier', 'sup_001', NULL, 245, '2024-01-07T14:30:00Z'),
('view_004', NULL, 'sess_004', 'product', 'prod_005', 'https://google.com', 56, '2024-01-15T11:00:00Z');

-- Insert bank accounts
INSERT INTO bank_accounts (bank_account_id, supplier_id, account_holder_name, bank_name, account_number_last_four, routing_number, account_type, is_verified, verification_method, verification_date, created_at) VALUES
('bank_001', 'sup_001', 'ACME Building Supplies LLC', 'First National Bank', '1234', '111000025', 'business_checking', true, 'micro_deposits', '2023-04-05T00:00:00Z', '2023-04-01T08:00:00Z'),
('bank_002', 'sup_002', 'Pro Building Materials Inc', 'Texas State Bank', '5678', '111000025', 'business_checking', true, 'micro_deposits', '2023-04-20T00:00:00Z', '2023-04-15T08:00:00Z'),
('bank_003', 'sup_003', 'Quality Hardware & Tools LLC', 'Houston First Bank', '9012', '111000025', 'business_checking', true, 'instant_verification', '2023-05-05T00:00:00Z', '2023-05-01T08:00:00Z');

-- Insert supplier inventory alerts
INSERT INTO supplier_inventory_alerts (alert_id, supplier_id, product_id, alert_type, threshold_value, current_value, is_acknowledged, acknowledged_at, created_at) VALUES
('inv_alert_001', 'sup_002', 'prod_003', 'low_stock', 10.00, 8.00, false, NULL, '2024-01-15T06:00:00Z'),
('inv_alert_002', 'sup_003', 'prod_005', 'low_stock', 10.00, 9.00, true, '2024-01-14T08:00:00Z', '2024-01-13T06:00:00Z');

-- Insert price drop alerts
INSERT INTO price_drop_alerts (alert_id, user_id, product_id, original_price, alert_price, current_price, is_notified, notified_at, created_at) VALUES
('pda_001', 'user_003', 'prod_003', 179.99, 130.00, 129.99, true, '2024-01-10T08:00:00Z', '2024-01-05T14:00:00Z');

-- Insert back in stock alerts
INSERT INTO back_in_stock_alerts (alert_id, user_id, product_id, variant_id, is_notified, notified_at, created_at) VALUES
('bis_001', 'user_004', 'prod_006', NULL, false, NULL, '2024-01-12T15:00:00Z');

-- Insert recurring orders
INSERT INTO recurring_orders (recurring_order_id, user_id, order_name, items, delivery_address_id, payment_method_id, frequency, next_order_date, status, last_order_id, last_processed_at, created_at, updated_at) VALUES
('rec_001', 'user_001', 'Monthly Hardware Supplies', '[{"product_id": "prod_004", "quantity": 5}]', 'addr_001', 'pm_001', 'monthly', '2024-02-08', 'active', NULL, NULL, '2024-01-08T12:00:00Z', '2024-01-08T12:00:00Z');

-- Insert saved carts
INSERT INTO saved_carts (saved_cart_id, cart_id, saved_by, saved_at) VALUES
('saved_001', 'cart_001', 'user_001', '2024-01-14T10:00:00Z');