import { Router } from "express";
import chatRoutes from "./chatRoutes.js";

const router = Router();

router.use('/chat', chatRoutes);

export default router;