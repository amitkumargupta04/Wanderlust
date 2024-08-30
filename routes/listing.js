const express = require("express");
const router = express.Router({mergeParams: true});
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync.js") //Backend se kuch error na jaye
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../joi/schema.js");
const {isLoggedIn} = require("../middleware.js");

const validateListing = (req, res, next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};

//Index Route means show all data page 
router.get("/listing", wrapAsync(async(req, res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));
//new listing creates
router.get("/listing/new", isLoggedIn, (req, res) =>{
    res.render("listings/new.ejs");
});
//Show route all data by id
router.get("/listing/:id", wrapAsync(async(req, res) =>{
    let {id} = req.params;
    const listingShow = await Listing.findById(id).populate("reviews").populate("owner");
    if(!listingShow){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listing");
    }
    console.log(listingShow);
    res.render("listings/show.ejs", {listingShow});
}));
//submit new route after creating create route
router.post("/listing", isLoggedIn, validateListing, wrapAsync(async(req, res, next) =>{
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listing");
}));

//edite route
router.get("/listing/:id/edit", isLoggedIn, wrapAsync(async (req, res) =>{
    let {id} = req.params;
    const listingedit = await Listing.findById(id);
    if(!listingedit){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listing");
    }
    res.render("listings/edit.ejs", {listingedit});
}));

//after edite then update
router.put("/listing/:id", isLoggedIn, wrapAsync(async(req, res) =>{
    let{id} = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing});
    req.flash("success", "listing updated!");
    res.redirect("/listing");
}));

//Delete Route
router.delete("/listing/:id", isLoggedIn, wrapAsync(async(req, res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "listing deleted!");
    console.log(deletedListing);
    res.redirect("/listing");
}));

module.exports = router;