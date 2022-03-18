const express = require("express");
const methodOverride = require("method-override");
const session = require("express-session");
const User = require("./models/user");
const MongoDBStore = require("connect-mongodb-session")(session);
require("dotenv").config();
const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});
require("./db-utils/connect");
const eventController = require("./controllers/eventController");
const userController = require("./controllers/userController");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(require("./middleware/logger"));
const isLoggedIn = require("./middleware/isLoggedIn");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(async (req, res, next) => {
  // This will send info from session to templates
  res.locals.isLoggedIn = req.session.isLoggedIn;
  if (req.session.isLoggedIn) {
    const currentUser = await User.findById(req.session.userId);
    console.log(currentUser)
    //Global use variables across
    res.locals.username = currentUser.username;
    res.locals.displayname = currentUser.displayname;
    res.locals.userId = req.session.userId.toString();
  }
  next();
});
app.get("/", (req, res) => {
  res.redirect("/events");
});
app.use("/events", eventController);
app.use("/users", userController);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("app running");
});
