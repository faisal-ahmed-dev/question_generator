import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AuthProvider from './contexts/AuthProvider.jsx'
import { RouterProvider } from 'react-router-dom';
import routes from './routes/routes.jsx';
import './index.css'
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
      <Toaster />
      <RouterProvider router={routes} />
    </AuthProvider>
)
