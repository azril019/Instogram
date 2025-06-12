import { NavigationContainer } from "@react-navigation/native";
import StackNav from "./navigators/StackNavigation";
import { ApolloProvider } from "@apollo/client";
import client from "./config/apollo";
import AuthProvider from "./contexts/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <ApolloProvider client={client}>
        <NavigationContainer>
          <StackNav />
        </NavigationContainer>
      </ApolloProvider>
    </AuthProvider>
  );
}
