const { ObjectId } = require("mongodb");
const { database } = require("../config/mongodb");

class PostsModel {
  static collection() {
    return database.collection("posts");
  }
  static async AddPost(newPost) {
    const existingPost = await this.collection().findOne({
      content: newPost.content,
    });
    if (existingPost) {
      throw new Error("Post already exists");
    }
    newPost.createdAt = new Date();
    newPost.updatedAt = new Date();
    return await this.collection().insertOne(newPost);
  }

  static async getLatestPost() {
    const post = await this.collection()
      .aggregate([
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: { path: "$author" } },
      ])
      .toArray();

    return post;
  }

  static async getPostById(_id) {
    const post = await this.collection()
      .aggregate([
        {
          $match: {
            _id: new ObjectId(_id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: { path: "$author" } },
        { $unset: ["author.password", "author.email"] },
      ])
      .toArray();
    if (!post) {
      throw new Error("Post not found");
    }
    return post;
  }

  static async AddComment(postId, content, username) {
    await this.collection().updateOne(
      {
        _id: new ObjectId(postId),
      },
      {
        $push: {
          comments: {
            username: username,
            content: content,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      }
    );
  }

  static async AddLike(postId, username) {
    const post = await this.collection().findOne({
      _id: new ObjectId(postId),
    });
    const alreadyLiked =
      post.likes && post.likes.some((like) => like.username === username);
    if (alreadyLiked) {
      await this.collection().updateOne(
        {
          _id: new ObjectId(postId),
        },
        {
          $pull: {
            likes: {
              username: username,
            },
          },
        }
      );
      return;
    }
    await this.collection().updateOne(
      {
        _id: new ObjectId(postId),
      },
      {
        $push: {
          likes: {
            username: username,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      }
    );
  }

  static async getPostByAuthorId(authorId) {
    const post = await this.collection()
      .aggregate([
        {
          $match: {
            authorId: new ObjectId(authorId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: { path: "$author" } },
        { $unset: ["author.password", "author.email"] },
      ])
      .toArray();
    if (!post) {
      throw new Error("Post not found");
    }
    return post;
  }
}

module.exports = PostsModel;
