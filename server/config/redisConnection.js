require("dotenv").config();
const Redis = require("ioredis");

const redis = new Redis({
  port: 17947,
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  db: 0,
});

module.exports = redis;
