-- BACKEND 2/27 -- 

    1. Created backend and frontend folder

    2. In the root console: npm init -y

    3. In the console: npm install express mongoose dotenv

    4. Created server.js
        - Entry point for our API

    5. package.json
        - Added in line 9: "type": "module",
        - Now able to use import-export syntax
            - ex. import express from 'express';

    6. Created server.js in backend folder
        - import express from 'express';
            - Imports the Express.js framework
        - const app = express();
            - Initializes a new Express.js application instance

    7. Added in server.js:
        app.listen(5000, () => {
        console.log("Server started at http://localhost:5000 ");
        })
        - Starts Express.js server, make it listen for incoming request from client
        - 5000: Specifies the port
        - Logs a message to your console to let you know the server is running

    7. In the console: npm i nodemon -D
        - So when you make changes you down have to stop the server and re-run it

    8. Added in package.json:
        "scripts": {
            "dev": "nodemon backend/server.js"
        },
        - instead of typing nodemon backend/server.js you type npm run dev

    9. Created .env
        - This file will contain sensitive information
        MONGO_URI= ...
        - Connecting string to connect to database

    10. Added in server.js 
        import dotenv from "dotenv";
        - Node.js package that helps manage enviroment variables
        dotenv.config();
        - Loads the environment variables from the file .env
        - This is how we will connect our db

    11. Created a config folder in the backend folder

    12. Created the db.js in the config folder

    13. imported the mongoose library
        import mongoose from 'mongoose';
        - Provides a way to interact with MongoDB in a more structured and object-oriented way. 

    14. Created the connectDB function in db.js
        export const connectDB = async () => {
            try {
                const conn = await mongoose.connect(process.env.MONGO_URI);
                console.log(`MongoDB Connected: ${conn.connection.host}`);
            } catch (error) {
                console.error(`Error: ${error.message}`);
                process.exit(1); // process code 1 code means exit with failure, 0 means success
            }
        };
        - This function handles conntecting to the MongoDB database
        - The process.env.MONGO_URI part retrieves the  MongoDB connection string from the environment variables that was set up earlier using the .env file.

    15. Added in server.js
        import { connectDB } from './config/db';
        connectDB();
        - Establish the connection to the MongoDB database when the server starts

    16. Made a MongoDB and put the connectection string in the .env
        - I will need your email to give you access

    17. Creates models folder in backend

    18. Created receipe.model.js

    19. Added in receipe.model.js
        const recipeSchema = new mongoose.Schema({
            name: 
            {
                type: String,
                required: true
            },
            ingredient:
            {
                type: String,
                required: true
            },
            image: {
                type: String,
                required: true
            },
        }, {
            timestamps: true 
        });

        const Recipe = mongoose.model('Recipe', recipeSchema);
        export default Recipe;
        - Defines a Mongoose schema for recipe data
            - Probably need to add more like allergies/cooking direction

    20. Created user.model.js

    21. Added in user.model.js
        const userSchema = new mongoose({
            name: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true,
                unique: true
            },
            password: {
                type: String,
                required: true
            },
            allergies: {
                type: String
            }
        }, {
            timestamps: true 
        });

        const User = mongoose.model('User', userSchema);
        export default User;
        - Defines a Mongoose schema for User data

    22. Added in .env
        PORT=...
        EDAMAM_APP_ID=...
        EDAMAM_API_KEY=...
        - The Port variable specifies the port number where the server will run
        - The EDAMAM_APP_ID and EDAMAM_API_KEY are obtained from the Edamam website and are used to authenticate requests to their API


    23. Added controllers folder and recipe.controller.js
        export const getRecipes = async (req, res) => {
            try {
                const response = await axios.get('https://api.edamam.com/api/recipes/v2/', {
                    params: {
                        type: 'public',
                        q: req.query.q,
                        app_id: process.env.EDAMAM_APP_ID,
                        app_key: process.env.EDAMAM_APP_KEY
                    }
                });
                res.json(response.data);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error fetching recipes '});
            }
        };
        - The controllers folder will contain controller functions that handle API requests and logic.
        - The getRecipes function in recipe.controller.js is responsible for fetching recipes from the Edamam API.
        - It uses axios to make a GET request to the Edamam API, including the search query (q) from the request parameters and the API credentials from the .env file.
        - It then sends the API response back to the client in JSON format.

    24. Added routes folder and recipe.route.js
        import express from "express";

        import { getRecipes } from "../controllers/recipe.controller";

        const router = express.Router();

        router.get("/", getRecipes);

        export default router;
        - The routes folder will contain route definitions for different parts of the API.
        - The recipe.route.js file defines a route (/) that uses the getRecipes controller function to handle GET requests for recipes.

    25. Added in server.js 
        app.use(express.json()); // Allows us to accept JSON data in the req body

        app.use('/api/recipes', recipeRoutes) // Mount the recipe routes

    26. Tested in Postman

-- FRONTEND 3/1 -- 

    1. cd in the frontend folder

    2. In the console: npx create-expo-app@latest
        - For the name I put ByteMe

    3. cd in the ByteMe folder

-- BACKEND 3/1 --

    1. install bcryptjs

    2. import bcryptjs

    3. Added in user.model.js:
        userSchema.pre('save', async function(next) {
            // Only hash the password if it has been modified (or is new)
            if (!this.isModified('password')) {
                return next();
            }

            try {
                const salt = await bcrypt.genSalt(10); // Generate a salt 
                const hashedPassword = await bcrypt.hash(this.password, salt); // Hash the password
                this.password = hashedPassword; // Replace the plain text password with the hashed password
                next(); // Continue with the save operation
            } catch (error) {
                return next(error); // Pass any errors to the error handling middleware
            }
        });

        - Use pre('save', ...) hook to hash the password before it's saved to the database.
        - this.isModified('password')
            - Ensure to only hash the password if it's been changed or if it is a new user
        - bcrypt.genSalt(10)
            - "salt", random data added to the password before hashing
            - 10 is the number of rounds
        - bcrypt.hash(this.password, salt)
            - Hases the password using the generated salt
    
    4. Added a methods to compare passwords in user.model.js
        userSchema.methods.matchPassword = async function(enteredPassword) {
            try {
                return await bcrypt.compare(enteredPassword, this.password); // Compare the entered password with the stored hashed password
            } catch (error) {
                throw new Error(error); // Or handle the error as you see fit
            }
        };

        - userSchema.methods.matchPassword = 
            - Call this method on a user object retrieved from the database.
        - bcrypt.compare(enteredPassword, this.password)
            - Handles the comparison securely
            - True if they match, False otherwise
    
    5. Created user.controller.js in controllers

    6. Added loginUser
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

    - login is not done yet

    7. Added more to user.model.js and recipe.model.js

    8. Adding createRecipe into recipe.controller.js
    export const createRecipe = async (req, res) => {
        try {
            const newRecipe = new Recipe(req.body); // Create a new recipe object from request body
            const savedRecipe = await newRecipe.save(); // Save the new recipe
            res.status(201).json(savedRecipe); // 201 -> Created successful
        } catch (error) {
            res.status(400).json({ message: error. message }); // 400 -> Bad request
        }
    };
    - Receives recipe data from the client in the request body (req.body).
    - Creates a new Recipe object using the Mongoose model.
    - Saves the new recipe to the MongoDB database.
    - Sends a 201 Created response with the saved recipe data (if successful).
    - Sends a 400 Bad Request response with an error message (if there was an error).

    9. Adding getAllRecipes into recipe.controller.js
    export const getAllRecipes = async (req, res) => {
        try {
            const recipes = await Recipe.find(); //Find all recipes
            res.json(recipes);
            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found' }); // 404 -> Not found
            }
        } catch (error) {
            res.status(500).json({ message: error.message }); // 500 -> Internal server error
        }
    };
    - Receives a request (req): Doesn't use any data from the request body or parameters.
    - Queries the database: Uses Recipe.find() (with no arguments) to retrieve all recipe documents from the MongoDB collection associated with the Recipe model.
    - Handles Asynchronous Operation: Uses await to wait for the database query to complete.
    - If successful: Sends a JSON response (res.json(recipes)) containing an array of recipe objects.
    - If an error occurs: Sends a 500 Internal Server Error

    10. Adding getRecipeById into recipe.controller.js
    export const getRecipeById = async (req, res) => {
        try {
            const recipe = await Recipe.findById(req.params.id); // Find recipe by ID
            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found' }); 
            }
            res.json(recipe);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    - Receives a request (req): Gets the recipe ID from the URL parameters (req.params.id).
    - Queries the database: Uses Recipe.findById(req.params.id) to find a single recipe document by its _id.
    - Handles Asynchronous Operation: Uses await to wait for the database query.
    - If found: Sends a JSON response (res.json(recipe)) containing the recipe data (status code 200 OK).
    - If not found: Sends a 404 Not Found response.
    - If an error occurs: Sends a 500 Internal Server Error response with an error message.

    11. Adding updateRecipe into recipe.controller.js
    export const updateRecipe = async (req, res) => {
        try {
            const updateRecipe = await Recipe.findByIdAndUpdate(
                req.params.id,
                req.body, // update with the data with the request body
                { new: true } // return the updated doc
            );
            if (!updateRecipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }
            res.json(updateRecipe);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    };
    - Receives a request (req): Gets the recipe ID from the URL parameters (req.params.id) and the update data from the request body (req.body).
    - Finds and Updates: Uses Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true }) to find a recipe by ID and update it with the provided data. The { new: true } option ensures that the updated document is returned.
    - Handles "Not Found" Case: Checks if a recipe was actually found and updated. If not, sends a 404 Not Found response.
    - If successful: Sends a JSON response (res.json(updatedRecipe)) containing the updated recipe data (status code 200 OK).
    - If not found: Sends a 404 Not Found response.
    - If an error occurs: Sends a 400 Bad Request (or potentially 500 Internal Server Error) response with an error message.


    12. Adding deleteRecipe into recipe.controller.js
    export const deleteRecipe = async (req, res) => {
        try {
            const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
            if (!deleteRecipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }
            res.json({ message: 'Recipe deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    - Receives a request (req): Gets the recipe ID to delete from the URL parameters (req.params.id).
    - Finds and Deletes: Uses Recipe.findByIdAndDelete(req.params.id) to find a recipe by ID and delete it.
    - Handles "Not Found" Case: Checks if a recipe was actually found and deleted. If not, sends a 404 Not Found response.
    - If successful: Sends a JSON response (res.json({ message: 'Recipe deleted' })) with a success message (status code 200 OK). Or you could use 204 No Content.
    - If not found: Sends a 404 Not Found response.
    - If an error occurs: Sends a 500 Internal Server Error response with an error message. 