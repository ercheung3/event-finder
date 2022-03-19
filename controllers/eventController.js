const Event = require("../models/event");
require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");
const isLoggedIn = require("../middleware/isLoggedIn");
const e = require("express");
const User = require("../models/user");
const req = require("express/lib/request");
const res = require("express/lib/response");
const auth = {
  header: {
    "x-rapidapi-key": process.env.API_KEY,
  },
};

let currId;
let user;
// async function checkId(){
// if (res.locals.userId){
//   currId = req.session.userId
//   user = await User.findById(req.session.userId)
// } else {
//   currId = null
//   user = null
// }
// }
// checkId();

// INDEX: GET
// /events
// Gives a page displaying all the events
router.get("/", async (req, res) => {
  if (res.locals.userId) {
    currId = req.session.userId;
    user = await User.findById(req.session.userId);
  } else {
    currId = null;
    user = null;
  }
  const querySearch = {};
  let apiSearch = "";
  let events = await Event.find({ date: { $gte: new Date() } });

  //Functionality for query search
  for (const key in req.query) {
    if (req.query[key] != "") {
      //Use index provided by mongodb to search in name and description
      if (key === "name") {
        querySearch["$text"] = { $search: req.query[key] };
        apiSearch += `&keyword=${req.query[key]}`;
      } else if (key === "date") {
        //Format the Date from HTML5 form to Date Schema
        //YYYY-MM-DDTHH:MM:SS.000Z
        //API Date Format
        //YYY-MM-DDTHH:MM:SSZ
        if (req.query[key] == "past") {
          let today = new Date();
          querySearch[key] = { $lte: today };
          today = today.toISOString().slice(0, -5) + "Z";
          apiSearch += `&endDateTime=${today}`;
        } else {
          let formatDate = req.query[key].toString() + ":00Z";
          const formattedDate = new Date(formatDate);
          //Checks for any date later.
          querySearch[key] = { $gte: formattedDate };
          apiSearch += `&startDateTime=${formatDate}`;
        }
      } else if (key === "tag") {
        querySearch[key] = req.query[key];
        apiSearch += `&classificationName=${req.query[key]}`;
        //Would add to apiSearch if we had more fields
      }
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
  //API CALL
  //&keyword=rocket&locale=*&startDateTime=2022-03-19T14:59:00Z
  const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?dmaId=362&size=100${apiSearch}&apikey=${process.env.API_KEY}`;
  await axios({
    method: "get",
    url: apiUrl,
    async: true,
    dataType: "json",
  }).then((apires) => {
    let wantedData = [];
    //Checks if there is events with totalElements
    //data._embedded.events will give an error if checked with no events
    if (apires.data.page.totalElements !== 0) {
      wantedData = apires.data._embedded.events;
    }
    res.render("event/index.ejs", {
      results: wantedData,
      event: events,
      currId: currId,
    });
  });
});

// About Page
// /events/about
// Renders about page for the group
router.get("/about", (req, res) => {
  const currId = req.session.isLoggedIn;
  res.render("event/about.ejs", {
    currId: currId,
  });
});

// NEW: GET
// /events/new
// Shows a form to create a new event
router.get("/new", isLoggedIn, (req, res) => {
  res.render("event/new.ejs", {
    currId: currId,
  });
});

// SHOW: GET
// /events/:id
// Shows a page displaying one event
router.get("/:id", async (req, res) => {
  if (res.locals.userId) {
    currId = req.session.userId;
    user = await User.findById(req.session.userId);
  } else {
    currId = null;
    user = null;
  }
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
router.post("/", async (req, res) => {
  try {
    req.body.user = req.session.userId;
    const newevent = await Event.create(req.body);
    res.redirect("/events");
  } catch (err) {
    res.redirect("/events/new");
  }
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
router.put("/:id", async (req, res) => {
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
    if (
      typeof user.likes !== "undefined" &&
      user.likes.filter((x) => x.id === `${req.params.id}`).length > 0
    ) {
      const itemLiked = user.likes.findIndex((x) => x.id === req.params.id);
      await user.updateOne({ $pull: { likes: user.likes[itemLiked] } });
    } else {
      try {
        const eventId = req.params.id;
        const thisEvent = `https://app.ticketmaster.com/discovery/v2/events/${req.params.id}.json?apikey=${process.env.API_KEY}`;
        //check if post has been liked by user

        let newLike = {};
        await axios({
          method: "get",
          url: thisEvent,
          async: true,
          dataType: "json",
        }).then((apires) => {
          let eventDate = new Date(apires.data.dates.start.localDate);
          if (apires.data.dates.start.dateTime)
            eventDate = new Date(apires.data.dates.start.dateTime);
          newLike = {
            id: `${req.params.id}`,
            name: `${apires.data.name}`,
            url: `${apires.data.url}`,
            venue: `${apires.data._embedded.venues[0].name}`,
            date: eventDate,
            img: `${apires.data.images[0].url}`,
          };
        });

        await user.updateOne({ $push: { likes: newLike } });
      } catch (err) {
        console.log(err);
      }
    }
  }
  res.redirect(`/events/${req.params.id}`);
  //Add alert for adding like
});

module.exports = router;
