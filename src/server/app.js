import createExpressApp from "./createExpressApp.js"
import http from "http";
import connectDB from "./dbConnect/dbConnect.js";
<<<<<<< HEAD
import config from '../config/config.js';
import logger from '../config/logger.js';
import { initializeSocket } from "./createSocketServer.js";

=======
import logger from '../config/logger.js';
>>>>>>> e11db4c566438c77901b1988d6ad8366365050e1

const startServer = async () => {
    try {
        await connectDB(process.env.DB_URI);
        
        const app = createExpressApp();
        const server = http.createServer(app);

<<<<<<< HEAD
        // Initialize WebSocket
        initializeSocket(server);

=======
>>>>>>> e11db4c566438c77901b1988d6ad8366365050e1
        app.get('/', (_, res) => { res.json('hello world')})

        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });

<<<<<<< HEAD
    initializeSocket(server);

    server.listen(3000 || process.env.PORT, () => {
        console.log("server is running on port 3000");
    });
=======
    } catch (error) {
        logger.error('Failed to start server:', error.message);
        process.exit(1);
    }
>>>>>>> e11db4c566438c77901b1988d6ad8366365050e1
};

export default startServer;