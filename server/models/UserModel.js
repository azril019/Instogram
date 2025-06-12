const { database } = require("../config/mongodb");
const { hashPassword } = require("../helpers/bcrypt");
class UserModel {
  static collection() {
    return database.collection("users");
  }

  static async register(newUser) {
    let existingUser = await this.collection().findOne({
      $or: [{ username: newUser.username }, { email: newUser.email }],
    });
    if (!newUser.name) {
      throw new Error("Name is required");
    }
    if (!newUser.email) {
      throw new Error("Email is required");
    }
    if (!newUser.email.includes("@") || !newUser.email.includes(".")) {
      throw new Error("Invalid email format");
    }
    if (existingUser) {
      throw new Error("Username or email already exists");
    }
    if (!newUser.password) {
      throw new Error("Password is required");
    }
    if (newUser.password.length < 5) {
      throw new Error("Password must be at least 5 characters");
    }
    newUser.password = hashPassword(newUser.password);
    return await this.collection().insertOne(newUser);
  }

  static async findByUser(username) {
    const user = await this.collection().findOne({ username });
    return user;
  }

  static async SearchByUsername(username) {
    const users = await this.collection()
      .find({ username: { $regex: username, $options: "i" } })
      .toArray();
    return users;
  }

  static async findById(_id) {
    try {
      const result = await this.collection()
        .aggregate([
          {
            $match: {
              _id,
            },
          },
          {
            $lookup: {
              from: "follows",
              localField: "_id",
              foreignField: "followingId",
              as: "followers",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "followers.followerId",
              foreignField: "_id",
              as: "userFollowers",
            },
          },
          {
            $lookup: {
              from: "follows",
              localField: "_id",
              foreignField: "followerId",
              as: "following",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "following.followingId",
              foreignField: "_id",
              as: "userFollowing",
            },
          },
          { $unset: ["password", "userFollowers.password"] },
        ])
        .toArray();
      return result[0];
    } catch (err) {
      throw err;
    }
  }
}

module.exports = UserModel;
