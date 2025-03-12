import User from '../models/user.model.js'; 
import Recipe from '../models/recipe.model.js';

//CREATE: Register a new User
export const createUser = async (req, res) => {
  try {
    const { name, email, password, allergies, profile } = req.body;

    // Check if user already exists by email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user document
    const user = await User.create({
      name,
      email,
      password,
      allergies,
      profile
    });

    // Return the created user
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      allergies: user.allergies,
      profile: user.profile,
      recipes: user.recipes
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//READ: Get All Users. for admin or debugging
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); 
    //.select('-password') hides the password field

    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//READ: Get Single User by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Populate 'recipes' to get actual recipe documents if needed. otherwise returns the id.
    // .populate('recipes')
    const user = await User.findById(id)
    .select('-password')
    .populate('recipes')
    ;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//UPDATE: Update User by ID (Patch or Put)
//need to create a seperate route for password changes later
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, allergies, profile } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (allergies !== undefined) user.allergies = allergies;
    if (profile !== undefined) {
      //can do a deep merge or just replace
      user.profile = {
        ...user.profile,
        ...profile
      };
    }

    const updatedUser = await user.save();

    // Return sanitized user
    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      allergies: updatedUser.allergies,
      profile: updatedUser.profile,
      recipes: updatedUser.recipes,
      updatedAt: updatedUser.updatedAt
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//DELETE: Remove a User by ID
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found or already deleted' });
    }

    return res.json({ message: `User ${id} deleted successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//LOGIN: log user in
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }); // Find the user by email

    if (user && (await user.matchPassword(password))) {
      // will need to generate a JWT here and send it to the client
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        // for later: token: generateToken(user._id),
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

//PATCH: Add Recipe to User
export const addRecipeToUser = async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the recipe
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Add recipe ID to user's recipe array
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
