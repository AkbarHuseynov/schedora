const db     = require('../config/db');
const upload = require('../middleware/upload');
const path   = require('path');
const fs     = require('fs');

// GET /owner/dashboard
exports.getDashboard = async (req, res) => {
    const ownerId = req.session.user.id;
    try {
        const [[shop]] = await db.query('SELECT * FROM shops WHERE owner_id = ?', [ownerId]);

        let stats = { total: 0, pending: 0, confirmed: 0, completed: 0 };
        let recentBookings = [];

        if (shop) {
            const [[s]] = await db.query(`
                SELECT
                    COUNT(*) AS total,
                    SUM(status='pending')   AS pending,
                    SUM(status='confirmed') AS confirmed,
                    SUM(status='completed') AS completed
                FROM bookings WHERE shop_id = ?
            `, [shop.id]);
            stats = s;

            const [rb] = await db.query(`
                SELECT b.*, s.name AS service_name, u.name AS client_name
                FROM bookings b
                JOIN services s ON b.service_id = s.id
                JOIN users    u ON b.client_id  = u.id
                WHERE b.shop_id = ?
                ORDER BY b.created_at DESC LIMIT 8
            `, [shop.id]);
            recentBookings = rb;
        }

        res.render('owner/dashboard', {
            title: 'Owner Dashboard – Schedora',
            user: req.session.user,
            shop,
            stats,
            recentBookings
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error', message: 'Could not load dashboard.', user: req.session.user });
    }
};

// ── SHOP SETUP ─────────────────────────────────────────────────────────────

// GET /owner/shop/setup
exports.getShopSetup = async (req, res) => {
    const ownerId = req.session.user.id;
    const [[shop]] = await db.query('SELECT * FROM shops WHERE owner_id = ?', [ownerId]);
    res.render('owner/shop-setup', {
        title: 'Shop Setup – Schedora',
        user: req.session.user,
        shop
    });
};

// POST /owner/shop/setup
exports.postShopSetup = async (req, res) => {
    const ownerId = req.session.user.id;
    const { name, description, category, address, phone } = req.body;
    const coverFile = req.file ? req.file.filename : null;

    try {
        const [[existing]] = await db.query('SELECT id FROM shops WHERE owner_id = ?', [ownerId]);
        if (existing) {
            const updateFields = [name, description, category, address, phone];
            let sql = 'UPDATE shops SET name=?, description=?, category=?, address=?, phone=?';
            if (coverFile) { sql += ', cover_image=?'; updateFields.push(coverFile); }
            sql += ' WHERE owner_id=?';
            updateFields.push(ownerId);
            await db.query(sql, updateFields);
        } else {
            await db.query(
                'INSERT INTO shops (owner_id, name, description, category, address, phone, cover_image) VALUES (?,?,?,?,?,?,?)',
                [ownerId, name, description, category, address, phone, coverFile]
            );
        }
        req.flash('success', 'Shop profile saved.');
        res.redirect('/owner/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not save shop.');
        res.redirect('/owner/shop/setup');
    }
};

// ── SERVICES ───────────────────────────────────────────────────────────────

// GET /owner/services
exports.getServices = async (req, res) => {
    const ownerId = req.session.user.id;
    try {
        const [[shop]] = await db.query('SELECT * FROM shops WHERE owner_id = ?', [ownerId]);
        if (!shop) {
            req.flash('error', 'Please set up your shop first.');
            return res.redirect('/owner/shop/setup');
        }

        const [services] = await db.query(
            'SELECT * FROM services WHERE shop_id = ? ORDER BY created_at DESC', [shop.id]
        );
        for (const svc of services) {
            const [photos] = await db.query(
                'SELECT * FROM service_photos WHERE service_id = ? ORDER BY sort_order ASC', [svc.id]
            );
            svc.photos = photos;
        }

        res.render('owner/services', {
            title: 'My Services – Schedora',
            user: req.session.user,
            shop,
            services
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error', message: 'Could not load services.', user: req.session.user });
    }
};

// GET /owner/services/new
exports.getNewService = async (req, res) => {
    const ownerId = req.session.user.id;
    const [[shop]] = await db.query('SELECT * FROM shops WHERE owner_id = ?', [ownerId]);
    if (!shop) { req.flash('error', 'Set up your shop first.'); return res.redirect('/owner/shop/setup'); }
    res.render('owner/service-form', {
        title: 'Add Service – Schedora',
        user: req.session.user,
        shop,
        service: null
    });
};

// POST /owner/services/new
exports.postNewService = async (req, res) => {
    const ownerId = req.session.user.id;
    const { name, description, price, duration_min } = req.body;
    const files = req.files || [];

    try {
        const [[shop]] = await db.query('SELECT * FROM shops WHERE owner_id = ?', [ownerId]);
        if (!shop) { req.flash('error', 'Shop not found.'); return res.redirect('/owner/shop/setup'); }

        const [result] = await db.query(
            'INSERT INTO services (shop_id, name, description, price, duration_min) VALUES (?,?,?,?,?)',
            [shop.id, name, description, price, duration_min]
        );
        const serviceId = result.insertId;

        for (let i = 0; i < files.length; i++) {
            await db.query(
                'INSERT INTO service_photos (service_id, filename, sort_order) VALUES (?,?,?)',
                [serviceId, files[i].filename, i]
            );
        }

        req.flash('success', 'Service created!');
        res.redirect('/owner/services');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not create service.');
        res.redirect('/owner/services/new');
    }
};

// GET /owner/services/:id/edit
exports.getEditService = async (req, res) => {
    const ownerId = req.session.user.id;
    const { id }  = req.params;
    try {
        const [[shop]]    = await db.query('SELECT * FROM shops WHERE owner_id = ?', [ownerId]);
        const [[service]] = await db.query('SELECT * FROM services WHERE id = ? AND shop_id = ?', [id, shop.id]);
        if (!service) return res.render('error', { title: 'Not Found', message: 'Service not found.', user: req.session.user });

        const [photos] = await db.query('SELECT * FROM service_photos WHERE service_id = ? ORDER BY sort_order', [id]);
        service.photos = photos;

        res.render('owner/service-form', {
            title: 'Edit Service – Schedora',
            user: req.session.user,
            shop,
            service
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error', message: 'Could not load service.', user: req.session.user });
    }
};

// POST /owner/services/:id/edit
exports.postEditService = async (req, res) => {
    const ownerId = req.session.user.id;
    const { id }  = req.params;
    const { name, description, price, duration_min } = req.body;
    const files = req.files || [];

    try {
        const [[shop]]    = await db.query('SELECT * FROM shops WHERE owner_id = ?', [ownerId]);
        const [[service]] = await db.query('SELECT * FROM services WHERE id = ? AND shop_id = ?', [id, shop.id]);
        if (!service) { req.flash('error', 'Service not found.'); return res.redirect('/owner/services'); }

        await db.query(
            'UPDATE services SET name=?, description=?, price=?, duration_min=? WHERE id=?',
            [name, description, price, duration_min, id]
        );

        // Append new photos
        const [existingPhotos] = await db.query('SELECT COUNT(*) AS cnt FROM service_photos WHERE service_id = ?', [id]);
        let offset = existingPhotos[0].cnt;
        for (let i = 0; i < files.length; i++) {
            await db.query(
                'INSERT INTO service_photos (service_id, filename, sort_order) VALUES (?,?,?)',
                [id, files[i].filename, offset + i]
            );
        }

        req.flash('success', 'Service updated!');
        res.redirect('/owner/services');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not update service.');
        res.redirect(`/owner/services/${id}/edit`);
    }
};

// POST /owner/services/:id/delete
exports.deleteService = async (req, res) => {
    const ownerId = req.session.user.id;
    const { id }  = req.params;
    try {
        const [[shop]] = await db.query('SELECT * FROM shops WHERE owner_id = ?', [ownerId]);
        const [[svc]]  = await db.query('SELECT * FROM services WHERE id = ? AND shop_id = ?', [id, shop.id]);
        if (!svc) { req.flash('error', 'Service not found.'); return res.redirect('/owner/services'); }

        // Delete associated photos from disk
        const [photos] = await db.query('SELECT filename FROM service_photos WHERE service_id = ?', [id]);
        for (const p of photos) {
            const filePath = path.join(__dirname, '..', 'public', 'uploads', p.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM services WHERE id = ?', [id]);
        req.flash('success', 'Service deleted.');
        res.redirect('/owner/services');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not delete service.');
        res.redirect('/owner/services');
    }
};

// POST /owner/services/photos/:photoId/delete
exports.deletePhoto = async (req, res) => {
    const { photoId } = req.params;
    try {
        const [[photo]] = await db.query('SELECT * FROM service_photos WHERE id = ?', [photoId]);
        if (photo) {
            const filePath = path.join(__dirname, '..', 'public', 'uploads', photo.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            await db.query('DELETE FROM service_photos WHERE id = ?', [photoId]);
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false });
    }
};

// ── BOOKINGS ───────────────────────────────────────────────────────────────

// GET /owner/bookings
exports.getBookings = async (req, res) => {
    const ownerId = req.session.user.id;
    const { status } = req.query;
    try {
        const [[shop]] = await db.query('SELECT * FROM shops WHERE owner_id = ?', [ownerId]);
        if (!shop) { req.flash('error', 'Set up your shop first.'); return res.redirect('/owner/shop/setup'); }

        let query = `
            SELECT b.*, s.name AS service_name, u.name AS client_name, u.phone AS client_phone
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN users    u ON b.client_id  = u.id
            WHERE b.shop_id = ?
        `;
        const params = [shop.id];
        if (status && status !== 'all') { query += ' AND b.status = ?'; params.push(status); }
        query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';

        const [bookings] = await db.query(query, params);
        res.render('owner/bookings', {
            title: 'Manage Bookings – Schedora',
            user: req.session.user,
            shop,
            bookings,
            statusFilter: status || 'all'
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error', message: 'Could not load bookings.', user: req.session.user });
    }
};

// POST /owner/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
    const ownerId  = req.session.user.id;
    const { id }   = req.params;
    const { status } = req.body;
    const allowed  = ['confirmed', 'completed', 'cancelled'];

    try {
        if (!allowed.includes(status)) { req.flash('error', 'Invalid status.'); return res.redirect('/owner/bookings'); }

        const [[shop]]    = await db.query('SELECT * FROM shops WHERE owner_id = ?', [ownerId]);
        const [[booking]] = await db.query('SELECT * FROM bookings WHERE id = ? AND shop_id = ?', [id, shop.id]);
        if (!booking) { req.flash('error', 'Booking not found.'); return res.redirect('/owner/bookings'); }

        await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

        // Credit wallet when booking completed
        if (status === 'completed') {
            await db.query(
                'UPDATE shops SET wallet_balance = wallet_balance + ? WHERE id = ?',
                [booking.total_price, shop.id]
            );
            await db.query(
                'INSERT INTO wallet_transactions (shop_id, booking_id, type, amount, note) VALUES (?,?,?,?,?)',
                [shop.id, id, 'credit', booking.total_price, `Booking #${id} completed`]
            );
        }

        req.flash('success', `Booking marked as ${status}.`);
        res.redirect('/owner/bookings');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not update booking status.');
        res.redirect('/owner/bookings');
    }
};

// GET /owner/wallet
exports.getWallet = async (req, res) => {
    const ownerId = req.session.user.id;
    try {
        const [[shop]] = await db.query('SELECT * FROM shops WHERE owner_id = ?', [ownerId]);
        if (!shop) { req.flash('error', 'Set up your shop first.'); return res.redirect('/owner/shop/setup'); }

        const [transactions] = await db.query(
            'SELECT * FROM wallet_transactions WHERE shop_id = ? ORDER BY created_at DESC LIMIT 50',
            [shop.id]
        );

        res.render('owner/wallet', {
            title: 'Wallet – Schedora',
            user: req.session.user,
            shop,
            transactions
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error', message: 'Could not load wallet.', user: req.session.user });
    }
};
