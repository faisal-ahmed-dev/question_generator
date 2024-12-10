import React from 'react'
import { createBrowserRouter } from 'react-router-dom';
import Global from '../layouts/Global';
import ErrorBoundary from '../components/ErrorBoundary';
import Login from '../pages/global/Login';
import Logout from '../pages/global/Logout';
import Register from '../pages/global/Register';
import Home from '../pages/global/Home';
import PrivateRoutes from './PrivateRoutes';





  


const routes = createBrowserRouter([
    {
      element: (<Global />),
      children: [
        {
          path: '/login',
          element: <Login />,
        },
        {
          path: '/logout',
          element: <Logout />,
        },
        {
          path: '/register',
          element: <Register />,
        },
        {
          path: '/',
          element: <Home />,
        },


      ],
    },
  ]);

export default routes
