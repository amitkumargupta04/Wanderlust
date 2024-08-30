const express = require("express");
const router = express.Router({mergeParams: true});

const Listing = require("../models/listing");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js") //Backend se kuch error na jaye
const ExpressError = require("../utils/ExpressError.js")
const {reviewSchema} = require("../joi/schema.js");

const validateReview = (req, res, next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};

//Review route in every show page
router.post("/listing/:id/reviews", validateReview, wrapAsync(async (req, res) =>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "added a new review");
    res.redirect(`/listing/${listing._id}`);
}));

router.delete("/listing/:id/reviews/:reviewId", wrapAsync(async (req, res) =>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndUpdate(reviewId);
    req.flash("success", "review deleted!");
    res.redirect(`/listing/${id}`);
}));

module.exports = router;

