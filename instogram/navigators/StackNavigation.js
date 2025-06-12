import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import TabNavigation from "./TabNavigation";
import PostDetailScreen from "../screens/PostDetailScreen";

const Stack = createNativeStackNavigator();

export default function StackNav() {
  const { isSignedIn } = useContext(AuthContext);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTintColor: "#000",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      {isSignedIn ? (
        <>
          <Stack.Screen
            name="Home"
            component={TabNavigation}
            options={{ title: "Home", headerShown: false }}
          />
          <Stack.Screen
            name="PostDetail"
            component={PostDetailScreen}
            options={{ title: "Post Detail", headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Login", headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Register", headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
