require("dotenv").config();
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { userTypeDefs, userResolvers } = require("./schemas/user");
const { postTypeDefs, postResolvers } = require("./schemas/posts");
const { followTypeDefs, followResolvers } = require("./schemas/follow");
const { verifyToken } = require("./helpers/jwt");
const UserModel = require("./models/UserModel");
const { ObjectId } = require("mongodb");

const server = new ApolloServer({
  typeDefs: [userTypeDefs, postTypeDefs, followTypeDefs],
  resolvers: [userResolvers, postResolvers, followResolvers],
  introspection: true,
});

startStandaloneServer(server, {
  listen: { port: process.env.PORT || 3000 },
  context: ({ req }) => {
    return {
      auth: async () => {
        const authorization = req.headers.authorization;
        if (!authorization) {
          throw new Error("Please login first");
        }
        const [type, token] = authorization.split(" ");

        if (type !== "Bearer") {
          throw new Error("Invalid token");
        }
        const payload = verifyToken(token);

        if (!payload) {
          throw new Error("Invalid token");
        }
        const user = await UserModel.findById(new ObjectId(payload._id));

        if (!user) {
          throw new Error("User not found");
        }
        return user;
      },
    };
  },
}).then(({ url }) => {
  console.log(`🚀  Server ready at: ${url}`);
});
