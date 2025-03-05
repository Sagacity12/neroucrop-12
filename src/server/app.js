import createExpressApp from "./createExpressApp.js"
import http from "http";
import connectDB from "./dbConnect/dbConnect.js";
import config from '../config/config.js';

const startServer = async () => {
    try {
        await connectDB(config.database.uri);
        
        const app = createExpressApp();
        const server = http.createServer(app);

        const PORT = config.server.port || 3000;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('✗ Failed to start server:', error.message);
        process.exit(1);
    }
};

export default startServer;