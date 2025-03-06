// Entry point for our API
import express from 'express';
import dotenv from "dotenv";
<<<<<<< Updated upstream
import { connectDB } from './config/db';
=======
import { connectDB } from './config/db.js';

import recipeRoutes from './routes/recipe.route.js'; // Make sure the path is correct
import userRoutes from './routes/user.routes.js';
>>>>>>> Stashed changes

dotenv.config();

const app = express(); // Initializes a new Express.js application instance
<<<<<<< Updated upstream
=======
const PORT = process.env.PORT || 5000

app.use(express.json()); // Allows us to accept JSON data in the req body

app.use('/api/recipes', recipeRoutes) // Mount the recipe routes
app.use('/api/users', userRoutes) //Mount the user routes
>>>>>>> Stashed changes

// Starts Express.js server, make it listen for incoming request from client
app.listen(5000, () => {
    connectDB();
    console.log("Server started at http://localhost:5000 ");
})