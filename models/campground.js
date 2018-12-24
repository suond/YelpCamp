var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   location: String,
   lat: Number,
   lng: Number,
   price: String,
   createdAt: {type: Date, default: Date.now},
   comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        } ,
        username: String
        
    }
});

var Campground = mongoose.model("campground", campgroundSchema);
module.exports = Campground;