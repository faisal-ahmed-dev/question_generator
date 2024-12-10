import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/Spinner";

export default function PrivateRoutes({ children }) {
  const {user, userLoaded} = useAuth();
  

  if (!userLoaded) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to='/login' />;
  }
  

  return children;
}