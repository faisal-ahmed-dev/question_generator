import axios from 'axios';
import { createContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);


  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_DOMAIN}/api/v1/user/LoginUser`, { withCredentials: true });

      if (res.data?.message === "No user token") {
        setUserLoaded(true);
      } else if (res.data?.message === "Authentication failed") {
        toast("User not available!");
        setUserLoaded(true);
      } else {
        setUser(res.data?.user);
        setRole(res.data?.user?.userType);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setUserLoaded(true);
    }
  };


  useEffect(() => {
    fetchUser();
  }, []);

  const values = {
    user,
    setUser,
    role,
    setRole,
    userLoaded,
    setUserLoaded,
  };

  return (
    <AuthContext.Provider value={values}>
      {children}
    </AuthContext.Provider>
  );
}
