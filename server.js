require('dotenv').config();
const express        = require('express');
const session        = require('express-session');
const flash          = require('connect-flash');
const methodOverride = require('method-override');
const path           = require('path');
const { initDB }     = require('./config/db');

const authRoutes   = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const ownerRoutes  = require('./routes/ownerRoutes');
const adminRoutes  = require('./routes/adminRoutes');

const app = express();

// ── View engine ─────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Static files ────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Body parsers ────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Method override (for PUT/DELETE via forms) ───────────────────────────────
app.use(methodOverride('_method'));

// ── Session ─────────────────────────────────────────────────────────────────
app.use(session({
    secret:            process.env.SESSION_SECRET || 'schedora_secret',
    resave:            false,
    saveUninitialized: false,
    cookie:            { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// ── Flash messages ───────────────────────────────────────────────────────────
app.use(flash());

// ── Global template locals ───────────────────────────────────────────────────
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error   = req.flash('error');
    res.locals.user    = req.session.user || null;
    next();
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.render('landing', { title: 'Schedora – Book Your Beauty & Wellness' });
});

app.use('/auth',   authRoutes);
app.use('/client', clientRoutes);
app.use('/owner',  ownerRoutes);
app.use('/admin',  adminRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).render('error', {
        title:   'Page Not Found',
        message: 'The page you are looking for does not exist.',
        user:    req.session.user || null
    });
});

// ── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title:   'Server Error',
        message: 'Something went wrong on our end. Please try again.',
        user:    req.session.user || null
    });
});

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

async function startServer() {
    await initDB();   // create DB + tables if they don't exist
    app.listen(PORT, () => {
        console.log(`\n  \u2726 SCHEDORA running at http://localhost:${PORT}\n`);
    });
}

startServer();
