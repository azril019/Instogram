import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { gql, useMutation } from "@apollo/client";
import * as ImagePicker from "expo-image-picker";

const ADD_POST = gql`
  mutation AddPost($content: String, $tags: [String], $imgUrl: String) {
    addPost(content: $content, tags: $tags, imgUrl: $imgUrl)
  }
`;

const AddPostScreen = ({ navigation }) => {
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [imgUrl, setImgUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [addPost, { loading }] = useMutation(ADD_POST);

  const handleTagChange = (text) => {
    if (text.endsWith(" ")) {
      let newTag = text.trim();

      if (newTag && !newTag.startsWith("#")) {
        newTag = "#" + newTag;
      }

      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    } else {
      setTagInput(text);
    }
  };

  const removeTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Content is required");
      return;
    }

    let finalTags = [...tags];
    if (tagInput.trim()) {
      let lastTag = tagInput.trim();

      if (!lastTag.startsWith("#")) {
        lastTag = "#" + lastTag;
      }

      finalTags.push(lastTag);
    }

    setIsLoading(true);

    try {
      await addPost({
        variables: {
          content: content.trim(),
          tags: finalTags,
          imgUrl: imgUrl,
        },
      });
      setContent("");
      setTagInput("");
      setTags([]);
      setImgUrl("");
      setIsLoading(false);
      Alert.alert("Success", "Post created successfully", [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("Profile", { refresh: true });
          },
        },
      ]);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", error.message || "Failed to create post");
    }
  };

  const clearImage = () => {
    setImgUrl("");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Post</Text>
      </View>

      <Text style={styles.label}>
        Content <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={styles.contentInput}
        multiline
        placeholder="What's on your mind?"
        value={content}
        onChangeText={setContent}
      />

      <Text style={styles.label}>Tags (space to add)</Text>
      <View style={styles.tagsContainer}>
        <View style={styles.tagPillsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tagPill}>
              <Text style={styles.tagPillText}>{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(index)}>
                <Text style={styles.tagPillRemove}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TextInput
            style={styles.tagInput}
            placeholder={tags.length > 0 ? "" : "Type #tag and press space"}
            value={tagInput}
            onChangeText={handleTagChange}
            blurOnSubmit={false}
          />
        </View>
      </View>

      <Text style={styles.label}>Image URL</Text>
      <TextInput
        style={styles.tagsInput}
        placeholder="Image URL"
        value={imgUrl}
        onChangeText={setImgUrl}
      />

      {imgUrl.trim() !== "" && (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: imgUrl }}
            style={styles.imagePreview}
            onError={() =>
              Alert.alert("Error", "Unable to load image from URL")
            }
          />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={clearImage}
          >
            <Text style={styles.removeImageText}>Remove Image</Text>
          </TouchableOpacity>
        </View>
      )}

      {(isLoading || loading) && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      )}

      <TouchableOpacity
        style={[
          styles.submitButton,
          !content.trim() || isLoading || loading ? styles.disabledButton : {},
        ]}
        onPress={handleSubmit}
        disabled={!content.trim() || isLoading || loading}
      >
        <Text style={styles.submitButtonText}>Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 6,
  },
  required: {
    color: "red",
  },
  contentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
  },
  tagsInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  imagePreviewContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageButton: {
    marginTop: 8,
    padding: 6,
  },
  removeImageText: {
    color: "red",
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#0095f6",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  disabledButton: {
    backgroundColor: "#b2dffc",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    marginTop: 20,
  },
  tagsContainer: {
    marginTop: 5,
  },
  tagPillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    minHeight: 50,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e1f5fe",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  tagPillText: {
    color: "#0277bd",
    marginRight: 5,
  },
  tagPillRemove: {
    color: "#0277bd",
    fontSize: 18,
    marginLeft: 2,
  },
  tagInput: {
    flex: 1,
    minWidth: 100,
    fontSize: 16,
    padding: 0,
    marginLeft: 5,
  },
});

export default AddPostScreen;
