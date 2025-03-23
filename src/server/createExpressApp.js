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
        origin: ['http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(helmet());

    // Initialize Passport without session support
    initializePassport();
    app.use(passport.initialize());

    // Add root route explicitly
    app.get('/', (req, res) => {
        res.json({ message: 'AgricSmart API is running' });
    });

    // Routes
    app.use(routes);

    // Add this at the end of your routes section, before error handling middleware
    app.get('*', (req, res) => {
        res.status(200).json({ message: 'AgricSmart API is running' });
    });

    // Error handling
    app.use(notFoundMiddleware);
    app.use(errorHandler);

    return app;
};

export default createExpressApp;