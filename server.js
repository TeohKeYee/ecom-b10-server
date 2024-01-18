const express = require("express");
//import express from 'express'
const app = express();
require("dotenv").config();
const { PORT } = process.env;
const connectDB = require("./connection");
const cors = require("cors");

connectDB();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/users", require("./controllers/users"));
app.use("/products", require("./controllers/products"));
app.use("/cart", require("./controllers/carts"));
app.use("/orders", require("./controllers/orders"));
app.listen(PORT, console.log("App is running on PORT: " + PORT));
