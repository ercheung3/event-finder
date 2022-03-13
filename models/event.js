const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

let fullDate = `${day}.${month}.${year}.`;

const eventSchema = new Schema(
  {
    name: { type: String, unique: true, required: true, minlength: 2 },
    description: { type: String, required: true },
    image: { required: false },
    date: { type: Date, min: year - month - day },
    organization: { type: String },
    // stretch goal - location nearest zip
    // stretch goal - age restriction
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
