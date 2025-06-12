import { createContext, useState, useEffect } from "react";
import { getValueSecure } from "../helpers/secureStore";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await getValueSecure("token");
      if (token) {
        setIsSignedIn(true);
      } else {
        setIsSignedIn(false);
      }
    };
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isSignedIn, setIsSignedIn }}>
      {children}
    </AuthContext.Provider>
  );
}
