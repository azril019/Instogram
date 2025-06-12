import { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { gql, useQuery, useApolloClient } from "@apollo/client";
import { deleteValueSecure } from "../helpers/secureStore";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const windowWidth = Dimensions.get("window").width;

const GET_USER = gql`
  query Me {
    me {
      _id
      name
      username
      email
      userFollowers {
        username
        name
      }
      userFollowing {
        username
        name
      }
    }
  }
`;

const GET_POSTS = gql`
  query GetPostByAuthorId {
    getPostByAuthorId {
      _id
      imgUrl
    }
  }
`;

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState("grid");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("followers");
  const [modalData, setModalData] = useState([]);
  const client = useApolloClient();
  const { setIsSignedIn } = useContext(AuthContext);
  const navigation = useNavigation();
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setActiveTab("grid");
      setModalVisible(false);
      setModalType("followers");
      setModalData([]);
    });
    return unsubscribe;
  }, [navigation]);

  const {
    loading: userLoading,
    error: userError,
    data: userData,
    refetch: refetchUserData,
  } = useQuery(GET_USER);

  const {
    loading: postsLoading,
    error: postsError,
    data: postsData,
    refetch: refetchPosts,
  } = useQuery(GET_POSTS, {
    errorPolicy: "all",
  });

  const handleLogout = async () => {
    try {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            await deleteValueSecure("token");
            await deleteValueSecure("userId");
            setIsSignedIn(false);
            await client.resetStore();
          },
        },
      ]);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={() => navigation.navigate("PostDetail", { postId: item._id })}
    >
      <Image source={{ uri: item.imgUrl }} style={styles.postImage} />
      {activeTab === "grid" && item._id % 7 === 0 && (
        <View style={styles.multipleOverlay}>
          <MaterialIcons name="filter-none" size={18} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );

  useFocusEffect(
    useCallback(() => {
      refetchUserData();
      refetchPosts();
      return () => {};
    }, [])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const params = navigation
        .getState()
        .routes.find((r) => r.name === "Profile")?.params;
      if (params?.refresh) {
        refetchUserData();
        refetchPosts();
        // Reset parameter refresh
        navigation.setParams({ refresh: undefined });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const showFollowersModal = () => {
    refetchUserData().then(() => {
      setModalType("followers");
      setModalData(userData?.me?.userFollowers || []);
      setModalVisible(true);
    });
  };

  const showFollowingModal = () => {
    refetchUserData().then(() => {
      setModalType("following");
      setModalData(userData?.me?.userFollowing || []);
      setModalVisible(true);
    });
  };

  if (userLoading || postsLoading) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color="#3897f0" />
      </View>
    );
  }

  if (userError) {
    console.error("User error:", userError);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.username}>Sesi Expired</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
              <Feather name="log-out" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.errorText}>Sesi login telah berakhir</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (postsError) {
    console.error("Posts error:", postsError);
  }

  const user = userData?.me || {};
  const posts =
    postsError || !postsData ? [] : postsData.getPostByAuthorId || [];
  const followers = user.userFollowers?.length || 0;
  const following = user.userFollowing?.length || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>{user.username || "Loading..."}</Text>
          <MaterialIcons
            name="verified"
            size={18}
            color="#3897f0"
            style={styles.verifiedBadge}
          />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <Feather name="log-out" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          <Image
            source={{
              uri: `https://image.pollinations.ai/prompt/portrait%20photo%20of%20character%20marvel%20${encodeURIComponent(
                user.name
              )}?width=500&height=500&nologo=true`,
            }}
            style={styles.avatar}
          />
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statItem}
              onPress={showFollowersModal}
            >
              <Text style={styles.statNumber}>{followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statItem}
              onPress={showFollowingModal}
            >
              <Text style={styles.statNumber}>{following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.name}>{user.name || "Name"}</Text>
          <Text style={styles.email}>{user.email || "Email"}</Text>
        </View>

        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item._id}
          numColumns={3}
          scrollEnabled={false}
          style={styles.postsGrid}
          ListEmptyComponent={
            <View style={styles.emptyPosts}>
              <Text style={styles.emptyPostsText}>No posts yet</Text>
            </View>
          }
        />
      </ScrollView>

      {/* Follow Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === "followers" ? "Followers" : "Following"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={modalData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.userItem}>
                  <Image
                    source={{
                      uri: `https://image.pollinations.ai/prompt/portrait%20photo%20of%20character%20marvel%20${encodeURIComponent(
                        item.name || item.username
                      )}?width=500&height=500&nologo=true`,
                    }}
                    style={styles.userAvatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userUsername}>@{item.username}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 44,
    borderBottomWidth: 0.5,
    borderBottomColor: "#dbdbdb",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
  },
  verifiedBadge: {
    marginLeft: 5,
  },
  headerRight: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 15,
  },
  profileInfo: {
    flexDirection: "row",
    padding: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
  },
  bioContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  name: {
    fontWeight: "bold",
    marginBottom: 3,
  },
  email: {
    marginBottom: 3,
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
  postsGrid: {
    width: "100%",
  },
  postContainer: {
    width: windowWidth / 3,
    height: windowWidth / 3,
    position: "relative",
  },
  postImage: {
    width: "100%",
    height: "100%",
    borderWidth: 0.5,
    borderColor: "white",
  },
  multipleOverlay: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  loading: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: "bold",
  },
  userUsername: {
    color: "#666",
  },
  emptyPosts: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyPostsText: {
    fontSize: 16,
    color: "#999",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#3897f0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ProfileScreen;
