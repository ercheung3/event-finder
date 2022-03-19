const User = require("../models/user");
const Event = require("../models/event");
const axios = require("axios");
require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

// INDEX: GET
// /users
// Gives a page displaying all the users
router.get("/login", (req, res) => {
  const currId = req.session.userId;
  res.render("user/login.ejs", {
    currId: currId,
  });
});

router.post("/login", async (req, res) => {
  try {
    // Grab the user from the database with the username from the form
    const possibleUser = await User.findOne({ username: req.body.username });
    if (possibleUser) {
      // There is a user with this username!
      // Compare the password from the form with the database password
      if (bcrypt.compareSync(req.body.password, possibleUser.password)) {
        // It's a match! Successful login!
        req.session.isLoggedIn = true;
        req.session.userId = possibleUser._id;
        res.redirect("/users");
      } else {
        res.redirect("/users/login");
      }
    } else {
      // Let them try again?
      res.redirect("/users/login");
    }
  } catch (err) {
    console.log(err);
    res.send(500);
  }
});
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

router.get("/", async (req, res) => {
  const querySearch = {};

  let events = await Event.find();

  //Functionality for query search
  for (const key in req.query) {
    if (req.query[key] != "") {
      //Use index provided by mongodb to search in name and description
      if (key === "name") querySearch["$text"] = { $search: req.query[key] };
      else if (key === "date") {
        //Format the Date from HTML5 form to Date Schema
        //YYYY-MM-DDTHH:MM:SS.000Z
        let formatDate = req.query[key].toString() + ":00.000Z";
        const formattedDate = new Date(formatDate);
        //Checks for any date later.
        querySearch[key] = { $gte: formattedDate };
      } else querySearch[key] = req.query[key];
    }
    //if key is not empty
    //append key: req.query[key] to the object
  }

  //Will use querySearch if there is a query
  if (Object.keys(querySearch).length > 0)
    events = await Event.find(querySearch);

  const user = await User.findOne({ _id: req.session.userId });
  res.render("user/index.ejs", {
    user: user,
    event: events,
    apiLikes: user.likes,
    currId: req.session.userId,
  });
});

// NEW: GET
// /users/new
// Shows a form to create a new user
router.get("/new", (req, res) => {
  const currId = req.session.userId;
  res.render("user/new.ejs", {
    currId: currId,
  });
});

// SHOW: GET
// /users/:id
// Shows a page displaying one user
// router.get("/:id", async (req, res) => {
//   const user = await User.findById(req.params.id);
//   const events = await Event.find();
//   res.render("user/show.ejs", {
//     user: user,
//     event: events
//   });
// });

// CREATE: POST
// /users
// Creates an actual user, then...?
router.post("/", async (req, res) => {
  // req.body.password needs to be HASHED
  const hashedPassword = bcrypt.hashSync(
    req.body.password,
    bcrypt.genSaltSync(10)
  );
  req.body.displayname = req.body.username;
  req.body.password = hashedPassword;
  const newUser = await User.create(req.body);
  res.redirect("/users/login");
});

// EDIT: GET
// /users/:id/edit
// SHOW THE FORM TO EDIT A USER
router.get("/:displayname/edit", async (req, res) => {
  try {
    const user = await User.findOne({ displayname: req.params.displayname });
    //Type issue correction with toString()
    if (req.session.userId.toString() === user._id.toString()) {
      const currId = req.session.userId;
      res.render("user/edit.ejs", {
        user: user,
        currId: currId,
      });
    } else {
      throw new Error("YOU'RE NOT THAT USER!");
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// UPDATE: PUT
// /users/:id
// UPDATE THE USER WITH THE SPECIFIC ID
router.put("/:displayname", async (req, res) => {
  try {
    //await User.findByIdAndUpdate(req.params.id, req.body);
    await User.findOneAndUpdate(
      { displayname: req.params.displayname },
      req.body
    );
    res.redirect(`/users`);
  } catch (err) {
    res.sendStatus(500);
  }
});
// DELETE: DELETE
// /users/:id
// DELETE THE USER WITH THE SPECIFIC ID
/*
router.delete("/:id", async (req, res) => {
  try {
    //await User.findByIdAndDelete(req.params.id);
    await User.deleteMany({ name: ($exists = true) });
    res.redirect("/users");
  } catch (err) {
    res.sendStatus(500);
  }
});
*/

router.delete("/:displayname", async (req, res) => {
  try {
    await User.findOneAndDelete({ displayname: req.params.displayname });
    res.redirect("/users");
  } catch (err) {
    res.sendStatus(500);
  }
});

module.exports = router;
