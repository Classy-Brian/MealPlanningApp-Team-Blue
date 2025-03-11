import Recipe from "../models/recipe.model.js";
import mongoose from "mongoose";
import axios from 'axios';

export const getRecipes = async (req, res) => {
    try {
        const response = await axios.get('https://api.edamam.com/api/recipes/v2/', {
            headers: {
                'Edamam-Account-User': 'temporary_user_id' // <- Must be changed later
            },
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

export const createRecipe = async (req, res) => {
    try {
        const newRecipe = new Recipe(req.body); // Create a new recipe object from request body
        const savedRecipe = await newRecipe.save(); // Save the new recipe
        res.status(201).json(savedRecipe); // 201 -> Created successful
    } catch (error) {
        res.status(400).json({ message: error. message }); // 400 -> Bad request
    }
};

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

export const updateRecipe = async (req, res) => {
    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            req.body, // Update with the data from the request body
            { new: true } // Return the updated document
        );
        if (!updatedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(updatedRecipe);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

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

// export const searchRecipes = async (req, res) => {
//     try {
//         const { query} = req.query;
//         if (!query)
//             return res.status(400).json({message: "Query is required"});
        
//         const APP_ID = process.env.EDAMAM_APP_ID
//         const APP_KEY = process.env.EDAMAM_APP_KEY

//         const url = `http://api.edamam.com/search?q=${query}`
//     }
// }

// app.get('/recipes/:query', async (req, res) => {
//     const response = await axios.get(`https://api.edamam.com/search?q=${req.params.query}&app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_API_KEY}`)
//     console.log(response.data.hits)
//     res.json(response.data.hits)
// })