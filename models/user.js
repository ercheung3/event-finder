const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, unique: true, required: true, minlength: 2 },
    password: { type: String, required: true },
    displayname: { type: String, unique: true },
    firstname: { type: String },
    lastname: { type: String },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
