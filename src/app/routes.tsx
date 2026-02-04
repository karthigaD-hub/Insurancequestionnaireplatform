import { createBrowserRouter, Navigate } from 'react-router';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminQuestions } from './pages/admin/Questions';
import { AdminResponses } from './pages/admin/Responses';
import { AdminUsers } from './pages/admin/Users';
import { AgentDashboard } from './pages/agent/Dashboard';
import { AgentUsers } from './pages/agent/Users';
import { AgentResponses } from './pages/agent/Responses';
import { UserDashboard } from './pages/user/Dashboard';
import { UserForm } from './pages/user/Form';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'questions',
        element: <AdminQuestions />,
      },
      {
        path: 'responses',
        element: <AdminResponses />,
      },
      {
        path: 'users',
        element: <AdminUsers />,
      },
    ],
  },
  {
    path: '/agent',
    element: <ProtectedRoute allowedRoles={['agent']} />,
    children: [
      {
        index: true,
        element: <AgentDashboard />,
      },
      {
        path: 'users',
        element: <AgentUsers />,
      },
      {
        path: 'responses',
        element: <AgentResponses />,
      },
    ],
  },
  {
    path: '/user',
    element: <ProtectedRoute allowedRoles={['user']} />,
    children: [
      {
        index: true,
        element: <UserDashboard />,
      },
      {
        path: 'form/:providerId',
        element: <UserForm />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
