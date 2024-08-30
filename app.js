const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocaltStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js");

main()
 .then(() =>{
    console.log("Connections SuccessFull!..")
 })
 .catch((err) =>{
    console.log(err);
 })
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderLust');

}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true})); //it is used for finding id of body
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//here using express session
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    Cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //for one weak
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }
};
app.get("/", (req, res) =>{
    res.send("Hey I'm root don't touch me")
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocaltStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) =>{ //middleware for popp msg when adding new listing
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// //demo user
// app.get("/demoUser", async(req, res) =>{
//     let fakeUser = new User({
//        email: "amit999@gmail.com",
//        username: "hey_amit2.0" 
//     });

//     let registerUser = await User.register(fakeUser, "amit123");
//     res.send(registerUser);
// })

app.use("/", listingRouter);
app.use("/", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) =>{
    next(new ExpressError(404, "Page not found!"));
})
app.use((err, req, res, next) =>{
    let {statusCode = 500, message = "Something went wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
    //res.status(statusCode).send(message);
})
// app.use((err, req, res, next) =>{ //it is used for try and catch
//     res.send("something went wrong!")
// })
app.listen(8080, () =>{
    console.log("app is listening at port 8080");
})