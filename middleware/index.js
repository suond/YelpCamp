//acquire campground
var Campground = require("../models/campground");
//acquire comment
var Comment = require("../models/comment");

//all middleware goes here
var middlewareObj = {};

//middleware used to check if the user is logged in and if the campground being accessed has the same id as the user
middlewareObj.checkCampgroundOwnership = function(req,res,next){
    

    //checks if logged in
    if(req.isAuthenticated()){
      Campground.findById(req.params.id, function(err, foundCampground) {
         //if foundCampground is null, !null = true, which dips into this if statement.  foundCampground is null since it couldn't find that campground in the database
         if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds/");
         } else {
            //checks if id matches the author of the campground
            if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
               //will send to the next task (the function calling this middleware)
               req.campground = foundCampground;
               next();
            }else {
               req.flash("error", "You don't have permission to do that!");
               res.redirect("/campgrounds/" + req.params.id);
            }
         }
      });
    } else {
      //sends user back to the previous page
      req.flash("error","You need to be logged in to do that");
      res.redirect("/login");
    }
    
    };

middlewareObj.checkCommentOwnership = function(req, res,next){
    //checks if logged in
   if(req.isAuthenticated()){
      Comment.findById(req.params.comment_id, function(err, foundComment) {
         if(err || !foundComment){
            req.flash("error", "Sorry, that comment does not exist");
            res.redirect("/campgrounds");
         } else {
            //checks if id matches the author of the comment
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
               //will send to the next task (the function calling this middleware)
               req.comment = foundComment;
               next();
            }else {
               req.flash("error", "You don't have permission to do that!");
               res.redirect("/campgrounds/" +  req.params.id);
            }
         }
      });
   } else {
      req.flash("error","You need to be logged in to do that");
      //sends user back to the previous page
      res.redirect("/login");
   }
    
};
//MIDDLEWARE USED IN AS A SECOND PARAM IN ROUTES TO SEE IF THE USER IS LOGGED IN OR NOT
middlewareObj.isLoggedIn = function (req,res,next){
   if(req.isAuthenticated()) {
       
      return next();
   }else {
      req.session.redirectTo = req.originalUrl;
      //not flashing right away, for next request
      req.flash("error", "You need to be logged in to do that");
      res.redirect("/login");
   }
};

module.exports = middlewareObj;