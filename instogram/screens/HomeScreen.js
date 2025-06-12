import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Text,
  RefreshControl,
} from "react-native";
import Card from "../components/Card";

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
      }
      createdAt
      updatedAt
      author {
        username
      }
    }
  }
`;
export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { loading, error, data, refetch } = useQuery(GET_POSTS);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error("Error refetching data:", err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );

  return (
    <>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#0000ff"]}
          />
        }
      >
        <View style={styles.container}>
          {data?.posts.map((post, index) => (
            <Card key={index} post={post} />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
