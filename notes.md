-- DEPENDENCIES NEEDED --
Look into the package.json and look for "dependencies"
- There is one in the root and another in the frontend. Im not sure if its good practice but it's there when I started the expo project so yeah.
  - note: Im using windows so if you're not, the version might be different
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
