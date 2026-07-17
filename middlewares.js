const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const { reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()){
        //redirect Url save
        //req.originalUrl is the url where the request was trying to reach without logging in
        //passport login krte time session ko reset krdeta ha.. mtlb cookies delete
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create listing");
        return res.redirect("/login");
    };
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    };
    next();
};

//Middleware for listing validation
module.exports.validateListing = (req,res, next) => {
    let {error} = listingSchema.validate(req.body); //this function returns a object (result) jisme error ek property hoti ha
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

//Middleware for review validation
module.exports.validateReview = (req,res, next) => {
    let {error} = reviewSchema.validate(req.body); //this function returns a object (result) jisme error ek property hoti ha
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    };
    next();
};