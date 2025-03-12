import User from '../models/user.model.js'; 
import mongoose from 'mongoose';
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
                // Login NOT DONE YET
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

//fetching user's saved recipes
export const getSavedRecipes = async (req, res) => {
    try{
        const user = await User.findById(req.params.id).populate('savedRecipes');
        if (!user){
            return res.status(404).json({message: "User not found"});
        }

        res.json(user.savedRecipes);
    } catch (error){
        res.status(500).json({message: "Server error", error: error.message});
    }
}

export const saveRecipe = async (req, res) => {
    try {
        const { userId, recipeId } = req.body;

        if (!userId || !recipeId) {
            return res.status(400).json({ message: "User ID and Recipe ID are required." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        //  Ensure `savedRecipes` is an array before updating
        if (!Array.isArray(user.savedRecipes)) {
            user.savedRecipes = []; // Initialize as an empty array if it's not already an array
        }

        //  Use `$addToSet` to prevent duplicates and ensure the field remains an array
        await User.findByIdAndUpdate(userId, {
            $addToSet: { savedRecipes: recipeId } //  Ensures it's added as part of an array
        });

        res.status(200).json({ message: "Recipe saved successfully!", savedRecipes: user.savedRecipes });
    } catch (error) {
        console.error("Error saving recipe:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id); // Find recipe by ID
        if (!user) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};