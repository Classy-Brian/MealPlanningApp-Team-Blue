// Entry point for our API
import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './config/db.js';
import cors from "cors"

import recipeRoutes from './routes/recipe.route.js'; // Make sure the path is correct
import userRoutes from './routes/user.routes.js';


dotenv.config();

const app = express(); // Initializes a new Express.js application instance
const PORT = process.env.PORT

app.use(express.json()); // Allows us to accept JSON data in the req body

app.use(cors())

app.use('/api/recipes', recipeRoutes) // Mount the recipe routes
app.use('/api/users', userRoutes);


// Starts Express.js server, make it listen for incoming request from client
app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:" + PORT);
});