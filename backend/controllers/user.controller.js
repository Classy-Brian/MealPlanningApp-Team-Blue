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


export const createUser = async (req, res) => {
    try {
      const { name, email, password, allergies, profile } = req.body;
  
      // Check if user already exists by email
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Create new user document with the provided data
      const user = await User.create({
        name,
        email,
        password,
        allergies,
        profile
      });
  
      // Return the created user
      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

export const addRecipeToUser = async (req, res) => {
    try {
      const { userId, recipeId } = req.params;
  
      //Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      //Find the recipe
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
  
      //Add recipe ID to user's recipe array
      if (!user.recipes.includes(recipeId)) {
        user.recipes.push(recipeId);
        await user.save();
      }
  
      return res.json({ message: "Recipe added to user", user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };