import "express-async-errors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import rateLimit from "express-rate-limit";



const limit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
});

const createExpressApp = () => {
    const app = express();
    app.use(express.json());
    app.set("trust proxy", 1);
    app.use(limit);
    app.use(morgan("combined"));
    app.use(cors());
    app.use(helmet());




    app.all("*", (req, res) => {
        res.status(404).send({ errors: [{ message: "Resource not found" }] });
    });

    return app;
};

export default createExpressApp;