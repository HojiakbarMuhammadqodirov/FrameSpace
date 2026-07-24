const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dbGuard = require('./middleware/dbGuard');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
// The furniture route serves a bundled fallback catalog when Mongo is down, so
// it is intentionally NOT behind dbGuard — the catalog must stay browsable.
app.use('/api/furniture', require('./routes/furniture'));

// Everything below needs a live database. dbGuard lets these boot without Mongo
// but returns a clean 503 (instead of hanging) while the DB is offline.
app.use('/api/auth', dbGuard, require('./routes/auth'));
app.use('/api/user', dbGuard, require('./routes/user'));
app.use('/api/rooms', dbGuard, require('./routes/rooms'));
app.use('/api/designs', dbGuard, require('./routes/designs'));
app.use('/api/templates', dbGuard, require('./routes/templates'));

app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  db: mongoose.connection.readyState === 1 ? 'connected' : 'offline',
  timestamp: new Date(),
}));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/framespace';

// Start the HTTP server FIRST so the app is reachable even if Mongo never
// connects — the catalog and existing JWT sessions work regardless.
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function connectMongo() {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
      console.error('MongoDB connection error (running in offline mode):', err.message);
      // Retry in the background; the app keeps serving the fallback catalog.
      setTimeout(connectMongo, 10000);
    });
}
connectMongo();

mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected — offline mode'));
mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));
