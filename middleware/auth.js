// Middleware: ensure user is logged in
function requireLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', 'Please log in to continue.');
        return res.redirect('/auth/login');
    }
    next();
}

// Middleware: restrict to a specific role
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.session.user) {
            req.flash('error', 'Please log in to continue.');
            return res.redirect('/auth/login');
        }
        if (!roles.includes(req.session.user.role)) {
            return res.status(403).render('error', {
                title: 'Access Denied',
                message: 'You do not have permission to view this page.',
                user: req.session.user
            });
        }
        next();
    };
}

module.exports = { requireLogin, requireRole };
