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

/* REFERENCE
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({ success: true, data: products});
    } catch (error){
        console.log("error in fetching products:", error.message);
        res.status(500).json({ success: false, message: "Server Error"});
    }
};
*/