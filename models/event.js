const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

let fullDate = `${day}.${month}.${year}.`;

const eventSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      minlength: 2,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    date: {
      type: Date,
      min: year - month - day,
    },
    organization: {
      type: String,
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
// stretch goal - location nearest zip
// stretch goal - age restriction

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
