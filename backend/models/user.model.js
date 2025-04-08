import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from 'crypto'

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
    portion: {
        type: String
    },
    dislikes: [{
        type: String
    }],
    cuisines: [{
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
    savedRecipes: [{
      type: String, // Reference to Recipe model
    }],

    savedGrocery: [{
        foodId: { type: String, required: true },
        quantity: {type: Number, default: 1, min: 0 }
    }],

    savedPantry: [{
        foodId: { type: String, required: true },
        quantity: {type: Number, default: 1, min: 0 }
    }],

    isVerified: {
        type: Boolean,
        required: true,
        default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    passwordResetToken: String,
    passwordResetExpires: Date,

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
        return resizeBy.status(400).json({ message: "Invalid credentials"}); // <- Need to add a way to handle the error
    }
};

// ADD/VERIFY Method to Generate Email Verification Token
userSchema.methods.getEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Hash the token before saving it to the database
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    // Set token expiration time (e.g., 15 minutes)
    this.emailVerificationExpires = Date.now() + 15 * 60 * 1000;

    // Return the UNHASHED token (this goes in the email link)
    return verificationToken;
};

userSchema.methods.getPasswordResetToken = function() {
    const resetCode = Math.floor(10000 + Math.random() * 90000).toString();

    // Hashes the token before saving
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetCode)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetCode;
}

const User = mongoose.model('User', userSchema);
export default User;