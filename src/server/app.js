import createExpressApp from "./createExpressApp.js"
import http from "http";
import connectDB from "./dbConnect/dbConnect.js";
import config from '../config/config.js';
import logger from '../config/logger.js';

const startServer = async () => {
    try {
        await connectDB(config.database.uri);
        
        const app = createExpressApp();
        const server = http.createServer(app);

        server.listen(config.server.port, () => {
            logger.info(`Server running on port ${config.server.port}`);
        });

    } catch (error) {
        logger.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

export default startServer;