import User from '../models/user.model.js'; 
import jwt from "jsonwebtoken"

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email }); // Find the user by email
        if (!user) return res.status(400).json({ message: "User not found"});

        if (user && (await user.matchPassword(password))) {
            // Generate a JWT here and send it to the client
            const token = jwt.sign({ _id:user._id }, process.env.JWT_SECRET, {expiresIn: "1h"});
            
            res.json({ token, user: {_id: user._id, email: user.email,}
                // other user data we want to send
                // Need create a token: generateToken(user._id)
            });
        } else {
            // Invalid email or password
            res.status(401).json({ message: 'Invalid email or password' }); // 401 Unauthorized
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};