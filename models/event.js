const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

let fullDate = `${month}-${day}-${year}`;

const eventSchema = new Schema(
  {
    name: {
      type: String,
      // unique: true,
      //required: true,
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
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    organization: {
      type: String,
    },
    tag: {
      type: String,
      enum: [
        "",
        "Music",
        "Community Event",
        "Outdoor Recreation",
        "Health/Fitness",
        "Arts & Theatre",
        "Sports",
      ],
    },
    location: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);
// stretch goal - location nearest zip
// stretch goal - age restriction
eventSchema.index({ name: "text", description: "text" });

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
