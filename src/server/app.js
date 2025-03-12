import createExpressApp from "./createExpressApp.js"
import http from "http";
import connectDB from "./dbConnect/dbConnect.js";
import config from '../config/config.js';
import logger from '../config/logger.js';
import { initializeSocket } from "./createSocketServer.js";


const startServer = async () => {
    await connectDB(process.env.DB_URI);

        // Initialize WebSocket
        initializeSocket(server);

        app.get('/', (_, res) => { res.json('hello world')})

    const server = http.createServer(app);

    initializeSocket(server);

    server.listen(3000 || process.env.PORT, () => {
        console.log("server is running on port 3000");
    });
};

export default startServer;