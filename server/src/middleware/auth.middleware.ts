import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
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
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        console.log('Auth middleware: Token verified, userId:', decoded.userId);
        req.user = { userId: decoded.userId };
        next();
    } catch (error) {
        console.log('Auth middleware: Invalid token', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};
