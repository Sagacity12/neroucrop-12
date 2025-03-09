// Load environment variables first, before any other imports
import dotenv from 'dotenv';

// Load environment variables with a relative path
dotenv.config({ path: '../.env' });

import connectDB from './server/dbConnect/dbConnect.js';
import createExpressApp from './server/createExpressApp.js';
import http from 'http';

// Start the server with minimal logging
async function startServer() {
    try {
        // Connect to MongoDB
        await connectDB(process.env.DB_URI);
        
        // Create and configure Express app
        const app = createExpressApp();
        const server = http.createServer(app);
        
        // Add home route
        app.get('/', (_, res) => { 
            res.json({ message: 'AgricSmart API is running' });
        });
        
        // Start server
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();