import React from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Login = ({ closeModal = () => {} }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const navigate = useNavigate();
  const { setUser, setRole, setUserLoaded } = useAuth();

  const onSubmit = async (data) => {
    setUserLoaded(false);
    const URL = `${import.meta.env.VITE_APP_API_URL}/api/v1/user/LoginUser`;
    try {
      const response = await axios.post(URL, data, { withCredentials: true });

      if (response.data.status === 'success') {
        setUser(response.data.user);
        setRole(response.data.user.userType);
        toast.success('Logged in Successfully');
        reset();
        closeModal();
        navigate('/');
      } else {
        toast.error('Login not Successful');
      }
    } catch (error) {
        console.log(error)
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Invalid username or password. Please try again.');
        } else if (error.response.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('An error occurred during login. Please try again.');
        }
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setUserLoaded(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Login
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Login
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-indigo-600 hover:underline">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
