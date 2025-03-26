import mongoose from "mongoose";

const IngredientSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
}, {
    timestamps: true 
});

const Ingredient = mongoose.model('Ingredient', IngredientSchema);

export default Ingredient;