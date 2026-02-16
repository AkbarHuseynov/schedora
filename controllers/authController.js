const bcrypt = require('bcryptjs');
const db     = require('../config/db');

// GET /auth/login
exports.getLogin = (req, res) => {
    res.render('auth/login', { title: 'Login – Schedora', user: req.session.user || null });
};

// POST /auth/login
exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
        if (!rows.length) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/auth/login');
        }
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/auth/login');
        }
        req.session.user = {
            id:   user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        // Redirect by role
        if (user.role === 'admin')  return res.redirect('/admin/dashboard');
        if (user.role === 'owner')  return res.redirect('/owner/dashboard');
        return res.redirect('/client/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/auth/login');
    }
};

// GET /auth/register
exports.getRegister = (req, res) => {
    res.render('auth/register', { title: 'Register – Schedora', user: req.session.user || null });
};

// POST /auth/register
exports.postRegister = async (req, res) => {
    const { name, email, password, confirm_password, role, phone } = req.body;

    if (password !== confirm_password) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect('/auth/register');
    }
    if (!['client', 'owner'].includes(role)) {
        req.flash('error', 'Invalid role selected.');
        return res.redirect('/auth/register');
    }

    try {
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length) {
            req.flash('error', 'Email is already registered.');
            return res.redirect('/auth/register');
        }
        const hash = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
            [name, email, hash, role, phone || null]
        );
        req.flash('success', 'Account created! Please log in.');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Registration failed. Please try again.');
        res.redirect('/auth/register');
    }
};

// GET /auth/logout
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};
