import express from 'express';
import routes from '../src/routes/routes.js';

const app = express();

// Middleware
app.use(express.json());

// Test routes import
try {
  app.use(routes);
  
  // Fallback route
  app.all('*', (req, res) => {
    res.status(200).json({
      message: 'Routes imported successfully',
      path: req.path,
      timestamp: new Date().toISOString()
    });
  });
} catch (error) {
  // If routes import fails
  app.all('*', (req, res) => {
    res.status(500).json({
      error: `Routes import failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  });
}

export default app; 