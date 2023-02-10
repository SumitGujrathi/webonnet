//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();
app.use(express.static("public"));
app.set("view engine", 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/secretDB",{useNewUrlParser: true});
// mongoose.set("useCreateIndex", true); 


// Schema's + Model

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ejs pages

app.get("https://sumitgujrathi.github.io/webonnet/", function(req, res){
    res.render("home");
});

app.get("/register", function(req, res){
    res.render("register");
});
app.get("/login", function(req, res){
    res.render("login");
});
// app.get("/secrets", function(req, res){
//     res.render("/secrets");
// });

//Post Authentication

app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    } else{
        res.redirect("/login");
    }
});

// Register

app.post("/register", function(req, res){
    User.register({username: req.body.username}, req.body.password, function(err, Result){
        if(err){
            console.log(err);
        } else{
            passport.authenticate("local") (req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
});

// Login

app.post("/login", function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err){
        if(err){
            console.log(err);
        } else{
            passport.authenticate("local") (req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
});

//LogOut

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/")
});

// At Last
app.listen(3000, function(){
    console.log("App Running");
});
