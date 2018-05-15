var express = require("express");
//merges the params from the campgrounds into the comments route
var router = express.Router({mergeParams:true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
//will automatically acquire the index.js file if nothing is specified in the folder
var middleware = require("../middleware/");

//============================
//COMMENTSROUTES
//============================
///shows the form to add to the specified campground NEW
router.get("/new",middleware.isLoggedIn, function(req, res) {
   //finds the campgrounds using the param and renders the form for it
   Campground.findById(req.params.id,function(err, campground){
      if(err || !campground){
         req.flash("error", "Campground not found");
         res.redirect("/campgrounds");
      }else{
         res.render("comments/new",{campground: campground});
      }
   });
    
});


//creates a comment for a particular campground CREATE
router.post("/",middleware.isLoggedIn, function(req,res){
   //find campground to push the comment into
   Campground.findById(req.params.id, function(err, campground) {
      if(err) {
         console.log(err);
         res.redirect("/campgrounds");
      } else {
         Comment.create(req.body.comment, function(err,comment){
            if(err){
               req.flash("error", "Something went wrong, please try again");
               console.log(err);
            } else{
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               campground.comments.push(comment);
               campground.save();
               req.flash("success", "created a new comment");
               //"/campgrounds/:id"
               res.redirect("/campgrounds/" + campground._id);
            }
         });
      }
   });
});
//EDIT ROUTE FOR A COMMENT
router.get("/:comment_id/edit",middleware.checkCampgroundOwnership,middleware.checkCommentOwnership ,function(req,res){
   
   Campground.findById(req.params.id, function(err, campground) {
         if(err || !campground){
            req.flash('error', 'Cannot find that campground');
            return res.redirect("/campgrounds");
         } 
         //already have id for campground
      Comment.findById(req.params.comment_id,function(err, foundComment) {
         if(err || !foundComment){
             req.flash("error", "Can't find comment");
             res.redirect("/campgrounds");
         }else {
             //can pass in more than one params by simply separating them by commas
            res.render("comments/edit",{campground_id: req.params.id, comment:req.comment}); 
          }
      });
   });
   
   
});

//UPDATE ROUTE FOR COMMENT
router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){
   
   Campground.findById(req.params.id, function(err, campground) {
       if(err || !campground){
         req.flash("error", "Campground not found");    
         return  res.redirect("back");
       }
      Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updatedComment){
         if(err){
            res.redirect("back");
         } else {
            res.redirect("/campgrounds/"+ req.params.id);
         }
      });
   });
   
   
   
});

//DELETE ROUTE FOR COMMENT
router.delete("/:comment_id", middleware.checkCommentOwnership,function(req,res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
      if(err){
         res.redirect("back");
      }else {
         req.flash("success", "Comment deleted");
         res.redirect("/campgrounds/" + req.params.id);
      }
   });
});





module.exports = router;