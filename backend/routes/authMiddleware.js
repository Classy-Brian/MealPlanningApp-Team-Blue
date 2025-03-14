import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log("Token is: ", token);

    if (!token) {
        return res.status(401).json({ error: "No token, authorization denied"});
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {_id: decoded._id};
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token'});
    }
};

export default authenticateJWT;