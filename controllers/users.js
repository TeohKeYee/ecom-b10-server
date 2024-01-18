const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { SECRET_KEY } = process.env;

router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email, username });
        if (user) {
            return res.json({ msg: "User already exist", status: 400 });
        }

        let salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(password, salt);
        let newUser = new User({
            ...req.body,
            password: hashedPassword,
        });
        newUser.save();
        return res.json({ msg: "Registered Successfully", user: newUser });
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        let { username, password } = req.body;

        let user = await User.findOne({ username });
        if (!user) return res.json({ msg: "Invalid credentials", status: 400 });

        let isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) return res.json({ msg: "Invalid credentials", status: 400 });

        user = user.toObject();
        delete user.password;

        let token = jwt.sign({ data: user }, SECRET_KEY, {
            expiresIn: "24h",
        });

        return res.json({ token, user, msg: "Login successfully" });
    } catch (e) {
        return res.status(400).json({ error: e.message, msg: "From catch" });
    }
});

module.exports = router;
