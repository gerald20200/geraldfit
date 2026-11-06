import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
const origins = new Set((process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean));
const isLocalDevelopmentOrigin = (origin) => process.env.NODE_ENV !== 'production'
  && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: (origin, callback) => callback(null, !origin || origins.has(origin) || isLocalDevelopmentOrigin(origin)) }));
app.use(express.json({ limit: '20kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/users', userRoutes);
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  return res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : error.message });
});

app.listen(port, () => console.info(`Geraldfit API listening on port ${port}`));