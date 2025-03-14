// backend/server.js
import express from 'express';
import dotenv from "dotenv";
dotenv.config(); 

import cors from 'cors';
import { connectDB } from './config/db.js';
import recipeRoutes from './routes/recipe.route.js';
import userRoutes from './routes/user.routes.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins (for development - temporary)
app.use(cors());

app.use(express.json()); // Allows us to accept JSON data in the req body
app.use(cors());

// Mount routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    connectDB(); // Connect to DB after starting server
    console.log(`Server started at http://localhost:${PORT}`);
});