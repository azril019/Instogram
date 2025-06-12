const { ObjectId } = require("mongodb");
const { database } = require("../config/mongodb");

class FollowModel {
  static collection() {
    return database.collection("follows");
  }

  static async followUser(followingId, followerId) {
    const followed = await this.collection().findOne({
      followerId: new ObjectId(followerId),
      followingId: new ObjectId(followingId),
    });

    if (followed) {
      await this.collection().deleteOne({
        followingId: new ObjectId(followingId),
        followerId: new ObjectId(followerId),
      });
      return;
    }

    const follow = {
      followingId: new ObjectId(followingId),
      followerId: new ObjectId(followerId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.collection().insertOne(follow);
  }
}

module.exports = FollowModel;
