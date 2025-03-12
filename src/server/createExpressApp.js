import "express-async-errors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import rateLimit from "express-rate-limit";
import routes from "../routes/routes.js";
import errorHandler from "../middleware/error-handler.js";
import notFoundMiddleware from '../middleware/not-found.js';
import passport from 'passport';
import { initializePassport } from '../services/google-auth/index.js';

const limit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
});

const createExpressApp = () => {
    const app = express();


    // Middleware
    app.use(express.json());
    app.set("trust proxy", 1);
    app.use(limit);
    app.use(morgan("dev"));
    app.use(cors({
        origin: [
            'http://localhost:5173',  // frontend dev
            "http://127.0.0.1:5501",
            process.env.FRONTEND_URL  // frontend production
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }));
    app.use(helmet());

    // Initialize Passport
    initializePassport();
    app.use(passport.initialize());


    // Routes
    app.use(routes);


    app.all("*", (req, res) => {
        res.status(404).send({ errors: [{ message: "Resource not found" }] });
    });

    return app;
};

export default createExpressApp;