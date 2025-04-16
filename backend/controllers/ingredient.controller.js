import Ingredient from "../models/ingredient.model.js";
import mongoose from "mongoose";
import axios from 'axios';
import express from "express";

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

export const createIngredient = async (req, res) => {
    try {
        const newIngredient = new Ingredient(req.body); // Create a new ingredient object from request body
        const savedIngredient = await newIngredient.save(); // Save the new ingredient
        res.status(201).json(savedIngredient); // 201 -> Created successful
    } catch (error) {
        res.status(400).json({ message: error. message }); // 400 -> Bad request
    }
};

export const getAllIngredients = async (req, res) => {
     try {
        const ingredients = await Ingredient.find(); //Find all recipes
        res.json(ingredients);
        if (!ingredients) {
            return res.status(404).json({ message: 'Recipe not found' }); // 404 -> Not found
        }
     } catch (error) {
        res.status(500).json({ message: error.message }); // 500 -> Internal server error
     }
};

export const getIngredientById = async (req, res) => {
    try {
        const ingredient = await Ingredient.findById(req.params.id); // Find recipe by ID
        if (!ingredient) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(ingredient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateIngredient = async (req, res) => {
    try {
        const updatedIngredient = await Ingredient.findByIdAndUpdate(
            req.params.id,
            req.body, // Update with the data from the request body
            { new: true } // Return the updated document
        );
        if (!updatedIngredient) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(updatedIngredient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteIngredient = async (req, res) => {
    try {
        const deletedIngredient = await Ingredient.findByIdAndDelete(req.params.id);
        if (!deletedIngredient) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json({ message: 'Recipe deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};