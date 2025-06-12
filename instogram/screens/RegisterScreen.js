import React, { useContext, useState } from "react";
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
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { gql, useMutation } from "@apollo/client";
import { AuthContext } from "../contexts/AuthContext";

const REGISTER = gql`
  mutation Register(
    $name: String
    $username: String
    $email: String
    $password: String
  ) {
    register(
      name: $name
      username: $username
      email: $email
      password: $password
    )
  }
`;

export default function RegisterScreen() {
  const { navigate } = useNavigation();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [doRegister, { loading }] = useMutation(REGISTER);
  const { setIsSignedIn } = useContext(AuthContext);

  const handleRegister = async () => {
    try {
      await doRegister({
        variables: {
          name,
          username,
          email,
          password,
        },
      });
      Alert.alert("Register Berhasil");
      navigate("Login");
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Image source={require("../assets/icon.png")} style={styles.logo} />

        <Text style={styles.headerText}>Buat Akun Baru</Text>

        <TextInput
          style={styles.input}
          placeholder="Nama Lengkap"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
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

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Daftar</Text>
        </TouchableOpacity>

        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => navigate("Login")}>
            <Text style={styles.loginLink}>Masuk</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 50,
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: "contain",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#262626",
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
    marginBottom: 20,
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
  loginLinkContainer: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    color: "#262626",
    fontSize: 14,
  },
  loginLink: {
    color: "#3897f0",
    fontWeight: "bold",
    fontSize: 14,
  },
});
