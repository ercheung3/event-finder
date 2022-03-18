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
  const user = await User.findById(req.session.userId);
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
        user: user,
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
  if (req.params.id.length > 15) {
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
  } else {
    try {
      const eventId = req.params.id;
      const thisEvent = `https://app.ticketmaster.com/discovery/v2/events/${req.params.id}.json?apikey=${process.env.API_KEY}`
      //check if post has been liked by user
      const user = await User.findById(req.session.userId);
      let newLike = {}
        await axios({
          method: "get",
          url: thisEvent,
          async: true,
          dataType: "json",
        }).then ((apires) => {
          
         newLike = {
            name: `${apires.data.name}`,
            url: `${apires.data.url}`,
            venue: `${apires.data._embedded.venues[0].name}`,
            date: `${apires.data.dates.start.localDate}`,
            img: `${apires.data.images[0].url}`,
          }
          console.log(newLike)
        });
        
        await user.updateOne({ $push: { likes: newLike } });
    } catch (err) {
      console.log(err);
    }
  }
  res.redirect(`/events/${req.params.id}`);
  //Add alert for adding like
});

module.exports = router;
