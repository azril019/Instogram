import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { gql, useQuery, useMutation } from "@apollo/client";

const SEARCH_USERS = gql`
  query UserByUsername($username: String) {
    userByUsername(username: $username) {
      _id
      username
      name
    }
  }
`;

const GET_CURRENT_USER = gql`
  query Me {
    me {
      _id
      username
      userFollowing {
        _id
        username
      }
    }
  }
`;

const FOLLOW_USER = gql`
  mutation AddFollow($followingId: ID) {
    addFollow(followingId: $followingId)
  }
`;

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const { error, loading, data, refetch } = useQuery(SEARCH_USERS, {
    variables: { username: searchQuery },
    skip: !hasSearched,
  });

  const { data: currentUserData } = useQuery(GET_CURRENT_USER);

  const [addFollow, { loading: followLoading }] = useMutation(FOLLOW_USER, {
    refetchQueries: [{ query: GET_CURRENT_USER }],
  });

  useEffect(() => {
    if (data && data.userByUsername) {
      const userList = Array.isArray(data.userByUsername)
        ? data.userByUsername
        : [data.userByUsername];

      const currentUserId = currentUserData?.me?._id;

      const filteredUserList = userList.filter(
        (user) => user._id !== currentUserId
      );

      const followingIds =
        currentUserData?.me?.userFollowing?.map((user) => user._id) || [];

      setUsers(
        filteredUserList.map((user) => ({
          ...user,
          isFollowing: followingIds.includes(user._id),
        }))
      );
    }
  }, [data, currentUserData]);

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setUsers([]);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    refetch({ username: searchQuery });
  };

  const toggleFollow = async (userId) => {
    try {
      await addFollow({
        variables: { followingId: userId },
      });

      setUsers(
        users.map((user) =>
          user._id === userId
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );
    } catch (err) {
      console.error("Failed to follow/unfollow:", err);
      
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: `https://image.pollinations.ai/prompt/portrait%20photo%20of%20character%20marvel%20${encodeURIComponent(
                item.name
              )}?width=500&height=500&nologo=true`,
            }}
            style={styles.avatar}
          />
        </View>
        <View>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.name}>{item.name}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.followButton,
          item.isFollowing ? styles.followingButton : null,
        ]}
        onPress={() => toggleFollow(item._id)}
        disabled={followLoading}
      >
        <Text
          style={[
            styles.followButtonText,
            item.isFollowing ? styles.followingButtonText : null,
          ]}
        >
          {item.isFollowing ? "Following" : "Follow"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <AntDesign
            name="search1"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <AntDesign name="close" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: "red" }]}>
            Error: {error.message}
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#0095f6" />
      ) : (
        <>
          {hasSearched ? (
            users.length > 0 ? (
              <FlatList
                data={users}
                keyExtractor={(item) => item._id}
                renderItem={renderUserItem}
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            )
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Search for users to get started
              </Text>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: "#0095f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  searchButtonText: {
    color: "white",
    fontWeight: "600",
  },
  loader: {
    marginTop: 20,
  },
  listContainer: {
    paddingHorizontal: 12,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: "hidden",
    marginRight: 12,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  username: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    color: "#666",
  },
  followButton: {
    backgroundColor: "#0095f6",
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 6,
  },
  followingButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#dbdbdb",
  },
  followButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
  followingButtonText: {
    color: "black",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

export default SearchScreen;
