const mongoose = require("mongoose");
require("dotenv").config();

const { DB_NAME , DB_HOST, DB_USER, DB_PASSWORD } = process.env;

const connect = async () => {
    try {
        // await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`);
        await mongoose.connect(`mongodb://${DB_USER}:{DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`)
        console.log("Connected to MongoDB");
    } catch (e) {
        console.error(`Error connecting to MongoDB: ${e.message}`);
    }
};

module.exports = connect;
