import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { gql, useQuery } from "@apollo/client";
import { Feather } from "@expo/vector-icons";

const GET_POST_DETAIL = gql`
  query GetPostById($id: ID) {
    getPostById(_id: $id) {
      _id
      content
      tags
      imgUrl
      authorId
      createdAt
      updatedAt
      author {
        username
      }
      comments {
        content
        username
        createdAt
        updatedAt
      }
      likes {
        username
        createdAt
        updatedAt
      }
    }
  }
`;

const PostDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = route.params;

  const { loading, error, data } = useQuery(GET_POST_DETAIL, {
    variables: { id: postId },
    fetchPolicy: "network-only",
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3897f0" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading post details</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const post = data?.getPostById[0];
  console.log("Post data:", post);

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(parseInt(dateString));
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Author section and image remain the same */}
        <View style={styles.authorContainer}>
          <Image
            source={{
              uri: `https://image.pollinations.ai/prompt/portrait%20photo%20of%20character%20marvel%20${encodeURIComponent(
                post.author?.username || "user"
              )}?width=500&height=500&nologo=true`,
            }}
            style={styles.authorAvatar}
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>
              {post.author?.username || "Unknown"}
            </Text>
            <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
          </View>
        </View>

        <Image source={{ uri: post.imgUrl }} style={styles.postImage} />

        <View style={styles.postContent}>
          {/* Display likes and comments count */}
          <View style={styles.countsContainer}>
            <Text style={styles.likesCount}>
              {post.likes?.length || 0}{" "}
              {post.likes?.length === 1 ? "like" : "likes"}
            </Text>
            <Text style={styles.commentsCount}>
              {post.comments?.length || 0}{" "}
              {post.comments?.length === 1 ? "comment" : "comments"}
            </Text>
          </View>

          {/* Display likes directly in the post content */}
          {post.likes && post.likes.length > 0 && (
            <View style={styles.likesContainer}>
              <Text style={styles.likesTitle}>Liked by</Text>
              {post.likes.map((like, index) => (
                <View key={index} style={styles.likeItem}>
                  <Image
                    source={{
                      uri: `https://image.pollinations.ai/prompt/portrait%20photo%20of%20character%20marvel%20${encodeURIComponent(
                        like.username
                      )}?width=500&height=500&nologo=true`,
                    }}
                    style={styles.likeAvatar}
                  />
                  <View style={styles.likeInfo}>
                    <Text style={styles.likeUsername}>{like.username}</Text>
                    <Text style={styles.likeTimestamp}>
                      {formatDate(like.createdAt)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>
              {post.author?.username || "Unknown"}
            </Text>
            <Text style={styles.captionText}>{post.content}</Text>
          </View>

          {/* Comments section remains the same */}
          {post.comments && post.comments.length > 0 && (
            <View style={styles.commentsContainer}>
              <Text style={styles.commentsTitle}>Comments</Text>
              {post.comments.map((comment, index) => (
                <View key={index} style={styles.commentItem}>
                  <Text style={styles.commentAuthor}>{comment.username}</Text>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                  <Text style={styles.commentTimestamp}>
                    {formatDate(comment.createdAt)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    height: 50,
    borderBottomWidth: 0.5,
    borderBottomColor: "#dbdbdb",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  goBackText: {
    color: "#3897f0",
    fontSize: 16,
    fontWeight: "bold",
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
  postImage: {
    width: "100%",
    height: 400,
    resizeMode: "cover",
  },
  postContent: {
    padding: 15,
  },
  countsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  actionIcon: {
    marginRight: 15,
  },
  likesCount: {
    fontWeight: "bold",
    marginRight: 15,
  },
  commentsCount: {
    fontWeight: "bold",
  },
  captionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  captionUsername: {
    fontWeight: "bold",
    marginRight: 5,
  },
  captionText: {
    flex: 1,
  },
  commentsContainer: {
    marginTop: 10,
  },
  commentsTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
  },
  commentItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  commentAuthor: {
    fontWeight: "bold",
    marginBottom: 3,
  },
  commentContent: {
    marginBottom: 5,
  },
  commentTimestamp: {
    fontSize: 12,
    color: "#666",
    alignSelf: "flex-end",
  },
  likesContainer: {
    marginTop: 5,
    marginBottom: 15,
  },
  likesTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
  },
  likeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  likeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  likeInfo: {
    flex: 1,
  },
  likeUsername: {
    fontWeight: "bold",
    fontSize: 14,
  },
  likeTimestamp: {
    fontSize: 12,
    color: "#666",
  },
});

export default PostDetailScreen;
