require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const port = 5000;
const User = require("./models/User");

app.get("/", (req, res) => {
    res.status(200).json({message: "Bem vindo a nossa API!"});
});

app.post("/auth/register", async(req, res) => {
    const {name, email, password, confirmPassword} = req.body;

    if (!name || !email || !password || !confirmPassword) {
        return res.status(422).json({message: "Preencha todos os campos."});
    }

    if (password !== confirmPassword) {
        return res.status(422).json({message: "As senhas não confere."});
    }

    const userExists = await User.findOne({email: email});

    if(userExists) {
        return res.status(422).json({message: "Já existe uma conta com esse e-mail. Por favor, utilize outro e-mail!"});
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
        name,
        email,
        password: passwordHash
    });

    try {
        await user.save();
        res.status(201).json({message: "Usuário inserido no sistema com sucesso."});
    }
    catch (error) {
        res.status(500).json({message: "Erro no servidor. Tente novamente mais tarde!"});
    }
});

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