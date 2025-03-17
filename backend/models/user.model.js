import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatar: { 
        type: String 
    },
    password: {
        type: String,
        required: true
    },
    allergies: [{
        type: String
    }],
  
    // Profile section
    profile: {
        calories: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        current: { type: Number, default: 0 }
      },
        recipes: {
        tried: { type: Number, default: 0 },
        wantToTry: { type: Number, default: 0 }
      }
    },
  
    //Recipes section - Array of Recipe IDs
    recipes: [{
      type: mongoose.Schema.Types.ObjectId, // Reference to Recipe model
      ref: "Recipe"
    }]
  
  }, {
    timestamps: true
  });

// Hash the password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10); // Generate a salt 
        const hashedPassword = await bcrypt.hash(this.password, salt); // Hash the password
        this.password = hashedPassword; // Replace the plain text password with the hashed password
        next(); // Continue with the save operation
    } catch (error) {
        return next(error); 
    }
});

// Compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
    try {
        return await bcrypt.compare(enteredPassword, this.password); // Compare the entered password with the stored hashed password
    } catch (error) {
        throw new Error(error); // <- Need to add a way to handle the error
    }
};

const User = mongoose.model('User', userSchema);
export default User;