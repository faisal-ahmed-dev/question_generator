const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const DatabaseSchema = mongoose.Schema(
  {
    mobile: {
      type: String,
      unique: true,
      minLength: [10, `Minimum Length of Mobile Digit is 10 Characters`],
      maxLength: [11, `Maximum Length of Email is 11 Characters`],
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: [3, `Minimum Length of Email is 3 Characters`],
      maxLength: [32, `Maximum Length of Email is 32 Characters`],
      validate: {
        validator: function (value) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
        },
        message: "Email is not valid",
      },
    },
    password: {
      type: String,
      required: [true, "Password required"],
      minLength: [5, `Minimum Length of Password is 5 Characters`],
      validate: {
        validator: function (value) {
          return /[A-Z]/.test(value);
        },
        message: "Password must contain at least one uppercase letter",
      },
      set: (plainPass) => bcrypt.hashSync(plainPass, bcrypt.genSaltSync(10)),
    },
    name: {
      type: String,
      trim: true,
      minLength: [3, `Minimum Length of Name is 3 Characters`],
      maxLength: [32, `Maximum Length of Name is 32 Characters`],
    },
    address: {
      type: String,
    },
    gender: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    userType: {
      type: String,
      default: "user",
    },
    userStatus: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true, versionKey: false }
);

const UsersModel = mongoose.model("users", DatabaseSchema);

module.exports = UsersModel;
