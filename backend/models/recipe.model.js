import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    ingredients: [{
        type: String,
        // required: true
    }],
    instructions: [{
        type: String,
        // required: true
    }],
    image: {
        type: String,
        // required: true
    },
    allergens: [{
        type: String
    }],
    cuisine: {
        type: String
    },
    prepTime: {
        type: Number
    },
    cookTime: {

    },
    servings: {
        type: Number
    },
}, {
    timestamps: true 
});

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;