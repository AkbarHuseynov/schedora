const db = require('../config/db');

// GET /client/dashboard
exports.getDashboard = async (req, res) => {
    const userId = req.session.user.id;
    try {
        const [upcoming] = await db.query(`
            SELECT b.*, s.name AS service_name, sh.name AS shop_name, s.price
            FROM bookings b
            JOIN services s  ON b.service_id = s.id
            JOIN shops    sh ON b.shop_id    = sh.id
            WHERE b.client_id = ? AND b.status IN ('pending','confirmed')
            ORDER BY b.booking_date ASC, b.booking_time ASC
            LIMIT 5
        `, [userId]);

        res.render('client/dashboard', {
            title: 'My Dashboard – Schedora',
            user: req.session.user,
            upcoming
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error', message: 'Could not load dashboard.', user: req.session.user });
    }
};

// GET /client/shops  — browse all active shops
exports.getShops = async (req, res) => {
    const { category, search } = req.query;
    try {
        let query = `
            SELECT sh.*, u.name AS owner_name,
                   COUNT(DISTINCT s.id) AS service_count
            FROM shops sh
            JOIN users u ON sh.owner_id = u.id
            LEFT JOIN services s ON s.shop_id = sh.id AND s.is_active = 1
            WHERE sh.is_active = 1
        `;
        const params = [];

        if (category && category !== 'all') {
            query += ' AND sh.category = ?';
            params.push(category);
        }
        if (search) {
            query += ' AND (sh.name LIKE ? OR sh.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        query += ' GROUP BY sh.id ORDER BY sh.created_at DESC';

        const [shops] = await db.query(query, params);
        res.render('client/shops', {
            title: 'Browse Shops – Schedora',
            user: req.session.user,
            shops,
            category: category || 'all',
            search: search || ''
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error', message: 'Could not load shops.', user: req.session.user });
    }
};

// GET /client/shops/:shopId — view a shop and its services
exports.getShopDetail = async (req, res) => {
    const { shopId } = req.params;
    try {
        const [[shop]] = await db.query(
            'SELECT sh.*, u.name AS owner_name FROM shops sh JOIN users u ON sh.owner_id = u.id WHERE sh.id = ? AND sh.is_active = 1',
            [shopId]
        );
        if (!shop) return res.render('error', { title: 'Not Found', message: 'Shop not found.', user: req.session.user });

        const [services] = await db.query(
            'SELECT * FROM services WHERE shop_id = ? AND is_active = 1 ORDER BY created_at DESC',
            [shopId]
        );

        // Load photos for each service
        for (const svc of services) {
            const [photos] = await db.query(
                'SELECT * FROM service_photos WHERE service_id = ? ORDER BY sort_order ASC',
                [svc.id]
            );
            svc.photos = photos;
        }

        res.render('client/shop-detail', {
            title: `${shop.name} – Schedora`,
            user: req.session.user,
            shop,
            services
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error', message: 'Could not load shop.', user: req.session.user });
    }
};

// GET /client/book/:serviceId — booking form
exports.getBookingForm = async (req, res) => {
    const { serviceId } = req.params;
    try {
        const [[service]] = await db.query(
            'SELECT s.*, sh.name AS shop_name, sh.id AS shop_id FROM services s JOIN shops sh ON s.shop_id = sh.id WHERE s.id = ? AND s.is_active = 1',
            [serviceId]
        );
        if (!service) return res.render('error', { title: 'Not Found', message: 'Service not found.', user: req.session.user });

        const [photos] = await db.query(
            'SELECT * FROM service_photos WHERE service_id = ? ORDER BY sort_order ASC',
            [serviceId]
        );

        res.render('client/booking-form', {
            title: `Book ${service.name} – Schedora`,
            user: req.session.user,
            service,
            photos
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error', message: 'Could not load booking form.', user: req.session.user });
    }
};

// POST /client/book/:serviceId
exports.postBooking = async (req, res) => {
    const { serviceId } = req.params;
    const { booking_date, booking_time, notes } = req.body;
    const clientId = req.session.user.id;

    try {
        const [[service]] = await db.query(
            'SELECT * FROM services WHERE id = ? AND is_active = 1', [serviceId]
        );
        if (!service) {
            req.flash('error', 'Service not found.');
            return res.redirect('/client/shops');
        }

        await db.query(
            `INSERT INTO bookings (client_id, service_id, shop_id, booking_date, booking_time, notes, total_price)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [clientId, service.id, service.shop_id, booking_date, booking_time, notes || null, service.price]
        );

        req.flash('success', 'Booking submitted! The shop will confirm shortly.');
        res.redirect('/client/bookings');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Booking failed. Please try again.');
        res.redirect(`/client/book/${serviceId}`);
    }
};

// GET /client/bookings — list all bookings
exports.getBookings = async (req, res) => {
    const userId = req.session.user.id;
    try {
        const [bookings] = await db.query(`
            SELECT b.*, s.name AS service_name, sh.name AS shop_name
            FROM bookings b
            JOIN services s  ON b.service_id = s.id
            JOIN shops    sh ON b.shop_id    = sh.id
            WHERE b.client_id = ?
            ORDER BY b.booking_date DESC, b.booking_time DESC
        `, [userId]);

        res.render('client/bookings', {
            title: 'My Bookings – Schedora',
            user: req.session.user,
            bookings
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error', message: 'Could not load bookings.', user: req.session.user });
    }
};

// POST /client/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    const userId  = req.session.user.id;
    try {
        const [[booking]] = await db.query(
            'SELECT * FROM bookings WHERE id = ? AND client_id = ?', [id, userId]
        );
        if (!booking || !['pending', 'confirmed'].includes(booking.status)) {
            req.flash('error', 'Cannot cancel this booking.');
            return res.redirect('/client/bookings');
        }
        await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);
        req.flash('success', 'Booking cancelled.');
        res.redirect('/client/bookings');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not cancel booking.');
        res.redirect('/client/bookings');
    }
};
