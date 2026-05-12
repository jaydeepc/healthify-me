require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('../db');
const { router: routes } = require('../routes');
const { notFound, errorHandler } = require('../middleware/errorHandler');
const prometheusRoutes = require('../routes/prometheusRoutes');
const responseTimeMetrics = require('../middleware/responseTimeMetrics');

const app = express();

const getCorsOrigin = () => {
  if (process.env.CORS_ORIGIN) {
    return process.env.CORS_ORIGIN
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  return true;
};

app.use(responseTimeMetrics);
app.use(cors({
  origin: getCorsOrigin(),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'health-tracker-backend',
    endpoints: ['/api/health', '/health-tracker/api/health'],
  });
});

app.use('/api', routes);
app.use('/api/actuator', prometheusRoutes);
app.use('/health-tracker/api', routes);
app.use('/health-tracker/api/actuator', prometheusRoutes);

app.use(notFound);
app.use(errorHandler);

const DB_REQUIRED_PREFIXES = [
  '/api/health-metrics',
  '/api/seed',
  '/health-tracker/api/health-metrics',
  '/health-tracker/api/seed',
];

let connectionPromise;
let isConnected = false;

const getRequestPath = (req) => {
  const rawUrl = req.url || req.originalUrl || '/';
  const [path] = rawUrl.split('?');

  return path || '/';
};

const shouldConnectToDatabase = (req) => {
  if (req.method === 'OPTIONS') {
    return false;
  }

  const requestPath = getRequestPath(req);

  return DB_REQUIRED_PREFIXES.some((prefix) => (
    requestPath === prefix || requestPath.startsWith(`${prefix}/`)
  ));
};

const ensureDatabaseConnected = async () => {
  if (isConnected) {
    return;
  }

  if (!process.env.MONGO_URI) {
    const error = new Error('MONGO_URI is required for database-backed API routes.');
    error.statusCode = 500;
    throw error;
  }

  if (!connectionPromise) {
    connectionPromise = connectDB()
      .then(() => {
        isConnected = true;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  await connectionPromise;
};

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

module.exports = async (req, res) => {
  try {
    if (shouldConnectToDatabase(req)) {
      await ensureDatabaseConnected();
    }

    return app(req, res);
  } catch (error) {
    console.error('Failed to prepare serverless request:', error);
    return sendJson(res, error.statusCode || 500, {
      success: false,
      error: {
        statusCode: error.statusCode || 500,
        message: error.message,
      },
    });
  }
};
