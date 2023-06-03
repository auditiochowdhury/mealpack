module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      // originally it was at the root '/', but i wanted it so that if you're not logged in and you click one of the navbar elements at the index.ejs, it takes you to the login page
      res.redirect("/login");
    }
  },
  ensureGuest: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/dashboard");
    }
  },
};
