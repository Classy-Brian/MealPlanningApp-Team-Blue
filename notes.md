-- DEPENDENCIES NEEDED --
Look into the package.json and look for "dependencies"
- There is one in the root and another in the frontend. Im not sure if its good practice but it's there when I started the expo project so yeah.
  - note: Im using windows so if you're not, the version might be different
  - note: Must install Node.js and npm
  - To install my dependencies, cd into the folder with the package.json and type: npm install

-- TO RUN THE SERVER --
type in console: npm run dev

-- BACKEND: Step by step what I did -- 

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
            const response = await axios.get('https://api.edamam.com/api/recipes/v2', {
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

Current next step for backend:
- Make the MongoDB and put it in the .env
    - Then test it
- Add the meal planner API

-- Frontend: Step by step what I did -- 

1. cd in the frontend folder

2. In the console: npx create-expo-app@latest
    - For the name I put byte-me

3. cd in the byte-me folder

4. In the console: npm run reset-project
    - Start off with blank canvas
    - In the app-example was the default template
        - Could use it as a reference
