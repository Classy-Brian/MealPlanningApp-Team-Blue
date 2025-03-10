import User from '../models/user.model.js'; 

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }); // Find the user by email

        if (user && (await user.matchPassword(password))) {
            // Generate a JWT here and send it to the client
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
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