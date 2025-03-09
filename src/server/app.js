import createExpressApp from "./createExpressApp.js"
import http from "http";
import connectDB from "./dbConnect/dbConnect.js";
import logger from '../config/logger.js';

const startServer = async () => {
    try {
        await connectDB(process.env.DB_URI);
        
        const app = createExpressApp();
        const server = http.createServer(app);

        app.get('/', (_, res) => { res.json('hello world')})

        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });

    } catch (error) {
        logger.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

export default startServer;