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

app.get("/user/:id", checkToken, async(req, res) => {
    const id = req.params.id;

    const user = await User.findById(id, '-password');

    if(!user) {
        return res.status(404).json({message: "Usuário não encontrado."});
    }

    res.status(200).json({user});
});

function checkToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) {
        return res.status(401).json({message: "Acesso negado."});
    }

    try {
        const secret = process.env.SECRET;
        jwt.verify(token, secret);
        next();
    }
    catch (error) {
        res.status(400).json({message: "Token inválido!"});
    }
}

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
        password: passwordHash,
    });

    try {
        await user.save();
        res.status(201).json({message: "Usuário inserido no sistema com sucesso."});
    }
    catch (error) {
        res.status(500).json({message: "Erro no servidor. Tente novamente mais tarde!"});
    }
});

app.post("/auth/login", async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(422).json({message: "Preencha todos os campos."});
    }

    const user = await User.findOne({email: email});

    if(!user) {
        return res.status(404).json({message: "Usuário não encontrado."});
    }

    const userPassword = user.password;
    const checkPassword = await bcrypt.compare(password, userPassword);

    if(!checkPassword) {
        return res.status(422).json({message: "Senha inválida!"});
    }

    try {
        const secret = process.env.SECRET;
        const token = jwt.sign({
            id: user._id
        }, secret);

        res.status(200).json({message: "Autenticação realizada com sucesso!", token: token});
    }
    catch (error) {
        res.status(500).json({message: "Erro no servidor. Tente novamente mais tarde!"});
    }
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