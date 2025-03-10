// Entry point for our API
import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './config/db.js';

import recipeRoutes from './routes/recipe.route.js'; // Make sure the path is correct

dotenv.config();

const app = express(); // Initializes a new Express.js application instance
const PORT = process.env.PORT

app.use(express.json()); // Allows us to accept JSON data in the req body

app.use('/api/recipes', recipeRoutes) // Mount the recipe routes

// Starts Express.js server, make it listen for incoming request from client
app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:" + PORT);
});