require('dotenv').config();
const express = require('express');
const session = require('express-session');
const ejs = require('ejs');
const app = express();

// Connect to db
const db = require("./config/db");

// Bring in models
const User = require("./models/User");

// app.use(express.json())

app.use(express.urlencoded({
    extended: true
}));

//Session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        resave: true,
    })
);

app.set("view engine", "ejs");
app.set("views", "./public/views");

//for parsing multipart/form-data
app.use(express.static("public"));

app.get("/", (req, res) => {
    let sess = req.session;

    if(sess.username) {
        res.render("homepage");
    } else {
        res.redirect("/login");
    }
})

app.get("/login", (req, res) => {
    let sess = req.session;
    if (sess.username) {
        res.redirect("/");
    } else {
        res.render("login", {
            msg: "",
            username: "",
            password: "",
        });
    }
})

app.post("/login", (req, res) => { 
    let sess = req.session;
    let data = req.body;
    User.findOne({username: data.username}, (err, user) => {
        if(err) {
            res.render("login", {
                msg: "Some unknown error has occured!",
                username: "",
                password: ""
            });
        }

        if(user) {
            if(user.password == data.password) {
                sess.username = data.username;
                res.redirect("/");
            } else {
                res.render("login", {
                    msg: "Password Incorrect",
                    username: "",
                    password: ""
                });
            }
        } else {
            res.render("login", {
                msg: "User not found",
                username: data.username,
                password: ""
            });
        }
    })
})

app.get("/signup", (req, res) => {
    let sess = req.session;
    if (sess.username) {
        res.redirect("/");
    } else {
            res.render("signup", {
                email: "",
                msg: "",
                username: "",
                name: "",
                password: "",
                contact: "",
            });
    }
})

app.post("/signup", (req, res) => {
    let sess = req.session;
    let data = req.body;
    User.findOne({email: data.email}, (err, user) => {
        if(err) {
            // res.render("login", {
            //     msg: "User not found",
            //     id: data.username,
            //     pas: ""
            // });
            res.render("signup", {
                username: data.username,
                email: data.email,
                msg: "Some error occured. Try Again.",
                name: data.name,
                password: data.password,
                contact: data.contact
            })
        }

        if (!user){
            // let newUser = new User({
            //     username: data.username,
            //     email: data.email,
            //     name: data.name,
            //     password: data.password,
            //     contact: data.contact
            // })

            // newUser.save((err, u) => {
            //     if(err) {

            //     } else {
            //         res.redirect("/")
            //     }
            // })

            User.create(req.body, function(err, user){
                if(err){
                    console.log('error in creating user while signing up'); 
                    res.render("signup", {
                        username: data.username,
                        email: data.email,
                        msg: err.message,
                        name: data.name,
                        password: data.password,
                        contact: data.contact
                    })
                } else {
                    sess.username = data.username;
                    res.redirect('/');
                }
            })
        }else{
            res.render("signup", {
                username: data.username,
                email: data.email,
                msg: "User already exists with that email",
                name: data.name,
                password: data.password,
                contact: data.contact
            })
        }
    })
})

// Log out
app.get("/logout", function (req, res) {
    var sess = req.session;
    if (sess.username) {
      req.session.destroy();
    }
    res.redirect("/login");
  });

app.listen(3000, () => {
    console.log("Started on port 3000");
})