import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getValueSecure } from "../helpers/secureStore";
const httpLink = createHttpLink({
  uri: "https://instogram-server.azriltdkso.fun/",
});

const authLink = setContext(async (_, { headers }) => {
  const token = await getValueSecure("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
