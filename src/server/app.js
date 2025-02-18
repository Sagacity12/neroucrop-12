import createExpressApp from "./createExpressApp.js"
import http from "http";
import connectDB from "./dbConnect/dbConnect.js";


const startServer = async () => {
    await connectDB(process.env.DB_URI);

    const app = createExpressApp();

    const server = http.createServer(app);

    server.listen(3000 || process.env.PORT, () => {
        console.log("server is running on port 3000");
    });
};

export default startServer;