import { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { gql, useMutation } from "@apollo/client";
import { saveSecure } from "../helpers/secureStore";
import { AuthContext } from "../contexts/AuthContext";

const LOGIN = gql`
  mutation Login($username: String, $password: String) {
    login(username: $username, password: $password) {
      accessToken
      userId
    }
  }
`;

export default function LoginScreen() {
  const { navigate } = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const { setIsSignedIn } = useContext(AuthContext);
  const [doLogin, { loading }] = useMutation(LOGIN);

  const handleLogin = async () => {
    try {
      const result = await doLogin({
        variables: {
          username,
          password,
        },
      });

      const token = result.data?.login.accessToken;
      const userId = result.data?.login.userId;
      await saveSecure("token", token);
      await saveSecure("userId", userId);
      Alert.alert("Login Berhasil");
      setIsSignedIn(true);
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Image source={require("../assets/icon.png")} style={styles.logo} />
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secure}
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Icon
            name={secure ? "eye-off" : "eye"}
            size={22}
            color="#aaa"
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          navigate("Register");
        }}
        style={styles.outlineButton}
      >
        <Text style={styles.outlineButtonText}>Buat Akun Baru</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    marginTop: -50,
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: "contain",
  },
  input: {
    width: "100%",
    height: 44,
    backgroundColor: "#fafafa",
    borderColor: "#dbdbdb",
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderColor: "#dbdbdb",
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#000",
  },
  eyeIcon: {
    paddingHorizontal: 8,
  },
  button: {
    width: "100%",
    height: 44,
    backgroundColor: "#3897f0",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  outlineButton: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    height: 44,
    borderColor: "#3897f0",
    borderWidth: 2,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  outlineButtonText: {
    color: "#3897f0",
    fontWeight: "bold",
    fontSize: 16,
  },
});
