var express = require("express");
var router = express.Router();
var passport= require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

//===========================
//// AUTH ROUTES
//===========================

//shows register form
router.get("/register", function(req, res) {
   res.render("register",{page:"register"}); 
});

//handles signup form
router.post("/register", function(req, res) {
   var newUser = new User({
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
      
   });
   User.register(newUser, req.body.password, function(err,user){
      if(err){
         /*can also do 
         req.flash("error", err.message);
         res.redirect("/register");
         */
         return res.render("register", {"error": err.message});
      }
      passport.authenticate("local")(req,res,function(){
          req.flash("success", "Welcome to YelpCamp "+ user.username);
         res.redirect("/campgrounds");
      });
   });
});


//==================
//SHOWS LOGIN FORM
//==================

//shows login page
router.get("/login", function(req, res) {
    res.render("login", {page:"login"});
});
//handles login logic
/*router.post("/login", passport.authenticate("local",
   {
      successRedirect: "/campgrounds",
      failureRedirect: "/login"
   }), function(req, res) {
});*/

//handling login logic
router.post('/login', function(req, res, next) {
 passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/campgrounds';
      delete req.session.redirectTo;
      res.redirect(redirectTo);
    });
 })(req, res, next);
});


//logs the user out
router.get("/logout", function(req, res) {
   
   req.logout();
   //flash("like a tag", "message for that tag")
   req.flash("success", "Successfully logged out.");
   res.redirect("/campgrounds"); 
});

//===================
//USERS PROFILE//
//====================
router.get("/users/:id", function(req, res) {
   var sameUser = false;
   User.findById(req.params.id, function(err,foundUser){
      if(err ||!foundUser){
         req.flash("error", "Something went wrong");
         return req.redirect("/");
      }
      Campground.find().where("author.id").equals(foundUser._id).exec(function(err,campgrounds) {
         if(err) {
            req.flash("error", "Something went wrong");
            return req.redirect("/");
         }
         if(req.user && req.user.id === req.params.id){
            sameUser = true;
         }
         res.render("users/show",{user:foundUser,campgrounds: campgrounds,sameUser: sameUser});
      });
   });
});
//    edit user route ///////
router.get("/users/:id/edit", function(req, res) {
   User.findById(req.params.id,function(err, foundUser){
      if(err || !foundUser) {
         req.flash("error", "Something went wrong");
         return req.redirect("/");
      }
      res.render("users/edit",{user:foundUser});   
   });
    
});

router.put("/users/:id", function(req, res) {
   User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
      if(err || !updatedUser) {
         req.flash("error", "Something went wrong");
         return req.redirect("/");
      }
      return res.redirect("/users/" + req.params.id);
   });
});


module.exports = router;