import express from 'express';
import cors from 'cors';
import authRoutes from '../src/routes/auth-routes.js';

const app = express();
app.use(express.json());
app.use(cors());

// Use your auth routes
app.use('/api/v1/auth', authRoutes);

// Catch-all for this route
app.all('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found in auth API'
  });
});

export default app; 