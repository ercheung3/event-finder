const Event = require("../models/event");
require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");
const isLoggedIn = require("../middleware/isLoggedIn");
const e = require("express");
const User = require("../models/user");
const auth = {
  header: {
    "x-rapidapi-key": process.env.API_KEY,
  },
};
// INDEX: GET
// /events
// Gives a page displaying all the events
router.get("/", async (req, res) => {
  const currId = req.session.userId;
  //console.log("HELLO: " + (await Event.listIndexes()));
  await Event.createIndexes({ name: "text", description: "text" });
  const eventTest = await Event.find({ $text: { $search: "party" } });
  eventTest.forEach((event) => {
    console.log(event.name);
  });
  //Event.dropIndex();
  const querySearch = {};
  //const events = await Event.find();
  let events = await Event.find();

  for (const key in req.query) {
    console.log(key, req.query[key]);
    if (req.query[key] != "") {
      if (key === "name") querySearch["$text"] = { $search: req.query[key] };
      else querySearch[key] = req.query[key];
    }
    //if key is not empty
    //append key: req.query[key] to the object
  }
  if (Object.keys(querySearch).length > 0)
    events = await Event.find(querySearch);

  //end date time
  let d = new Date();
  let endDate = Number(d.getMonth() + 3);
  if (endDate < 10) {
    endDate = `0${endDate}`;
  } else {
    endDate = endDate;
  }
  if (d.getDate() < 10) {
    var date1 = `0${d.getDate()}`;
  } else {
    var date1 = d.getDate();
  }
  const exactString = `${d.getFullYear()}-${endDate}-${date1}T18:00:00Z`;
  //endDateTime=${exactString}$
  const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?dmaId=362&size=100&apikey=${process.env.API_KEY}`;
  axios({
    method: "get",
    url: apiUrl,
    async: true,
    dataType: "json",
  }).then((apires) => {
    res.render("event/index.ejs", {
      results: apires.data._embedded.events,
      event: events,
      currId: currId,
    });
  });
});
// Demo that res.locals is the same as the object passed to render

router.get("/search", async (req, res) => {
  /*
  Search query: name: Graduation tag: Music
  
  req.query.name NOT EMPTY
  req.query.tag NOT EMPTY
  req.query.date EMPTY
  
  const querySearch = [];
  console.log(req.query.name);
  console.log("REQ NAME: " + req.query.name == false);
  if (req.query.name) querySearch.push({ name: req.query.name });
  //if(req.query.date) STRETCH FOR DATE SEARCH
  if (req.query.tag) querySearch.push({ tag: req.query.tag });
  if (req.query.location) querySearch.push({ location: req.query.location });

  let events = null;
  console.log(querySearch);
  if (querySearch.length == 0) {
    console.log("NO SEARCH");
    //ALL EVENTS
    events = await Event.find();
  } else {
    events = await Event.find({
      $and: querySearch,
    });
  }
*/
  console.log(req.query);
  const currId = req.session.userId;
  const events = await Event.find(req.query);
  res.render("event/search.ejs", {
    events: events,
    currId: currId,
  });
});

// NEW: GET
// /events/new
// Shows a form to create a new event
router.get("/new", isLoggedIn, (req, res) => {
  const currId = req.session.userId;
  res.render("event/new.ejs", {
    currId: currId,
  });
});

// SHOW: GET
// /events/:id
// Shows a page displaying one event
router.get("/:id", async (req, res) => {
  const currId = req.session.userId;
  const user = await User.findById(req.session.userId)
  if (req.params.id.length > 15) {
    const event = await Event.findById(req.params.id).populate("user");
    res.render("event/show.ejs", {
      event: event,
      currId: currId,
    });
  } else {
    const thisEvent = `https://app.ticketmaster.com/discovery/v2/events/${req.params.id}.json?apikey=${process.env.API_KEY}`;
    await axios({
      method: "get",
      url: thisEvent,
      async: true,
      dataType: "json",
    }).then((apires) => {
      
      res.render("event/show.ejs", {
        results: apires.data,
        currId: currId,
        user: user
      });
    });
  }
});

// CREATE: POST
// /events
// Creates an actual event, then...?
router.post("/", isLoggedIn, async (req, res) => {
  req.body.user = req.session.userId;
  const newevent = await Event.create(req.body);
  console.log(newevent);
  res.redirect("/events");
});

// EDIT: GET
// /events/:id/edit
// SHOW THE FORM TO EDIT A event
router.get("/:id/edit", isLoggedIn, async (req, res) => {
  try {
    const currId = req.session.userId;
    const event = await Event.findById(req.params.id);
    res.render("event/edit.ejs", {
      event: event,
      currId: currId,
    });
  } catch (err) {
    res.sendStatus(500);
  }
});

// UPDATE: PUT
// /events/:id
// UPDATE THE event WITH THE SPECIFIC ID
router.put("/:id", isLoggedIn, async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/events/${req.params.id}`);
  } catch (err) {
    res.sendStatus(500);
  }
});
// DELETE: DELETE
// /events/:id
// DELETE THE event WITH THE SPECIFIC ID
router.delete("/:id", isLoggedIn, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.redirect("/events");
  } catch (err) {
    res.sendStatus(500);
  }
});
//like: put
// /events/:id/like
// like post with specific id
router.put("/:id/like", async (req, res) => {
  if((req.params.id).length > 15){
  try {
    //get specified event
    const event = await Event.findById(req.params.id);
    //check if post has been liked by user
    if (!event.likes.includes(req.session.userId)) {
      await event.updateOne({ $push: { likes: req.session.userId } });
    } else {
      await event.updateOne({ $pull: { likes: req.session.userId } });
    }
  } catch (err) {
    console.log(err);
  }
  }else {
    try {
     
      const eventId = req.params.id
      //check if post has been liked by user
      const user = await User.findById(req.session.userId)
      if (!user.likes.includes(eventId)) {
        await user.updateOne({ $push: { likes: eventId } });
      } else {
        await user.updateOne({ $pull: { likes: eventId } });
      }
      console.log("I pushed api url into user likes")
    } catch (err) {
      console.log(err);
    }
  }
    res.redirect(`/events/${req.params.id}`);
    //Add alert for adding like
});

module.exports = router;
