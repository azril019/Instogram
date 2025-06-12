const { ObjectId } = require("mongodb");
const PostsModel = require("../models/PostsModel");
const redis = require("../config/redisConnection");

const postTypeDefs = `#graphql
type Posts {
    _id: ID
    content: String!
    tags: [String]
    imgUrl: String
    authorId: String
    comments: [Comment]
    likes: [Like]
    createdAt: String
    updatedAt: String
    author: User
}

type Comment {
    content: String!
    username: String!
    createdAt: String
    updatedAt: String
}

type Like {
    username: String!
    createdAt: String
    updatedAt: String
}

type Query {
    posts: [Posts]
    getPostById(_id: ID): [Posts]
    getPostByAuthorId: [Posts]
}
type Mutation {
    addPost(content: String, tags: [String], imgUrl: String): String
    addComment(postId: ID, content: String): String
    addLike( postId: ID): String
}
`;

const postResolvers = {
  Query: {
    posts: async (_, __, { auth }) => {
      await auth();
      const bookRedis = JSON.parse(await redis.get("posts"));
      if (bookRedis) {
        return bookRedis;
      }
      const posts = await PostsModel.getLatestPost();
      redis.set("posts", JSON.stringify(posts));
      return posts;
    },
    getPostById: async (_, { _id }, { auth }) => {
      await auth();
      const post = await PostsModel.getPostById(_id);
      if (!post) {
        throw new Error("Post not found");
      }
      return post;
    },
    getPostByAuthorId: async (_, __, { auth }) => {
      const user = await auth();
      const posts = await PostsModel.getPostByAuthorId(user._id);
      if (!posts || posts.length === 0) {
        throw new Error("Posts not found");
      }
      return posts;
    },
  },
  Mutation: {
    addPost: async (_, { content, tags, imgUrl }, { auth }) => {
      const user = await auth();
      let newPost = { content, tags, imgUrl, authorId: user._id };
      const result = await PostsModel.AddPost(newPost);
      newPost._id = result.insertedId;
      redis.del("posts");
      return "Success";
    },
    addComment: async (_, { postId, content }, { auth }) => {
      const user = await auth();
      const post = await PostsModel.collection().findOne({
        _id: new ObjectId(postId),
      });

      if (!post) {
        throw new Error("Post not found");
      }
      if (!content) {
        throw new Error("Comment content is required");
      }
      await PostsModel.AddComment(postId, content, user.username);
      redis.del("posts");
      return "Success";
    },
    addLike: async (_, { postId }, { auth }) => {
      const user = await auth();
      const post = await PostsModel.collection().findOne({
        _id: new ObjectId(postId),
      });
      if (!post) {
        throw new Error("Post not found");
      }
      await PostsModel.AddLike(postId, user.username);
      redis.del("posts");
      return "Success";
    },
  },
};

module.exports = { postTypeDefs, postResolvers };
