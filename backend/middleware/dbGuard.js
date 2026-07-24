const mongoose = require('mongoose');

// Blocks routes that genuinely need the database. When MongoDB is unreachable
// the API stays up (so the catalog and existing logged-in sessions keep
// working), but anything requiring a live DB — login/signup, creating or
// saving rooms and designs — returns a clean 503 instead of hanging.
module.exports = function dbGuard(req, res, next) {
  if (mongoose.connection.readyState === 1) return next();
  res.status(503).json({
    message: 'This feature needs the database, which is temporarily offline. You can still browse the catalog.',
    offline: true,
  });
};
