// @ts-nocheck
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { createServer } from 'http';
import morgan from 'morgan';
import { createUserInputSchema, createAddressInputSchema, createProductInputSchema, createShoppingCartInputSchema, createCartItemInputSchema, createOrderInputSchema, createProductReviewInputSchema, createSupplierReviewInputSchema, createWishlistInputSchema, createProjectInputSchema } from './schema.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432, JWT_SECRET = 'buildeasy-secret-key-change-in-production' } = process.env;
const pool = new Pool(DATABASE_URL
    ? {
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    }
    : {
        host: PGHOST,
        database: PGDATABASE,
        user: PGUSER,
        password: PGPASSWORD,
        port: Number(PGPORT),
        ssl: { rejectUnauthorized: false },
    });
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
    }
});
const port = process.env.PORT || 3000;
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
app.use(express.static(path.join(__dirname, 'public')));
const storagePath = path.join(__dirname, 'storage');
if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
}
function createErrorResponse(message, error, errorCode) {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };
    if (errorCode)
        response.error_code = errorCode;
    if (error) {
        response.details = {
            name: error.name,
            message: error.message,
            stack: error.stack
        };
    }
    return response;
}
function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json(createErrorResponse('Access token required', null, 'AUTH_TOKEN_REQUIRED'));
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await pool.query('SELECT user_id, email, name, role, account_type, status FROM users WHERE user_id = $1', [decoded.user_id]);
        if (result.rows.length === 0) {
            return res.status(401).json(createErrorResponse('Invalid token', null, 'AUTH_TOKEN_INVALID'));
        }
        const user = result.rows[0];
        if (user.status !== 'active') {
            return res.status(401).json(createErrorResponse('Account not active', null, 'ACCOUNT_INACTIVE'));
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(403).json(createErrorResponse('Invalid or expired token', error, 'AUTH_TOKEN_INVALID'));
    }
};
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json(createErrorResponse('Forbidden', null, 'FORBIDDEN'));
        }
        next();
    };
};
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication required'));
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.user_id;
        socket.userRole = decoded.role;
        socket.userEmail = decoded.email;
        next();
    }
    catch (err) {
        next(new Error('Authentication failed'));
    }
});
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    socket.join(`user:${socket.userId}`);
    socket.on('subscribe:product', ({ product_id }) => {
        socket.join(`product:${product_id}`);
    });
    socket.on('unsubscribe:product', ({ product_id }) => {
        socket.leave(`product:${product_id}`);
    });
    socket.on('join:tracking', ({ order_id }) => {
        socket.join(`order:${order_id}`);
    });
    socket.on('leave:tracking', ({ order_id }) => {
        socket.leave(`order:${order_id}`);
    });
    socket.on('join:conversation', ({ conversation_id }) => {
        socket.join(`conversation:${conversation_id}`);
    });
    socket.on('leave:conversation', ({ conversation_id }) => {
        socket.leave(`conversation:${conversation_id}`);
    });
    socket.on('typing:start', ({ conversation_id }) => {
        socket.to(`conversation:${conversation_id}`).emit('typing:start', {
            user_id: socket.userId,
            timestamp: new Date().toISOString()
        });
    });
    socket.on('typing:stop', ({ conversation_id }) => {
        socket.to(`conversation:${conversation_id}`).emit('typing:stop', {
            user_id: socket.userId,
            timestamp: new Date().toISOString()
        });
    });
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
    });
});
app.post('/api/auth/register', async (req, res) => {
    try {
        const validatedData = createUserInputSchema.parse(req.body);
        const existingUser = await pool.query('SELECT user_id FROM users WHERE email = $1 OR phone = $2', [validatedData.email, validatedData.phone]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json(createErrorResponse('Email or phone already registered', null, 'USER_EXISTS'));
        }
        const userId = generateId('usr');
        const now = new Date().toISOString();
        const result = await pool.query(`INSERT INTO users (user_id, email, phone, password_hash, name, role, account_type, 
        email_verified, phone_verified, profile_photo_url, status, last_login, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`, [userId, validatedData.email, validatedData.phone, validatedData.password_hash,
            validatedData.name, validatedData.role, validatedData.account_type,
            validatedData.email_verified, validatedData.phone_verified, validatedData.profile_photo_url,
            validatedData.status, null, now, now]);
        const user = result.rows[0];
        await pool.query(`INSERT INTO user_preferences (preference_id, user_id, preferred_brands, preferred_suppliers,
        category_interests, preferred_units, language, timezone, email_notifications, sms_notifications,
        push_notifications, marketing_emails_opt_in, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`, [generateId('pref'), userId, null, null, null, 'imperial', 'en', null,
            JSON.stringify({ order_updates: true, delivery_notifications: true, messages: true, price_drops: true, back_in_stock: true, promotions: false }),
            JSON.stringify({ order_updates: false, delivery_notifications: true, messages: false }),
            JSON.stringify({ order_updates: true, delivery_notifications: true, messages: true, price_drops: true, promotions: false }),
            false, now, now]);
        const token = jwt.sign({ user_id: user.user_id, email: user.email, role: user.role, account_type: user.account_type }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ user, token });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json(createErrorResponse('Email and password required', null, 'MISSING_CREDENTIALS'));
        }
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json(createErrorResponse('Invalid credentials', null, 'INVALID_CREDENTIALS'));
        }
        const user = result.rows[0];
        if (user.password_hash !== password) {
            return res.status(401).json(createErrorResponse('Invalid credentials', null, 'INVALID_CREDENTIALS'));
        }
        if (user.status !== 'active') {
            return res.status(401).json(createErrorResponse('Account not active', null, 'ACCOUNT_INACTIVE'));
        }
        const now = new Date().toISOString();
        await pool.query('UPDATE users SET last_login = $1, updated_at = $2 WHERE user_id = $3', [now, now, user.user_id]);
        const token = jwt.sign({ user_id: user.user_id, email: user.email, role: user.role, account_type: user.account_type }, JWT_SECRET, { expiresIn: '7d' });
        const userResponse = { ...user };
        delete userResponse.password_hash;
        res.json({ user: userResponse, token });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/auth/password-reset/request', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json(createErrorResponse('Email required', null, 'MISSING_EMAIL'));
        }
        const result = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
        res.json({ message: 'If an account exists with that email, a password reset link has been sent.' });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/auth/password-reset/confirm', async (req, res) => {
    try {
        const { reset_token, new_password } = req.body;
        if (!reset_token || !new_password) {
            return res.status(400).json(createErrorResponse('Token and password required', null, 'MISSING_FIELDS'));
        }
        res.json({ message: 'Password reset successful' });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/users/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.user.user_id]);
        const user = result.rows[0];
        delete user.password_hash;
        res.json(user);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.patch('/api/users/me', authenticateToken, async (req, res) => {
    try {
        const updates = [];
        const values = [];
        let paramCount = 1;
        if (req.body.name) {
            updates.push(`name = $${paramCount++}`);
            values.push(req.body.name);
        }
        if (req.body.phone) {
            updates.push(`phone = $${paramCount++}`);
            values.push(req.body.phone);
        }
        if (req.body.profile_photo_url !== undefined) {
            updates.push(`profile_photo_url = $${paramCount++}`);
            values.push(req.body.profile_photo_url);
        }
        const now = new Date().toISOString();
        updates.push(`updated_at = $${paramCount++}`);
        values.push(now);
        values.push(req.user.user_id);
        const result = await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = $${paramCount} RETURNING *`, values);
        const user = result.rows[0];
        delete user.password_hash;
        res.json(user);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.delete('/api/users/me', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE user_id = $1', [req.user.user_id]);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/users/me/addresses', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [req.user.user_id]);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/users/me/addresses', authenticateToken, async (req, res) => {
    try {
        const validatedData = createAddressInputSchema.parse({ ...req.body, user_id: req.user.user_id });
        const addressId = generateId('addr');
        const now = new Date().toISOString();
        if (validatedData.is_default) {
            await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.user_id]);
        }
        const result = await pool.query(`INSERT INTO addresses (address_id, user_id, address_label, address_line_1, address_line_2, 
        city, state, postal_code, country, latitude, longitude, is_default, contact_name, 
        contact_phone, delivery_instructions, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`, [addressId, validatedData.user_id, validatedData.address_label, validatedData.address_line_1,
            validatedData.address_line_2, validatedData.city, validatedData.state, validatedData.postal_code,
            validatedData.country, validatedData.latitude, validatedData.longitude, validatedData.is_default,
            validatedData.contact_name, validatedData.contact_phone, validatedData.delivery_instructions,
            now, now]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.patch('/api/addresses/:address_id', authenticateToken, async (req, res) => {
    try {
        const checkOwner = await pool.query('SELECT * FROM addresses WHERE address_id = $1 AND user_id = $2', [req.params.address_id, req.user.user_id]);
        if (checkOwner.rows.length === 0) {
            return res.status(404).json(createErrorResponse('Address not found', null, 'NOT_FOUND'));
        }
        const updates = [];
        const values = [];
        let paramCount = 1;
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined && key !== 'address_id' && key !== 'user_id') {
                updates.push(`${key} = $${paramCount++}`);
                values.push(req.body[key]);
            }
        });
        const now = new Date().toISOString();
        updates.push(`updated_at = $${paramCount++}`);
        values.push(now);
        values.push(req.params.address_id);
        const result = await pool.query(`UPDATE addresses SET ${updates.join(', ')} WHERE address_id = $${paramCount} RETURNING *`, values);
        res.json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.delete('/api/addresses/:address_id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM addresses WHERE address_id = $1 AND user_id = $2', [req.params.address_id, req.user.user_id]);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/categories', async (req, res) => {
    try {
        const { parent_category_id, is_active } = req.query;
        let query = 'SELECT * FROM categories WHERE 1=1';
        const values = [];
        let paramCount = 1;
        if (parent_category_id !== undefined) {
            query += ` AND ${parent_category_id === 'null' ? 'parent_category_id IS NULL' : `parent_category_id = $${paramCount++}`}`;
            if (parent_category_id !== 'null')
                values.push(parent_category_id);
        }
        if (is_active !== undefined) {
            query += ` AND is_active = $${paramCount++}`;
            // Coerce to boolean properly
            values.push(is_active === 'true' || is_active === true);
        }
        query += ' ORDER BY display_order ASC, category_name ASC';
        const result = await pool.query(query, values);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/categories/:category_id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories WHERE category_id = $1', [req.params.category_id]);
        if (result.rows.length === 0) {
            return res.status(404).json(createErrorResponse('Category not found', null, 'NOT_FOUND'));
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/products', async (req, res) => {
    try {
        const { q, category, subcategory, supplier_id, brand, price_min, price_max, availability, supplier_rating_min, product_rating_min, is_eco_friendly, tags, sort_by = 'created_at' } = req.query;
        // Coerce query params to proper types with defaults
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 24;
        let query = `SELECT p.*, s.shop_name, s.rating_average as supplier_rating, s.is_verified as supplier_verified,
                  (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = true LIMIT 1) as primary_image_url
                 FROM products p
                 JOIN suppliers s ON p.supplier_id = s.supplier_id
                 WHERE p.status = 'active' AND s.status = 'active'`;
        const values = [];
        let paramCount = 1;
        if (q) {
            query += ` AND (p.product_name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
            values.push(`%${q}%`);
            paramCount++;
        }
        if (category) {
            query += ` AND (p.category_id = $${paramCount} OR p.subcategory_id = $${paramCount})`;
            values.push(category);
            paramCount++;
        }
        if (subcategory) {
            query += ` AND p.subcategory_id = $${paramCount++}`;
            values.push(subcategory);
        }
        if (supplier_id) {
            query += ` AND p.supplier_id = $${paramCount++}`;
            values.push(supplier_id);
        }
        if (brand) {
            query += ` AND p.brand = $${paramCount++}`;
            values.push(brand);
        }
        if (price_min) {
            query += ` AND p.price >= $${paramCount++}`;
            values.push(parseFloat(price_min));
        }
        if (price_max) {
            query += ` AND p.price <= $${paramCount++}`;
            values.push(parseFloat(price_max));
        }
        if (availability === 'in_stock') {
            query += ' AND p.quantity_on_hand > 0';
        }
        else if (availability === 'out_of_stock') {
            query += ' AND p.quantity_on_hand = 0';
        }
        else if (availability === 'low_stock') {
            query += ' AND p.quantity_on_hand > 0 AND p.quantity_on_hand <= p.low_stock_threshold';
        }
        if (supplier_rating_min) {
            query += ` AND s.rating_average >= $${paramCount++}`;
            values.push(parseFloat(supplier_rating_min));
        }
        if (product_rating_min) {
            query += ` AND p.rating_average >= $${paramCount++}`;
            values.push(parseFloat(product_rating_min));
        }
        if (is_eco_friendly === 'true') {
            query += ' AND p.is_eco_friendly = true';
        }
        const sortMap = {
            relevance: 'p.product_name ASC',
            price_asc: 'p.price ASC',
            price_desc: 'p.price DESC',
            rating: 'p.rating_average DESC',
            newest: 'p.created_at DESC',
            created_at: 'p.created_at DESC',
            popularity: 'p.order_count DESC'
        };
        const pageNum = page;
        const limitNum = limit;
        const offset = (pageNum - 1) * limitNum;
        // Get total count (without ORDER BY)
        const countQuery = query.replace('SELECT p.*, s.shop_name, s.rating_average as supplier_rating, s.is_verified as supplier_verified, (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = true LIMIT 1) as primary_image_url', 'SELECT COUNT(*)');
        const countResult = await pool.query(countQuery, values);
        const totalItems = countResult.rows && countResult.rows[0] ? parseInt(countResult.rows[0].count) : 0;
        // Add ORDER BY for the main query
        query += ` ORDER BY ${sortMap[sort_by] || sortMap.created_at}`;
        query += ` LIMIT $${paramCount++} OFFSET $${paramCount}`;
        values.push(limitNum.toString(), offset.toString());
        const result = await pool.query(query, values);
        res.json({
            products: result.rows.map(p => {
                const product = {
                    ...p,
                    price: parseFloat(p.price) || 0,
                    compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price) : null,
                    cost_per_item: p.cost_per_item ? parseFloat(p.cost_per_item) : null,
                    trade_price: p.trade_price ? parseFloat(p.trade_price) : null,
                    weight: p.weight ? parseFloat(p.weight) : null,
                    rating_average: parseFloat(p.rating_average) || 0,
                    supplier_rating: parseFloat(p.supplier_rating) || 0,
                    availability: p.quantity_on_hand === 0 ? 'out_of_stock' :
                        (p.quantity_on_hand <= p.low_stock_threshold ? 'low_stock' : 'in_stock')
                };
                return product;
            }),
            pagination: {
                current_page: pageNum,
                total_pages: Math.ceil(totalItems / limitNum),
                total_items: totalItems,
                items_per_page: limitNum,
                has_next: pageNum * limitNum < totalItems,
                has_previous: pageNum > 1
            }
        });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/products/:product_id', async (req, res) => {
    try {
        const result = await pool.query(`SELECT p.*, s.shop_name, s.shop_slug, s.rating_average as supplier_rating, s.is_verified as supplier_verified
       FROM products p
       JOIN suppliers s ON p.supplier_id = s.supplier_id
       WHERE p.product_id = $1`, [req.params.product_id]);
        if (result.rows.length === 0) {
            return res.status(404).json(createErrorResponse('Product not found', null, 'NOT_FOUND'));
        }
        const product = result.rows[0];
        product.price = parseFloat(product.price) || 0;
        product.compare_at_price = product.compare_at_price ? parseFloat(product.compare_at_price) : null;
        product.cost_per_item = product.cost_per_item ? parseFloat(product.cost_per_item) : null;
        product.trade_price = product.trade_price ? parseFloat(product.trade_price) : null;
        product.weight = product.weight ? parseFloat(product.weight) : null;
        product.rating_average = parseFloat(product.rating_average) || 0;
        product.supplier_rating = parseFloat(product.supplier_rating) || 0;
        product.availability = product.quantity_on_hand === 0 ? 'out_of_stock' :
            (product.quantity_on_hand <= product.low_stock_threshold ? 'low_stock' : 'in_stock');
        res.json(product);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/products/:product_id/variants', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM product_variants WHERE product_id = $1 AND is_active = true ORDER BY display_order ASC', [req.params.product_id]);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/products/:product_id/images', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC, display_order ASC', [req.params.product_id]);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/products/:product_id/reviews', async (req, res) => {
    try {
        const { rating, sort_by = 'most_recent' } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        let query = `SELECT pr.*, u.name as customer_name 
                 FROM product_reviews pr
                 LEFT JOIN users u ON pr.customer_id = u.user_id
                 WHERE pr.product_id = $1 AND pr.status = 'published'`;
        const values = [req.params.product_id];
        let paramCount = 2;
        if (rating) {
            query += ` AND pr.rating = $${paramCount++}`;
            values.push(parseInt(rating));
        }
        const sortMap = {
            most_recent: 'pr.created_at DESC',
            most_helpful: 'pr.helpful_count DESC',
            highest_rating: 'pr.rating DESC',
            lowest_rating: 'pr.rating ASC'
        };
        query += ` ORDER BY ${sortMap[sort_by] || sortMap.most_recent}`;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        const countResult = await pool.query('SELECT COUNT(*) FROM product_reviews WHERE product_id = $1 AND status = \'published\'', [req.params.product_id]);
        const totalItems = parseInt(countResult.rows[0].count);
        query += ` LIMIT $${paramCount++} OFFSET $${paramCount}`;
        values.push(limitNum, offset);
        const result = await pool.query(query, values);
        res.json({
            reviews: result.rows,
            pagination: {
                current_page: pageNum,
                total_pages: Math.ceil(totalItems / limitNum),
                total_items: totalItems,
                items_per_page: limitNum,
                has_next: pageNum * limitNum < totalItems,
                has_previous: pageNum > 1
            }
        });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/products/:product_id/reviews', authenticateToken, async (req, res) => {
    try {
        const validatedData = createProductReviewInputSchema.parse({
            ...req.body,
            product_id: req.params.product_id,
            customer_id: req.user.user_id
        });
        const reviewId = generateId('pr');
        const now = new Date().toISOString();
        const result = await pool.query(`INSERT INTO product_reviews (review_id, product_id, order_id, customer_id, rating, title, 
        review_text, is_recommended, is_anonymous, is_verified_purchase, helpful_count, photo_urls, 
        video_url, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, 0, $10, $11, 'published', $12, $13) RETURNING *`, [reviewId, validatedData.product_id, validatedData.order_id, validatedData.customer_id,
            validatedData.rating, validatedData.title, validatedData.review_text, validatedData.is_recommended,
            validatedData.is_anonymous, JSON.stringify(validatedData.photo_urls || []),
            validatedData.video_url, now, now]);
        await pool.query(`UPDATE products SET 
        rating_average = (SELECT AVG(rating) FROM product_reviews WHERE product_id = $1 AND status = 'published'),
        rating_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = $1 AND status = 'published')
       WHERE product_id = $1`, [validatedData.product_id]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/users/me/carts', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM shopping_carts WHERE user_id = $1 ORDER BY is_active DESC, updated_at DESC', [req.user.user_id]);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/users/me/carts', authenticateToken, async (req, res) => {
    try {
        const validatedData = createShoppingCartInputSchema.parse({ ...req.body, user_id: req.user.user_id });
        const cartId = generateId('cart');
        const now = new Date().toISOString();
        const result = await pool.query(`INSERT INTO shopping_carts (cart_id, user_id, session_id, cart_name, is_active, project_id, 
        promo_code, promo_discount_amount, promo_discount_type, reservation_expiry, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, null, null, null, $8, $9) RETURNING *`, [cartId, validatedData.user_id, validatedData.session_id, validatedData.cart_name,
            validatedData.is_active, validatedData.project_id, validatedData.promo_code, now, now]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/carts/:cart_id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM shopping_carts WHERE cart_id = $1 AND user_id = $2', [req.params.cart_id, req.user.user_id]);
        if (result.rows.length === 0) {
            return res.status(404).json(createErrorResponse('Cart not found', null, 'NOT_FOUND'));
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/carts/:cart_id/items', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`SELECT ci.*, p.product_name, p.quantity_on_hand, p.status as product_status,
        (SELECT image_url FROM product_images WHERE product_id = ci.product_id AND is_primary = true LIMIT 1) as product_image_url
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       JOIN shopping_carts sc ON ci.cart_id = sc.cart_id
       WHERE ci.cart_id = $1 AND sc.user_id = $2`, [req.params.cart_id, req.user.user_id]);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/carts/:cart_id/items', authenticateToken, async (req, res) => {
    try {
        const validatedData = createCartItemInputSchema.parse({ ...req.body, cart_id: req.params.cart_id });
        const cartCheck = await pool.query('SELECT * FROM shopping_carts WHERE cart_id = $1 AND user_id = $2', [req.params.cart_id, req.user.user_id]);
        if (cartCheck.rows.length === 0) {
            return res.status(404).json(createErrorResponse('Cart not found', null, 'NOT_FOUND'));
        }
        const productCheck = await pool.query('SELECT * FROM products WHERE product_id = $1 AND status = \'active\'', [validatedData.product_id]);
        if (productCheck.rows.length === 0) {
            return res.status(404).json(createErrorResponse('Product not found', null, 'NOT_FOUND'));
        }
        const product = productCheck.rows[0];
        if (product.track_inventory && validatedData.quantity > product.quantity_on_hand) {
            return res.status(400).json(createErrorResponse(`Only ${product.quantity_on_hand} items available`, null, 'INSUFFICIENT_STOCK'));
        }
        const cartItemId = generateId('cti');
        const now = new Date().toISOString();
        const reservationExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        const result = await pool.query(`INSERT INTO cart_items (cart_item_id, cart_id, product_id, variant_id, supplier_id, 
        quantity, unit_price, subtotal, reserved_at, added_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`, [cartItemId, validatedData.cart_id, validatedData.product_id, validatedData.variant_id,
            validatedData.supplier_id, validatedData.quantity, validatedData.unit_price,
            validatedData.subtotal, now, now]);
        await pool.query('UPDATE shopping_carts SET reservation_expiry = $1, updated_at = $2 WHERE cart_id = $3', [reservationExpiry, now, req.params.cart_id]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.patch('/api/cart-items/:cart_item_id', authenticateToken, async (req, res) => {
    try {
        const { quantity } = req.body;
        const itemCheck = await pool.query(`SELECT ci.*, sc.user_id FROM cart_items ci
       JOIN shopping_carts sc ON ci.cart_id = sc.cart_id
       WHERE ci.cart_item_id = $1`, [req.params.cart_item_id]);
        if (itemCheck.rows.length === 0 || itemCheck.rows[0].user_id !== req.user.user_id) {
            return res.status(404).json(createErrorResponse('Cart item not found', null, 'NOT_FOUND'));
        }
        const now = new Date().toISOString();
        const newSubtotal = quantity * itemCheck.rows[0].unit_price;
        const result = await pool.query('UPDATE cart_items SET quantity = $1, subtotal = $2 WHERE cart_item_id = $3 RETURNING *', [quantity, newSubtotal, req.params.cart_item_id]);
        res.json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.delete('/api/cart-items/:cart_item_id', authenticateToken, async (req, res) => {
    try {
        await pool.query(`DELETE FROM cart_items WHERE cart_item_id = $1 
       AND cart_id IN (SELECT cart_id FROM shopping_carts WHERE user_id = $2)`, [req.params.cart_item_id, req.user.user_id]);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const { status, date_from, date_to, supplier_id, project_id, sort_by = 'date_desc' } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        let query = 'SELECT o.*, s.shop_name FROM orders o JOIN suppliers s ON o.supplier_id = s.supplier_id WHERE o.customer_id = $1';
        const values = [req.user.user_id];
        let paramCount = 2;
        if (status) {
            query += ` AND o.status = $${paramCount++}`;
            values.push(status);
        }
        if (date_from) {
            query += ` AND o.created_at >= $${paramCount++}`;
            values.push(date_from);
        }
        if (date_to) {
            query += ` AND o.created_at <= $${paramCount++}`;
            values.push(date_to);
        }
        if (supplier_id) {
            query += ` AND o.supplier_id = $${paramCount++}`;
            values.push(supplier_id);
        }
        if (project_id) {
            query += ` AND o.project_id = $${paramCount++}`;
            values.push(project_id);
        }
        const sortMap = {
            date_desc: 'o.created_at DESC',
            date_asc: 'o.created_at ASC',
            amount_desc: 'o.total_amount DESC',
            amount_asc: 'o.total_amount ASC'
        };
        query += ` ORDER BY ${sortMap[sort_by] || sortMap.date_desc}`;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        const countResult = await pool.query(query.replace('SELECT o.*, s.shop_name', 'SELECT COUNT(*)'), values);
        const totalItems = parseInt(countResult.rows[0].count);
        query += ` LIMIT $${paramCount++} OFFSET $${paramCount}`;
        values.push(limitNum, offset);
        const result = await pool.query(query, values);
        res.json({
            orders: result.rows,
            pagination: {
                current_page: pageNum,
                total_pages: Math.ceil(totalItems / limitNum),
                total_items: totalItems,
                items_per_page: limitNum,
                has_next: pageNum * limitNum < totalItems,
                has_previous: pageNum > 1
            }
        });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/orders', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const validatedData = createOrderInputSchema.parse({ ...req.body, customer_id: req.user.user_id, placed_by: req.user.user_id });
        const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
        const orderId = generateId('ord');
        const trackingToken = generateId('tk');
        const now = new Date().toISOString();
        const orderResult = await client.query(`INSERT INTO orders (order_id, order_number, customer_id, supplier_id, project_id, 
        delivery_address_id, billing_address_id, delivery_contact_name, delivery_contact_phone,
        delivery_instructions, delivery_window_start, delivery_window_end, delivery_method, 
        status, payment_status, payment_method, payment_method_id, subtotal, delivery_cost, 
        tax_amount, discount_amount, promo_code, total_amount, currency, payment_transaction_id,
        payment_gateway, platform_fee, supplier_payout_amount, is_guest_order, guest_email, 
        guest_phone, tracking_token, placed_by, approved_by, requires_approval, approval_status,
        notes, supplier_notes, admin_notes, estimated_delivery_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending', 'pending', $14, $15,
        $16, $17, $18, $19, $20, $21, $22, null, null, $23, $24, $25, null, null, $26, $27, null, 
        $28, null, $29, null, null, null, $30, $31) RETURNING *`, [orderId, orderNumber, validatedData.customer_id, validatedData.supplier_id, validatedData.project_id,
            validatedData.delivery_address_id, validatedData.billing_address_id, validatedData.delivery_contact_name,
            validatedData.delivery_contact_phone, validatedData.delivery_instructions, validatedData.delivery_window_start,
            validatedData.delivery_window_end, validatedData.delivery_method, validatedData.payment_method,
            validatedData.payment_method_id, validatedData.subtotal, validatedData.delivery_cost,
            validatedData.tax_amount, validatedData.discount_amount, validatedData.promo_code,
            validatedData.total_amount, validatedData.currency, validatedData.platform_fee,
            validatedData.supplier_payout_amount, validatedData.is_guest_order, trackingToken,
            validatedData.placed_by, validatedData.requires_approval, validatedData.notes, now, now]);
        const order = orderResult.rows[0];
        for (const item of req.body.items || []) {
            const orderItemId = generateId('oi');
            await client.query(`INSERT INTO order_items (order_item_id, order_id, product_id, variant_id, product_name,
          variant_name, sku, quantity, unit_price, subtotal, product_image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [orderItemId, orderId, item.product_id, item.variant_id || null, item.product_name || 'Product',
                item.variant_name || null, item.sku || 'SKU', item.quantity, item.unit_price,
                item.quantity * item.unit_price, item.product_image_url || null]);
            await client.query('UPDATE products SET quantity_on_hand = quantity_on_hand - $1, order_count = order_count + 1 WHERE product_id = $2', [item.quantity, item.product_id]);
        }
        if (validatedData.delivery_method !== 'pickup') {
            const deliveryId = generateId('del');
            await client.query(`INSERT INTO deliveries (delivery_id, order_id, delivery_method, scheduled_date, 
          scheduled_window_start, scheduled_window_end, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7, $8)`, [deliveryId, orderId, validatedData.delivery_method, validatedData.delivery_window_start?.split('T')[0],
                validatedData.delivery_window_start, validatedData.delivery_window_end, now, now]);
        }
        await client.query(`INSERT INTO order_status_history (history_id, order_id, status, notes, updated_by, created_at)
       VALUES ($1, $2, 'pending', 'Order placed', $3, $4)`, [generateId('osh'), orderId, req.user.user_id, now]);
        await client.query('COMMIT');
        io.to(`user:${validatedData.supplier_id}`).emit('order:new', {
            order_id: orderId,
            order_number: orderNumber,
            customer_id: validatedData.customer_id,
            total_amount: validatedData.total_amount,
            created_at: now
        });
        res.status(201).json(order);
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Order creation error:', error);
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
    finally {
        client.release();
    }
});
app.get('/api/orders/:order_id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`SELECT o.*, s.shop_name, s.contact_email as supplier_email, s.contact_phone as supplier_phone
       FROM orders o
       JOIN suppliers s ON o.supplier_id = s.supplier_id
       WHERE o.order_id = $1 AND (o.customer_id = $2 OR o.supplier_id IN 
        (SELECT supplier_id FROM suppliers WHERE user_id = $2))`, [req.params.order_id, req.user.user_id]);
        if (result.rows.length === 0) {
            return res.status(404).json(createErrorResponse('Order not found', null, 'NOT_FOUND'));
        }
        const order = result.rows[0];
        const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.order_id]);
        order.items = itemsResult.rows;
        const deliveryResult = await pool.query('SELECT * FROM deliveries WHERE order_id = $1', [req.params.order_id]);
        order.delivery = deliveryResult.rows[0] || null;
        res.json(order);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.patch('/api/orders/:order_id', authenticateToken, async (req, res) => {
    try {
        const updates = [];
        const values = [];
        let paramCount = 1;
        const allowedFields = ['status', 'delivery_contact_name', 'delivery_contact_phone', 'delivery_instructions', 'supplier_notes'];
        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key) && req.body[key] !== undefined) {
                updates.push(`${key} = $${paramCount++}`);
                values.push(req.body[key]);
            }
        });
        const now = new Date().toISOString();
        updates.push(`updated_at = $${paramCount++}`);
        values.push(now);
        values.push(req.params.order_id);
        const result = await pool.query(`UPDATE orders SET ${updates.join(', ')} WHERE order_id = $${paramCount} RETURNING *`, values);
        if (result.rows.length === 0) {
            return res.status(404).json(createErrorResponse('Order not found', null, 'NOT_FOUND'));
        }
        const order = result.rows[0];
        if (req.body.status) {
            await pool.query(`INSERT INTO order_status_history (history_id, order_id, status, notes, updated_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`, [generateId('osh'), req.params.order_id, req.body.status, req.body.status_notes || 'Status updated', req.user.user_id, now]);
            io.to(`user:${order.customer_id}`).emit('order:status_changed', {
                order_id: order.order_id,
                order_number: order.order_number,
                new_status: req.body.status,
                timestamp: now
            });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/orders/:order_id/cancel', authenticateToken, async (req, res) => {
    try {
        const orderCheck = await pool.query('SELECT * FROM orders WHERE order_id = $1 AND customer_id = $2', [req.params.order_id, req.user.user_id]);
        if (orderCheck.rows.length === 0) {
            return res.status(404).json(createErrorResponse('Order not found', null, 'NOT_FOUND'));
        }
        const order = orderCheck.rows[0];
        if (!['pending', 'accepted'].includes(order.status)) {
            return res.status(400).json(createErrorResponse('Order cannot be canceled', null, 'CANNOT_CANCEL'));
        }
        const now = new Date().toISOString();
        const result = await pool.query(`UPDATE orders SET status = 'canceled', canceled_at = $1, cancellation_reason = $2, updated_at = $3 
       WHERE order_id = $4 RETURNING *`, [now, req.body.cancellation_reason || 'Customer request', now, req.params.order_id]);
        io.to(`user:${order.customer_id}`).emit('order:canceled', {
            order_id: order.order_id,
            order_number: order.order_number,
            canceled_at: now
        });
        res.json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/orders/:order_id/tracking', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`SELECT d.* FROM deliveries d
       JOIN orders o ON d.order_id = o.order_id
       WHERE d.order_id = $1 AND (o.customer_id = $2 OR o.supplier_id IN 
        (SELECT supplier_id FROM suppliers WHERE user_id = $2))`, [req.params.order_id, req.user.user_id]);
        if (result.rows.length === 0) {
            return res.status(404).json(createErrorResponse('Delivery not found', null, 'NOT_FOUND'));
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/suppliers', async (req, res) => {
    try {
        const { is_verified, status, sort_by = 'rating_average', limit = 50, page = 1 } = req.query;
        let query = 'SELECT * FROM suppliers WHERE 1=1';
        const values = [];
        let paramCount = 1;
        if (status) {
            query += ` AND status = $${paramCount++}`;
            values.push(status);
        }
        if (is_verified !== undefined) {
            query += ` AND is_verified = $${paramCount++}`;
            values.push(is_verified === 'true' || is_verified === true);
        }
        const sortMap = {
            rating_average: 'rating_average DESC NULLS LAST',
            rating_count: 'rating_count DESC',
            created_at: 'created_at DESC',
            shop_name: 'shop_name ASC'
        };
        query += ` ORDER BY ${sortMap[sort_by] || sortMap.rating_average}`;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        query += ` LIMIT $${paramCount++} OFFSET $${paramCount}`;
        values.push(limitNum, offset);
        const result = await pool.query(query, values);
        // Ensure rating_average is never null for the response
        const suppliers = result.rows.map(supplier => ({
            ...supplier,
            rating_average: supplier.rating_average || 0,
            rating_count: supplier.rating_count || 0
        }));
        res.json({ suppliers });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/suppliers/:supplier_id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM suppliers WHERE supplier_id = $1 AND status = \'active\'', [req.params.supplier_id]);
        if (result.rows.length === 0) {
            return res.status(404).json(createErrorResponse('Supplier not found', null, 'NOT_FOUND'));
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/suppliers/:supplier_id/products', async (req, res) => {
    try {
        const { category, status, search_query, sort_by = 'created_at' } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 24;
        let query = 'SELECT * FROM products WHERE supplier_id = $1';
        const values = [req.params.supplier_id];
        let paramCount = 2;
        if (category) {
            query += ` AND category_id = $${paramCount++}`;
            values.push(category);
        }
        if (status) {
            query += ` AND status = $${paramCount++}`;
            values.push(status);
        }
        else {
            query += ' AND status = \'active\'';
        }
        if (search_query) {
            query += ` AND (product_name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
            values.push(`%${search_query}%`);
            paramCount++;
        }
        const sortMap = {
            created_at: 'created_at DESC',
            price_asc: 'price ASC',
            price_desc: 'price DESC',
            name: 'product_name ASC'
        };
        query += ` ORDER BY ${sortMap[sort_by] || sortMap.created_at}`;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        const countResult = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*)'), values);
        const totalItems = parseInt(countResult.rows[0].count);
        query += ` LIMIT $${paramCount++} OFFSET $${paramCount}`;
        values.push(limitNum, offset);
        const result = await pool.query(query, values);
        res.json({
            products: result.rows,
            pagination: {
                current_page: pageNum,
                total_pages: Math.ceil(totalItems / limitNum),
                total_items: totalItems,
                items_per_page: limitNum,
                has_next: pageNum * limitNum < totalItems,
                has_previous: pageNum > 1
            }
        });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/suppliers/:supplier_id/products', authenticateToken, async (req, res) => {
    try {
        const supplierCheck = await pool.query('SELECT * FROM suppliers WHERE supplier_id = $1 AND user_id = $2', [req.params.supplier_id, req.user.user_id]);
        if (supplierCheck.rows.length === 0) {
            return res.status(403).json(createErrorResponse('Forbidden', null, 'FORBIDDEN'));
        }
        const validatedData = createProductInputSchema.parse({ ...req.body, supplier_id: req.params.supplier_id });
        const productId = generateId('prd');
        const now = new Date().toISOString();
        const result = await pool.query(`INSERT INTO products (product_id, supplier_id, product_name, product_slug, category_id, 
        subcategory_id, brand, sku, manufacturer, model_number, description, specifications, 
        dimensions, weight, unit_of_measure, price, compare_at_price, cost_per_item, has_variants,
        bulk_pricing, trade_price, track_inventory, quantity_on_hand, low_stock_threshold, 
        continue_selling_when_out_of_stock, barcode, requires_special_handling, tags, is_eco_friendly,
        sustainability_info, safety_information, certifications, technical_datasheet_url, 
        installation_guide_url, warranty_info_url, meta_title, meta_description, rating_average,
        rating_count, view_count, order_count, status, is_featured, last_inventory_update, 
        created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, 0,
        0, 0, 0, $38, $39, $40, $41, $42) RETURNING *`, [productId, validatedData.supplier_id, validatedData.product_name, validatedData.product_slug,
            validatedData.category_id, validatedData.subcategory_id, validatedData.brand, validatedData.sku,
            validatedData.manufacturer, validatedData.model_number, validatedData.description,
            JSON.stringify(validatedData.specifications), JSON.stringify(validatedData.dimensions),
            validatedData.weight, validatedData.unit_of_measure, validatedData.price,
            validatedData.compare_at_price, validatedData.cost_per_item, validatedData.has_variants,
            JSON.stringify(validatedData.bulk_pricing), validatedData.trade_price, validatedData.track_inventory,
            validatedData.quantity_on_hand, validatedData.low_stock_threshold,
            validatedData.continue_selling_when_out_of_stock, validatedData.barcode,
            validatedData.requires_special_handling, JSON.stringify(validatedData.tags),
            validatedData.is_eco_friendly, JSON.stringify(validatedData.sustainability_info),
            validatedData.safety_information, JSON.stringify(validatedData.certifications),
            validatedData.technical_datasheet_url, validatedData.installation_guide_url,
            validatedData.warranty_info_url, validatedData.meta_title, validatedData.meta_description,
            validatedData.status, validatedData.is_featured, now, now, now]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/suppliers/:supplier_id/reviews', async (req, res) => {
    try {
        const { rating, sort_by = 'most_recent', page = 1 } = req.query;
        let query = `SELECT sr.*, u.name as customer_name 
                 FROM supplier_reviews sr
                 LEFT JOIN users u ON sr.customer_id = u.user_id
                 WHERE sr.supplier_id = $1 AND sr.status = 'published'`;
        const values = [req.params.supplier_id];
        let paramCount = 2;
        if (rating) {
            query += ` AND sr.overall_rating = $${paramCount++}`;
            values.push(parseInt(rating));
        }
        query += ' ORDER BY sr.created_at DESC';
        const result = await pool.query(query, values);
        res.json({ reviews: result.rows });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/suppliers/:supplier_id/reviews', authenticateToken, async (req, res) => {
    try {
        const validatedData = createSupplierReviewInputSchema.parse({
            ...req.body,
            supplier_id: req.params.supplier_id,
            customer_id: req.user.user_id
        });
        const reviewId = generateId('sr');
        const now = new Date().toISOString();
        const result = await pool.query(`INSERT INTO supplier_reviews (review_id, supplier_id, order_id, customer_id, overall_rating,
        product_quality_rating, delivery_rating, customer_service_rating, review_text, is_anonymous,
        photo_urls, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'published', $12, $13) RETURNING *`, [reviewId, validatedData.supplier_id, validatedData.order_id, validatedData.customer_id,
            validatedData.overall_rating, validatedData.product_quality_rating, validatedData.delivery_rating,
            validatedData.customer_service_rating, validatedData.review_text, validatedData.is_anonymous,
            JSON.stringify(validatedData.photo_urls || []), now, now]);
        await pool.query(`UPDATE suppliers SET 
        rating_average = (SELECT AVG(overall_rating) FROM supplier_reviews WHERE supplier_id = $1 AND status = 'published'),
        rating_count = (SELECT COUNT(*) FROM supplier_reviews WHERE supplier_id = $1 AND status = 'published')
       WHERE supplier_id = $1`, [validatedData.supplier_id]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/conversations', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`SELECT c.*, 
        u1.name as participant_1_name, u1.profile_photo_url as participant_1_photo,
        u2.name as participant_2_name, u2.profile_photo_url as participant_2_photo
       FROM conversations c
       JOIN users u1 ON c.participant_1_id = u1.user_id
       JOIN users u2 ON c.participant_2_id = u2.user_id
       WHERE c.participant_1_id = $1 OR c.participant_2_id = $1
       ORDER BY c.last_message_at DESC NULLS LAST`, [req.user.user_id]);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/conversations', authenticateToken, async (req, res) => {
    try {
        const { participant_id, related_order_id, related_product_id, initial_message } = req.body;
        if (!participant_id) {
            return res.status(400).json(createErrorResponse('Participant ID required', null, 'MISSING_PARTICIPANT'));
        }
        const conversationId = generateId('conv');
        const now = new Date().toISOString();
        const result = await pool.query(`INSERT INTO conversations (conversation_id, participant_1_id, participant_2_id, 
        related_order_id, related_product_id, status, last_message_at, created_at)
       VALUES ($1, $2, $3, $4, $5, 'open', $6, $7) RETURNING *`, [conversationId, req.user.user_id, participant_id, related_order_id, related_product_id, now, now]);
        if (initial_message) {
            const messageId = generateId('msg');
            await pool.query(`INSERT INTO messages (message_id, conversation_id, sender_id, message_text, 
          attachment_urls, is_read, sent_at)
         VALUES ($1, $2, $3, $4, '[]', false, $5)`, [messageId, conversationId, req.user.user_id, initial_message, now]);
            io.to(`user:${participant_id}`).emit('conversation:new', {
                conversation_id: conversationId,
                participant_id: req.user.user_id,
                participant_name: req.user.name,
                initial_message: initial_message,
                created_at: now
            });
        }
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/conversations/:conversation_id/messages', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        const result = await pool.query(`SELECT m.*, u.name as sender_name, u.profile_photo_url as sender_photo
       FROM messages m
       JOIN users u ON m.sender_id = u.user_id
       JOIN conversations c ON m.conversation_id = c.conversation_id
       WHERE m.conversation_id = $1 AND (c.participant_1_id = $2 OR c.participant_2_id = $2)
       ORDER BY m.sent_at DESC LIMIT $3 OFFSET $4`, [req.params.conversation_id, req.user.user_id, limitNum, offset]);
        res.json({ messages: result.rows.reverse() });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/conversations/:conversation_id/messages', authenticateToken, async (req, res) => {
    try {
        const { message_text, attachment_urls } = req.body;
        const convCheck = await pool.query('SELECT * FROM conversations WHERE conversation_id = $1 AND (participant_1_id = $2 OR participant_2_id = $2)', [req.params.conversation_id, req.user.user_id]);
        if (convCheck.rows.length === 0) {
            return res.status(404).json(createErrorResponse('Conversation not found', null, 'NOT_FOUND'));
        }
        const conversation = convCheck.rows[0];
        const messageId = generateId('msg');
        const now = new Date().toISOString();
        const result = await pool.query(`INSERT INTO messages (message_id, conversation_id, sender_id, message_text, attachment_urls, 
        is_read, sent_at)
       VALUES ($1, $2, $3, $4, $5, false, $6) RETURNING *`, [messageId, req.params.conversation_id, req.user.user_id, message_text,
            JSON.stringify(attachment_urls || []), now]);
        await pool.query('UPDATE conversations SET last_message_at = $1 WHERE conversation_id = $2', [now, req.params.conversation_id]);
        const recipientId = conversation.participant_1_id === req.user.user_id
            ? conversation.participant_2_id : conversation.participant_1_id;
        io.to(`user:${recipientId}`).emit('message:new', {
            message_id: messageId,
            conversation_id: req.params.conversation_id,
            sender_id: req.user.user_id,
            sender_name: req.user.name,
            message_text: message_text,
            sent_at: now
        });
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const { notification_type } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const is_read = req.query.is_read;
        let query = 'SELECT * FROM notifications WHERE user_id = $1';
        const values = [req.user.user_id];
        let paramCount = 2;
        if (notification_type) {
            query += ` AND notification_type = $${paramCount++}`;
            values.push(notification_type);
        }
        if (is_read !== undefined) {
            query += ` AND is_read = $${paramCount++}`;
            values.push(is_read === 'true');
        }
        query += ' ORDER BY created_at DESC';
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        const unreadResult = await pool.query('SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false', [req.user.user_id]);
        query += ` LIMIT $${paramCount++} OFFSET $${paramCount}`;
        values.push(limitNum, offset);
        const result = await pool.query(query, values);
        res.json({
            notifications: result.rows,
            unread_count: parseInt(unreadResult.rows[0].count)
        });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.patch('/api/notifications/:notification_id', authenticateToken, async (req, res) => {
    try {
        const now = new Date().toISOString();
        await pool.query('UPDATE notifications SET is_read = true, read_at = $1 WHERE notification_id = $2 AND user_id = $3', [now, req.params.notification_id, req.user.user_id]);
        res.json({ message: 'Notification marked as read' });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/notifications/mark-all-read', authenticateToken, async (req, res) => {
    try {
        const now = new Date().toISOString();
        await pool.query('UPDATE notifications SET is_read = true, read_at = $1 WHERE user_id = $2 AND is_read = false', [now, req.user.user_id]);
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/users/me/wishlists', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM wishlists WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [req.user.user_id]);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/users/me/wishlists', authenticateToken, async (req, res) => {
    try {
        const validatedData = createWishlistInputSchema.parse({ ...req.body, user_id: req.user.user_id });
        const wishlistId = generateId('wish');
        const now = new Date().toISOString();
        const result = await pool.query('INSERT INTO wishlists (wishlist_id, user_id, wishlist_name, is_default, is_public, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [wishlistId, validatedData.user_id, validatedData.wishlist_name, validatedData.is_default, validatedData.is_public, now]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`SELECT p.* FROM projects p
       JOIN business_accounts ba ON p.business_account_id = ba.business_account_id
       WHERE ba.user_id = $1 ORDER BY p.created_at DESC`, [req.user.user_id]);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/projects', authenticateToken, async (req, res) => {
    try {
        const businessAccountResult = await pool.query('SELECT business_account_id FROM business_accounts WHERE user_id = $1', [req.user.user_id]);
        if (businessAccountResult.rows.length === 0) {
            return res.status(400).json(createErrorResponse('Business account required', null, 'NO_BUSINESS_ACCOUNT'));
        }
        const validatedData = createProjectInputSchema.parse({
            ...req.body,
            business_account_id: businessAccountResult.rows[0].business_account_id,
            created_by: req.user.user_id
        });
        const projectId = generateId('proj');
        const now = new Date().toISOString();
        const result = await pool.query(`INSERT INTO projects (project_id, business_account_id, project_name, project_type, budget, 
        start_date, end_date, status, notes, total_spent, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10, $11, $12) RETURNING *`, [projectId, validatedData.business_account_id, validatedData.project_name, validatedData.project_type,
            validatedData.budget, validatedData.start_date, validatedData.end_date, validatedData.status,
            validatedData.notes, validatedData.created_by, now, now]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/suppliers/me/orders', authenticateToken, requireRole(['supplier']), async (req, res) => {
    try {
        const supplierResult = await pool.query('SELECT supplier_id FROM suppliers WHERE user_id = $1', [req.user.user_id]);
        if (supplierResult.rows.length === 0) {
            return res.status(403).json(createErrorResponse('Supplier account required', null, 'NO_SUPPLIER'));
        }
        const supplierId = supplierResult.rows[0].supplier_id;
        const { status, date_from, date_to } = req.query;
        const page = parseInt(req.query.page) || 1;
        let query = 'SELECT o.*, u.name as customer_name FROM orders o JOIN users u ON o.customer_id = u.user_id WHERE o.supplier_id = $1';
        const values = [supplierId];
        let paramCount = 2;
        if (status) {
            query += ` AND o.status = $${paramCount++}`;
            values.push(status);
        }
        if (date_from) {
            query += ` AND o.created_at >= $${paramCount++}`;
            values.push(date_from);
        }
        if (date_to) {
            query += ` AND o.created_at <= $${paramCount++}`;
            values.push(date_to);
        }
        query += ' ORDER BY o.created_at DESC';
        const result = await pool.query(query, values);
        res.json({ orders: result.rows });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/suppliers/me/analytics', authenticateToken, requireRole(['supplier']), async (req, res) => {
    try {
        const supplierResult = await pool.query('SELECT supplier_id FROM suppliers WHERE user_id = $1', [req.user.user_id]);
        if (supplierResult.rows.length === 0) {
            return res.status(403).json(createErrorResponse('Supplier account required', null, 'NO_SUPPLIER'));
        }
        const supplierId = supplierResult.rows[0].supplier_id;
        const revenueResult = await pool.query(`SELECT COUNT(*) as orders, SUM(total_amount) as revenue, AVG(total_amount) as avg_order_value
       FROM orders WHERE supplier_id = $1 AND status NOT IN ('canceled', 'refunded')`, [supplierId]);
        const topProductsResult = await pool.query(`SELECT p.product_id, p.product_name, COUNT(oi.order_item_id) as units_sold, SUM(oi.subtotal) as revenue
       FROM products p
       JOIN order_items oi ON p.product_id = oi.product_id
       JOIN orders o ON oi.order_id = o.order_id
       WHERE p.supplier_id = $1 AND o.status NOT IN ('canceled', 'refunded')
       GROUP BY p.product_id, p.product_name
       ORDER BY revenue DESC LIMIT 10`, [supplierId]);
        res.json({
            revenue: parseFloat(revenueResult.rows[0].revenue || 0),
            orders: parseInt(revenueResult.rows[0].orders || 0),
            average_order_value: parseFloat(revenueResult.rows[0].avg_order_value || 0),
            top_products: topProductsResult.rows
        });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.post('/api/supplier-applications', authenticateToken, async (req, res) => {
    try {
        const applicationId = generateId('app');
        const referenceNumber = `APP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
        const now = new Date().toISOString();
        const result = await pool.query(`INSERT INTO supplier_applications (application_id, user_id, business_name, 
        business_registration_number, tax_id, business_address, years_in_business, business_type,
        website_url, contact_name, contact_email, contact_phone, product_categories, 
        estimated_product_count, average_order_value, delivery_area, delivery_options, 
        pickup_available, documents, status, submitted_at, reference_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
        'pending', $20, $21) RETURNING *`, [applicationId, req.user.user_id, req.body.business_name, req.body.business_registration_number,
            req.body.tax_id, req.body.business_address, req.body.years_in_business, req.body.business_type,
            req.body.website_url, req.body.contact_name, req.body.contact_email, req.body.contact_phone,
            JSON.stringify(req.body.product_categories), req.body.estimated_product_count,
            req.body.average_order_value, JSON.stringify(req.body.delivery_area),
            JSON.stringify(req.body.delivery_options), req.body.pickup_available,
            JSON.stringify(req.body.documents), now, referenceNumber]);
        res.status(201).json({
            application_id: applicationId,
            reference_number: referenceNumber,
            status: 'pending'
        });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/admin/dashboard', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const gmvResult = await pool.query('SELECT SUM(total_amount) as gmv FROM orders WHERE status NOT IN (\'canceled\', \'refunded\')');
        const ordersResult = await pool.query('SELECT COUNT(*) as total_orders FROM orders');
        const usersResult = await pool.query('SELECT COUNT(*) as total_users FROM users WHERE role = \'customer\'');
        const suppliersResult = await pool.query('SELECT COUNT(*) as total_suppliers FROM suppliers WHERE status = \'active\'');
        const pendingAppsResult = await pool.query('SELECT COUNT(*) as pending FROM supplier_applications WHERE status = \'pending\'');
        res.json({
            gmv: parseFloat(gmvResult.rows[0].gmv || 0),
            total_orders: parseInt(ordersResult.rows[0].total_orders),
            active_users: parseInt(usersResult.rows[0].total_users),
            total_suppliers: parseInt(suppliersResult.rows[0].total_suppliers),
            pending_supplier_applications: parseInt(pendingAppsResult.rows[0].pending)
        });
    }
    catch (error) {
        res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_ERROR'));
    }
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
export { app, pool };
httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port} and listening on 0.0.0.0`);
    console.log(`WebSocket server ready`);
});
//# sourceMappingURL=server.js.map