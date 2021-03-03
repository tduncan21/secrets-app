require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/users", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home");
});

app.route("/login")
    .get((req, res) => {
        res.render("login");
    })

    .post((req, res) => {
        const email = req.body.username;
        const password = req.body.password;

        User.findOne({email: email}, (err, results) => {
            if(!err) {
                if(results) {
                    if(results.password === password){
                        res.render("secrets");
                    }
                }
            } else {
                res.send("User not found! " + err);
            }
        })
    });

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })

    .post((req, res) => {
        const email = req.body.username;
        const password = req.body.password;

        const newUser = new User({
            email: email,
            password: password
        });

        newUser.save((err) => {
            if(!err) {
                res.render("secrets");
            } else {
                res.send(err);
            }
        })
    });


app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running");
});
