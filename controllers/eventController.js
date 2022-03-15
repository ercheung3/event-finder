const Event = require("../models/event");
const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/isLoggedIn");

// INDEX: GET
// /events
// Gives a page displaying all the events
router.get("/", async (req, res) => {
  const events = await Event.find();
  // Demo that res.locals is the same as the object passed to render
  res.render("event/index.ejs", {
    event: events,
  });
});
// NEW: GET
// /events/new
// Shows a form to create a new event
router.get("/new", isLoggedIn, (req, res) => {
  res.render("event/new.ejs");
});

// SHOW: GET
// /events/:id
// Shows a page displaying one event
router.get("/:id", async (req, res) => {
  const event = await Event.findById(req.params.id).populate("user");
  console.log("SHOW EVENT: " + event);
  res.render("event/show.ejs", {
    event: event,
  });
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
    const event = await Event.findById(req.params.id);
    res.render("event/edit.ejs", {
      event: event,
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
router.put("/:id/like", async (res, req)=>{
  try{
    //get specified event
    const event = await Event.findById(req.params.id)
    //check if post has been liked by user
    if (!event.likes.includes(req.session.userId)) {
      await event.updateOne({ $push: { likes: req.session.userId}})
    } else {
      await event.updateOne({ $pull: { likes: req.session.userId}})
    }
  }catch (err){

  }
})

module.exports = router;
