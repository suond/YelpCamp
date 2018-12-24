var express = require("express");
var router = express.Router();

var Campground = require("../models/campground");
//will automatically acquire the index.js file if nothing is specified in the folder
var middleware = require("../middleware/");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

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
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var price = req.body.price;
  var author = {
      id: req.user._id,
      username: req.user.username
  };
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng, price: price};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});

//edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
   
      Campground.findById(req.params.id, function(err, foundCampground){
             res.render("campgrounds/edit", {campground: req.campground});
      });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
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