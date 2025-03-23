import express from 'express';

// Create a new express application instance
const app = express();

// Define a route handler for the default home page
app.get('*', (req, res) => {
  res.json({
    message: 'Express-only API is working',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Export the express app
export default app; 