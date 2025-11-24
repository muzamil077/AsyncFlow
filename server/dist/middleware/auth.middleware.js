"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log('Auth middleware: No auth header');
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        console.log('Auth middleware: No token in header');
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log('Auth middleware: Token verified, userId:', decoded.userId);
        req.user = { userId: decoded.userId };
        next();
    }
    catch (error) {
        console.log('Auth middleware: Invalid token', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
