var express = require("express");
var router = express.Router();

var Campground = require("../models/campground");
//will automatically acquire the index.js file if nothing is specified in the folder
var middleware = require("../middleware/");

//=========================
//RESTFUL ROUTES
//=========================


//INDEX, shows all campground
router.get("/", function(req, res){
   
   var noMatch = null;
   //checks if someone searches for a campground
   if(req.query.search){
      //used to parse and search the database with the query
      const regex = new RegExp(escapeRegex(req.query.search),'gi');
      Campground.find({name:regex}, function(error, allCampgrounds){
         if(error){
            console.log(error);
         } else {
            if(allCampgrounds.length <1 ){
               //if length < 1, no campgrounds were found and the noMatch variable has a value to display to the user
               //else the matched campgrounds will display
               noMatch = "No campgrounds match that query, please try again.";
            }
            res.render("campgrounds/index", {campgrounds: allCampgrounds, noMatch: noMatch});
         }
      });
   } else {
      ///the default page
      //{name used in ejs, object used on this page}
      Campground.find({}, function(error, dbcampgrounds){
         if(error){
            console.log(error);
         }  else{
            res.render("campgrounds/index", {campgrounds: dbcampgrounds, page: "campgrounds", noMatch: noMatch});
         }
      });
   }
});

//NEW, creates a new campgrounds
router.get("/new", middleware.isLoggedIn, function(req,res){
   res.render("campgrounds/new");
});

//SHOW:  shows more info about one campground
router.get("/:id", function(req, res) {
   //shows more information about the id item
   //this function finds the user and changes the comments from a reference id to the actual id
   //the exec gives you the campgrounds with the actual comment. slighty different from Campground.findById(req.params.id, function(){code here})
    Campground.findById(req.params.id).populate("comments").exec(function(error,foundCG){
       if(error || !foundCG){
          req.flash("error", "Can't find that campground");
          res.redirect("/campgrounds");
       }else {
          res.render("campgrounds/show", {campground: foundCG});
       }
    });
    
});
//CREATE: creates a campgrounds and adds to the database
router.post("/", middleware.isLoggedIn, function(req,res){
   
   //get data from form and add to array
   var name = req.body.name;
   var price = req.body.price;
   var image = req.body.image;
   var description = req.body.description;
   var author = {
     id: req.user._id,
     username: req.user.username
   };
   var newCampground = {name:name, price:price, image: image, description: description, author: author};
   
   //create a new campground and save to database
   Campground.create(newCampground, function(error, item){
      if(error){
         console.log(error);
      }else {
        //console.log(item);
         //redirect to the campground page
         res.redirect("/campgrounds");
      }
   });
   
   
});

//edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
   
      Campground.findById(req.params.id, function(err, foundCampground){
             res.render("campgrounds/edit", {campground: req.campground});
      });
});

//update campground route
router.put("/:id",middleware.checkCampgroundOwnership, function(req,res){
   //find and update
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err,updatedCampground){
      if(err){
         res.redirect("/campgrounds");
      } else {
         res.redirect("/campgrounds/"+req.params.id);
      }
   });
});

//destroy campground route
router.delete("/:id",middleware.checkCampgroundOwnership, function(req,res){
   //delete the campground with the 
   Campground.findByIdAndRemove(req.params.id, function(err){
      if (err){
         res.redirect("/campgrounds");
      } else {
         res.redirect("/campgrounds");
      }
   });
});

//expression used to parse query
function escapeRegex(text){
   return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


module.exports = router;