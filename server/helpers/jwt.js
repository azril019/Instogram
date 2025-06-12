require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1h",
  });
};
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
module.exports = { signToken, verifyToken };
