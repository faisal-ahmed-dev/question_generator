import React, { useState } from 'react';

const Register = () => {
  // State variables to hold form data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  // State variable for error messages
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error message
    setError('');

    // Basic client-side validation (optional)
    if (!name || !email || !mobile || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      // Make a POST request to the backend API
      const response = await fetch('/api/v1/user/CreateUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, mobile, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        console.log('User registered:', data);
        // Redirect or show success message
      } else {
        // Handle errors returned by the server
        setError(data.message || 'Registration failed');
      }
    } catch (err) {

      console.log(err)
      console.error('Error during registration:', err);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-md shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Register</h2>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {/* Mobile */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Mobile</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>
          {/* Password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Register
            </button>
          </div>
        </form>
        {/* Link to Login */}
        <div className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-600 hover:underline">
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
