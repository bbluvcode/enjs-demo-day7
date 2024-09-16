const mongoose = require("mongoose");

const customerSchema = mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: String,
});

module.exports = mongoose.model("customers", customerSchema);
