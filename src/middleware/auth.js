import User from "..models/usermodel.js";
import jwt from "jsonwebtoken";
import { UnauthenticatedError } from "../errors/unauthenticated.js";

const authenticatedMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Beare")) {
        throw new UnauthenticatedError("No token provided");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id).select("-password");
        req.user = user;
        req.user = { userId: payload.userId, username: payload.username};
        next();
    } catch (error) {
        throw new UnauthenticatedError("invalid credentials");
    }
}


export default authenticatedMiddleware