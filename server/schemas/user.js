const { ObjectId } = require("mongodb");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const UserModel = require("../models/UserModel");

const userTypeDefs = `#graphql
type User {
    _id: ID
    name: String
    username: String!
    email: String!
    password: String!
    userFollowers: [User]
    userFollowing: [User]
}

type Query {
    userByUsername(username: String): [User]
    userById(_id: ID): User
    me: User
}

type LoginResponse {
    accessToken: String,
    userId: ID
}

type Mutation {
    register(name: String, username: String, email: String, password: String): String
    login(username: String, password: String): LoginResponse
}
`;

const userResolvers = {
  Query: {
    userByUsername: async (_, { username }, { auth }) => {
      await auth();
      const users = await UserModel.SearchByUsername(username);
      return users;
    },
    userById: async (_, { _id }, { auth }) => {
      await auth();
      const user = await UserModel.findById(new ObjectId(_id));
      return user;
    },
    me: async (_, __, { auth }) => {
      const payload = await auth();
      const user = await UserModel.findById(new ObjectId(payload._id));
      return user;
    },
  },
  Mutation: {
    register: async (_, { name, username, email, password }) => {
      let newUser = { name, username, email, password };
      await UserModel.register(newUser);
      return "Registration successful";
    },
    login: async (_, { username, password }) => {
      if (!username || !password) {
        throw new Error("Username and password are required");
      }
      const user = await UserModel.findByUser(username);

      if (!user) {
        throw new Error("Invalid Username/Password");
      }
      const isValid = comparePassword(password, user.password);
      if (!isValid) {
        throw new Error("Invalid Username/Password");
      }
      const token = signToken({ _id: user._id });

      return { accessToken: token, userId: user._id };
    },
  },
};

module.exports = { userTypeDefs, userResolvers };
