// Entry point for our API
import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './config/db.js';

dotenv.config();

const app = express(); // Initializes a new Express.js application instance

// Starts Express.js server, make it listen for incoming request from client
app.listen(5000, () => {
    connectDB();
    console.log("Server started at http://localhost:5000 ");
})