// backend/server.js
import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './config/db.js';
import axios from 'axios'
import cors from 'cors'
import path from 'path'


import cors from 'cors';
import { connectDB } from './config/db.js';
import recipeRoutes from './routes/recipe.route.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express(); // Initializes a new Express.js application instance
const PORT = process.env.PORT || 5000


app.use(cors());
app.use(express.json()); // Allows us to accept JSON data in the req body
app.use(cors());

app.use('/api/recipes', recipeRoutes) // Mount the recipe routes
app.use('/api/users', userRoutes) //Mount the user routes

app.listen(PORT, () => {
    connectDB(); // Connect to DB after starting server
    console.log(`Server started at http://localhost:${PORT}`);
});