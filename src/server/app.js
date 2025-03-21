import createExpressApp from "./createExpressApp.js"
import http from "http";
import connectDB from "./dbConnect/dbConnect.js";

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB(process.env.DB_URI);
        
        // Create and configure Express app
        const app = createExpressApp();
        const server = http.createServer(app);

        // Add error handler for server
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${process.env.PORT || 3000} is already in use!`);
            } else {
                console.error('Server error:', error.message);
            }
            process.exit(1);
        });

        // Root route
        app.get('/', (_, res) => { res.json({ message: 'AgricSmart API is running' }) });

        // Start listening
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
           // console.log('=================================');
            console.log(` Server is running on port ${PORT}`);
            console.log(` MongoDB Connected`);
            //console.log('=================================');
        });

    } catch (error) {
        console.error('Server startup error:', error.message);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(error.message);
  process.exit(1);
});

export default startServer;