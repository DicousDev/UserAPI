require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = 5000;

app.get("/", (req, res) => {
    res.status(200).json({message: "Bem vindo a nossa API!"});
})

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@userapi.yg073.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)
.then(() => {
    app.listen(port, () => {
        console.log(`Running in ${port} 🚀`);
    });

    console.log("Conectou ao banco!");
})
.catch((error) => {
    console.log(error);
})