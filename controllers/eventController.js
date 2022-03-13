const event = require("../models/event");
const express = require("express");
const router = express.Router();
// INDEX: GET
// /events
// Gives a page displaying all the events
router.get("/", async (req, res) => {
  if (!req.session.visits) {
    req.session.visits = 1;
  } else {
    req.session.visits += 1;
  }
  const events = await event.find();
  // Demo that res.locals is the same as the object passed to render
  res.locals.visits = req.session.visits;
  res.locals.events = events;
  res.render("event/index.ejs");
});
// NEW: GET
// /events/new
// Shows a form to create a new event
router.get("/new", (req, res) => {
  res.render("event/new.ejs");
});

// SHOW: GET
// /events/:id
// Shows a page displaying one event
router.get("/:id", async (req, res) => {
  const event = await event.findById(req.params.id).populate("user");
  res.render("event/show.ejs", {
    event: event,
  });
});

// CREATE: POST
// /events
// Creates an actual event, then...?
router.post("/", async (req, res) => {
  req.body.user = req.session.userId;
  const newevent = await event.create(req.body);
  console.log(newevent);
  res.redirect("/events");
});

// EDIT: GET
// /events/:id/edit
// SHOW THE FORM TO EDIT A event
router.get("/:id/edit", async (req, res) => {
  try {
    const event = await event.findById(req.params.id);
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
router.put("/:id", async (req, res) => {
  try {
    await event.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/events/${req.params.id}`);
  } catch (err) {
    res.sendStatus(500);
  }
});
// DELETE: DELETE
// /events/:id
// DELETE THE event WITH THE SPECIFIC ID
router.delete("/:id", async (req, res) => {
  try {
    await event.findByIdAndDelete(req.params.id);
    res.redirect("/events");
  } catch (err) {
    res.sendStatus(500);
  }
});

module.exports = router;
