import mongoose from "mongoose";

const IngredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    quantity: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true 
});

const Ingredient = mongoose.model('Ingredient', IngredientSchema);

export default Ingredient;