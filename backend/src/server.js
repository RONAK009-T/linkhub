const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const { initDatabase, isUsingFallback } = require('./config/db');
const { setupChatSocket } = require('./socket/chatSocket');
const { startMessageCleanupJob } = require('./services/cleanupService');

const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
const linksRoutes = require('./routes/links.routes');
const adminRoutes = require('./routes/admin.routes');
const complianceRoutes = require('./routes/compliance.routes');

const app = express();
const server = http.createServer(app);

// Cross-Origin Resource Sharing configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8081',
  'http://localhost:19006',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  process.env.NETLIFY_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(express.json());
app.use(morgan('dev'));

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'LinkHub Real-Time API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: isUsingFallback() ? 'development_store' : 'production_mysql'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/links', linksRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/compliance', complianceRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV !== 'production' ? err.message : undefined
  });
});

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  await initDatabase();

  // Initialize Socket.io chat handlers
  setupChatSocket(io);

  // Start background 60-second message expiration cleanup sweep
  startMessageCleanupJob(io);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`  LinkHub API & Temporary Chat Server Online          `);
    console.log(`  Port: http://0.0.0.0:${PORT}                       `);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Temporary Message Lifespan: 60 Seconds               `);
    console.log(`  DPDPA 2023 & Intermediary Compliance Active         `);
    console.log(`=======================================================`);
  });
}

// If run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };
