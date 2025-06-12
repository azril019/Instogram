import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { gql, useMutation, useQuery } from "@apollo/client";

const GET_POSTS = gql`
  query Posts {
    posts {
      _id
      content
      tags
      imgUrl
      authorId
      comments {
        content
        username
        createdAt
      }
      likes {
        username
        createdAt
      }
      createdAt
      updatedAt
      author {
        username
      }
    }
  }
`;

const ADD_LIKE = gql`
  mutation AddLike($postId: ID) {
    addLike(postId: $postId)
  }
`;

const ADD_COMMENT = gql`
  mutation AddComment($postId: ID, $content: String) {
    addComment(postId: $postId, content: $content)
  }
`;

const GET_USER = gql`
  query Me {
    me {
      _id
      name
      username
      email
    }
  }
`;

const Card = ({ post }) => {
  const { data: userData } = useQuery(GET_USER);
  const currentUsername = userData?.me?.username;

  const isUserLiked = post.likes?.some(
    (like) => like.username === currentUsername
  );
  const likeCount = post.likes?.length || 0;

  const [doLike] = useMutation(ADD_LIKE, {
    refetchQueries: [{ query: GET_POSTS }],
  });

  const [addComment] = useMutation(ADD_COMMENT, {
    refetchQueries: [{ query: GET_POSTS }],
  });

  const [isLiked, setIsLiked] = useState(isUserLiked);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    setIsLiked(isUserLiked);
  }, [isUserLiked]);

  const handleLike = async () => {
    await doLike({
      variables: {
        postId: post._id,
      },
    });

    setIsLiked(!isLiked);
  };

  const handleAddComment = async () => {
    if (newComment) {
      try {
        await addComment({
          variables: {
            postId: post._id,
            content: newComment,
          },
        });
        setNewComment("");
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return "Unknown date";
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        if (!isNaN(parseInt(timestamp))) {
          const unixDate = new Date(parseInt(timestamp));
          if (!isNaN(unixDate.getTime())) {
            return unixDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            });
          }
        }
        return "Unknown date";
      }

      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
  };

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentText}>
        <Text style={styles.username}>{item.username}</Text> {item.content}
      </Text>
      <Text style={styles.commentTime}>{formatTimestamp(item.createdAt)}</Text>
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: `https://image.pollinations.ai/prompt/portrait%20photo%20of%20character%20marvel%20${encodeURIComponent(
                post.author.username
              )}?width=500&height=500&nologo=true`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{post.author.username}</Text>
        </View>
        <TouchableOpacity>
          <Feather name="more-horizontal" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <Image source={{ uri: post.imgUrl }} style={styles.postImage} />

      <View style={styles.actionButtons}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            <MaterialCommunityIcons
              name={isLiked ? "heart" : "heart-outline"}
              size={26}
              color={isLiked ? "#ED4956" : "#000"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setCommentsVisible(true)}
          >
            <Feather name="message-circle" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.likes}>{likeCount} likes</Text>

      <View style={styles.captionContainer}>
        <Text style={styles.caption}>
          <Text style={styles.username}>{post.author.username}</Text>{" "}
          {post.content}
        </Text>
      </View>

      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          <Text style={styles.tags}>{post.tags.join(" ")}</Text>
        </View>
      )}

      {post.comments && post.comments.length > 0 && (
        <View>
          <TouchableOpacity onPress={() => setCommentsVisible(true)}>
            <Text style={styles.viewComments}>
              View all {post.comments.length} comments
            </Text>
          </TouchableOpacity>
          <View style={styles.commentPreview}>
            <Text>
              <Text style={styles.username}>{post.comments[0].username}</Text>{" "}
              {post.comments[0].content}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.timestamp}>{formatTimestamp(post.createdAt)}</Text>

      <Modal
        animationType="slide"
        transparent={true}
        visible={commentsVisible}
        onRequestClose={() => setCommentsVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.halfModalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setCommentsVisible(false)}>
                  <Feather name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Comments</Text>
                <View style={{ width: 24 }} />
              </View>

              <FlatList
                data={post.comments}
                renderItem={renderCommentItem}
                keyExtractor={(item, index) => index.toString()}
                style={styles.commentsList}
              />

              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity
                  style={styles.postButton}
                  onPress={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Text
                    style={[
                      styles.postButtonText,
                      !newComment.trim() && styles.postButtonDisabled,
                    ]}
                  >
                    Post
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  username: {
    fontWeight: "bold",
  },
  postImage: {
    width: "100%",
    height: 375,
    resizeMode: "cover",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: "row",
  },
  actionButton: {
    marginRight: 16,
  },
  likes: {
    fontWeight: "bold",
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  captionContainer: {
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  caption: {
    lineHeight: 18,
  },
  tagsContainer: {
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  tags: {
    color: "#00376B",
  },
  viewComments: {
    color: "#8E8E8E",
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  commentPreview: {
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  timestamp: {
    color: "#8E8E8E",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  halfModalContainer: {
    height: "50%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EFEFEF",
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 12,
    color: "#8E8E8E",
    marginTop: 4,
  },
  commentInputContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    padding: 10,
    paddingTop: 10,
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    marginBottom: 20,
  },
  postButton: {
    marginLeft: 10,
    marginBottom: 20,
    padding: 8,
  },
  postButtonText: {
    color: "#0095F6",
    fontWeight: "bold",
    fontSize: 20,
  },
  postButtonDisabled: {
    color: "#0095F6",
    opacity: 0.5,
  },
});

export default Card;
