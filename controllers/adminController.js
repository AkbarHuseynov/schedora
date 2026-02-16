const db = require('../config/db');

// GET /admin/dashboard
exports.getDashboard = async (req, res) => {
    try {
        const [[counts]] = await db.query(`
            SELECT
                (SELECT COUNT(*) FROM users   WHERE role='client') AS clients,
                (SELECT COUNT(*) FROM users   WHERE role='owner')  AS owners,
                (SELECT COUNT(*) FROM shops   WHERE is_active=1)   AS shops,
                (SELECT COUNT(*) FROM bookings)                    AS bookings,
                (SELECT COUNT(*) FROM bookings WHERE status='pending') AS pending_bookings
        `);

        const [recentBookings] = await db.query(`
            SELECT b.*, s.name AS service_name, sh.name AS shop_name, u.name AS client_name
            FROM bookings b
            JOIN services s  ON b.service_id = s.id
            JOIN shops    sh ON b.shop_id    = sh.id
            JOIN users    u  ON b.client_id  = u.id
            ORDER BY b.created_at DESC LIMIT 10
        `);

        res.render('admin/dashboard', {
            title: 'Admin Dashboard – Schedora',
            user: req.session.user,
            counts,
            recentBookings
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error', message: 'Could not load admin dashboard.', user: req.session.user });
    }
};

// GET /admin/users
exports.getUsers = async (req, res) => {
    const { role, search } = req.query;
    try {
        let query = 'SELECT * FROM users WHERE 1=1';
        const params = [];
        if (role && role !== 'all') { query += ' AND role = ?'; params.push(role); }
        if (search) { query += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        query += ' ORDER BY created_at DESC';

        const [users] = await db.query(query, params);
        res.render('admin/users', {
            title: 'Users – Schedora Admin',
            user: req.session.user,
            users,
            roleFilter: role || 'all',
            search: search || ''
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error', message: 'Could not load users.', user: req.session.user });
    }
};

// POST /admin/users/:id/toggle
exports.toggleUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE users SET is_active = NOT is_active WHERE id = ?', [id]);
        req.flash('success', 'User status updated.');
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not update user.');
        res.redirect('/admin/users');
    }
};

// POST /admin/users/:id/delete
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        if (req.session.user.id === parseInt(id)) {
            req.flash('error', 'Cannot delete your own account.');
            return res.redirect('/admin/users');
        }
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        req.flash('success', 'User deleted.');
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not delete user.');
        res.redirect('/admin/users');
    }
};

// GET /admin/shops
exports.getShops = async (req, res) => {
    const { search } = req.query;
    try {
        let query = `
            SELECT sh.*, u.name AS owner_name, u.email AS owner_email,
                   COUNT(DISTINCT s.id) AS service_count,
                   COUNT(DISTINCT b.id) AS booking_count
            FROM shops sh
            JOIN users u ON sh.owner_id = u.id
            LEFT JOIN services s  ON s.shop_id  = sh.id
            LEFT JOIN bookings b  ON b.shop_id  = sh.id
            WHERE 1=1
        `;
        const params = [];
        if (search) { query += ' AND (sh.name LIKE ? OR u.name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        query += ' GROUP BY sh.id ORDER BY sh.created_at DESC';

        const [shops] = await db.query(query, params);
        res.render('admin/shops', {
            title: 'Shops – Schedora Admin',
            user: req.session.user,
            shops,
            search: search || ''
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error', message: 'Could not load shops.', user: req.session.user });
    }
};

// POST /admin/shops/:id/toggle
exports.toggleShop = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE shops SET is_active = NOT is_active WHERE id = ?', [id]);
        req.flash('success', 'Shop status updated.');
        res.redirect('/admin/shops');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not update shop.');
        res.redirect('/admin/shops');
    }
};

// POST /admin/shops/:id/delete
exports.deleteShop = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM shops WHERE id = ?', [id]);
        req.flash('success', 'Shop deleted.');
        res.redirect('/admin/shops');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not delete shop.');
        res.redirect('/admin/shops');
    }
};

// GET /admin/bookings
exports.getBookings = async (req, res) => {
    const { status, search } = req.query;
    try {
        let query = `
            SELECT b.*, s.name AS service_name, sh.name AS shop_name, u.name AS client_name
            FROM bookings b
            JOIN services s  ON b.service_id = s.id
            JOIN shops    sh ON b.shop_id    = sh.id
            JOIN users    u  ON b.client_id  = u.id
            WHERE 1=1
        `;
        const params = [];
        if (status && status !== 'all') { query += ' AND b.status = ?'; params.push(status); }
        if (search) { query += ' AND (u.name LIKE ? OR sh.name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        query += ' ORDER BY b.created_at DESC';

        const [bookings] = await db.query(query, params);
        res.render('admin/bookings', {
            title: 'Bookings – Schedora Admin',
            user: req.session.user,
            bookings,
            statusFilter: status || 'all',
            search: search || ''
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error', message: 'Could not load bookings.', user: req.session.user });
    }
};

// POST /admin/shops/:id/wallet
exports.adjustWallet = async (req, res) => {
    const { id } = req.params;
    const { amount, note, type } = req.body;
    try {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            req.flash('error', 'Invalid amount.');
            return res.redirect('/admin/shops');
        }
        const change = type === 'debit' ? -parsedAmount : parsedAmount;
        await db.query('UPDATE shops SET wallet_balance = wallet_balance + ? WHERE id = ?', [change, id]);
        await db.query(
            'INSERT INTO wallet_transactions (shop_id, type, amount, note) VALUES (?,?,?,?)',
            [id, type, parsedAmount, note || 'Admin adjustment']
        );
        req.flash('success', 'Wallet adjusted.');
        res.redirect('/admin/shops');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not adjust wallet.');
        res.redirect('/admin/shops');
    }
};
