import { useContext } from "react";
import { AuthContext } from "../contexts/AuthProvider";

export default function useAuth() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return authContext;
}
