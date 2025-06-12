const { ObjectId } = require("mongodb");
const FollowModel = require("../models/FollowModel");

const followTypeDefs = `#graphql
type Follow {
    _id: ID
    followingId: ID
    followerId: ID
    createdAt: String
    updatedAt: String
}

type Mutation {
    addFollow(followingId: ID,): String
}
`;

const followResolvers = {
  Mutation: {
    addFollow: async (_, { followingId }, { auth }) => {
      const user = await auth();
      const followerId = user._id;
      await FollowModel.followUser(followingId, followerId);
      return "Follow successful";
    },
  },
};

module.exports = {
  followTypeDefs,
  followResolvers,
};
