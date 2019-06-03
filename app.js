//initialize a group of variable

var express    = require("express"),
    app        = express(),
    session    = require("express-session"),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    //needs to come before passport
    flash      = require("connect-flash"),
    passport   = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    helmet = require("helmet"),
    MongoStore = require("connect-mongo")(session);
    //var seedDB = require("./seeds");
    //seedDB();
    
   //will create the db if it doesnt exist
   //backup if the environment url break
   var dburl = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
    mongoose.connect(dburl);
   
   
   
   //routes imports
   var commentRoutes = require("./routes/comments");
   var campgroundsRoutes = require("./routes/campgrounds");
   var indexRoutes = require("./routes/index");
    
//mongoose schema imports   
//var Comment = require("./models/comment");
//var Campground = require("./models/campground");
var User = require("./models/user");

// stuff to copy and paste into each app
//some config for convenience
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');

// PASSPORT CONFIGURATION
//saveUnitialized: false
//resave: false  both intial value before trying connect mongoose
app.use(session({
    secret: "Once again Rusty wins cutest dog!",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection,
                            //ttl day * hours * minutes * seconds,  the ttl units uses seconds
                            ttl : 2*60*60
    }) 
    
}));
app.use(helmet());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware that runs for all routes
//will pass in currentUser as a local variable for all routes
app.use(function(req,res,next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
   
});

app.get("/", function(req, res){
   res.render("landing");
});

//uses the express router 
app.use(indexRoutes);
//adds a prefix that will be added before each route in that particular file
//need to remove the prefix in the specified route as needed
// minimum string needed for a route is a "/"
app.use("/campgrounds",campgroundsRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("yelp camp has started"); 
});
