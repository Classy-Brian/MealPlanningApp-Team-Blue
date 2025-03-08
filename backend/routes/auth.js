import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from '../models/user.model.js'
import { loginUser } from "../controllers/user.controller.js"

const router = express.Router();

router.post("/register", async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        let user = await User.findOne({email});
        if (user) return res.status(400).json({msg: "User already exists"});

        user = new User({ firstName, lastName, email, password});
        await user.pre();
        await user.save();

        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"});
        
        res.json({ token, user: {_id: user._id, firstName, lastName, email}});
    }
    catch (err) {
        res.status(500).json({msg: "Server error"});
    }
});

router.post("/login", async(req, res) => {
    loginUser();
});

module.exports = router;

