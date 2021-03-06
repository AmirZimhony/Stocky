module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first! Sign in and sing out ;)');
        return res.redirect('/login');
    }
    next();
}