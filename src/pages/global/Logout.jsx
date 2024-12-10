import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Logout = () => {
  const { setUser, setRole, setUserLoaded,userLoaded } = useAuth();
  const navigate = useNavigate();



  useEffect(() => {
    const performLogout = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_DOMAIN}/api/v1/user/LogoutUser`,
          {},
          { withCredentials: true }
        );
        if (response.status === 200) {
          setUser(null);
          setRole(null);
          setUserLoaded(true);
          navigate("/");
        }
      } catch (error) {
        console.error('Logout failed', error);
      }
    };

    performLogout();
  }, [setUser, setRole, setUserLoaded, navigate]);

  return null;
};

export default Logout;
