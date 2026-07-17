const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

if(process.env.NODE_ENV != "production"){ // jab project production stage pe hoga tab env file config na ho so that humare valuable credentials share na ho
    require('dotenv').config();
};

const listingsRouter = require("./routes/listings.js")
const reviewsRouter = require("./routes/reviews.js")
const userRouter = require("./routes/user.js")

const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 *24 * 60 * 60 * 1000,
        maxAge: 7 *24 * 60 * 60 * 1000,
        httpOnly: true
    },
};


// app.get("/", (req, res) => {
//     res.send("root is working");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; //req.user stores the info of current user.. if user not logged in then it will be empty
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "demo-student"
//     });
//     let newUser = await User.register(fakeUser, "helloworldpassword");
//     res.send(newUser);
// });

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

//Listens to all request and run if all previous path doesn't work
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

app.use((err,req, res,next)=> {
    let {status = 500, message = "Something went wrong"} = err;
    res.status(status).render("err.ejs", {err});
})


app.listen(port, () => {
    console.log(`server is listening to port ${port}`);
});