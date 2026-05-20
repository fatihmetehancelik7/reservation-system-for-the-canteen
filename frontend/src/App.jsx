import { createBrowserRouter, Navigate, redirect, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { queryClient } from './lib/queryClient';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MonthlySelection from './pages/MonthlySelection';
import MyPayments from './pages/MyPayments';
import AdminHolidays from './pages/AdminHolidays';
import AdminMenu from './pages/AdminMenu';
import AdminReservations from './pages/AdminReservations';
import { getMenusByMonth } from './services/menuService';
import { getAllHolidays, getAllRefunds, getUserRefunds } from './services/holidayService';
import { getAllReservations, getUserReservations } from './services/reservationService';

const currentYear = 2026;
const currentMonth = new Date().getMonth() + 1;

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const protectedLoader = (allowedRoles, loader) => async () => {
  const user = getStoredUser();

  if (!user) {
    throw redirect('/login');
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.rol)) {
    throw redirect('/dashboard');
  }

  if (loader) {
    return loader(user);
  }

  return null;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <Dashboard /> },
          {
            element: <ProtectedRoute allowedRoles={['KULLANICI']} />,
            children: [
              {
                path: 'monthly-selection',
                loader: protectedLoader(['KULLANICI'], (user) => Promise.all([
                  queryClient.ensureQueryData({ queryKey: ['menus', currentYear, currentMonth], queryFn: () => getMenusByMonth(currentYear, currentMonth) }),
                  queryClient.ensureQueryData({ queryKey: ['holidays'], queryFn: getAllHolidays }),
                  queryClient.ensureQueryData({ queryKey: ['reservations', 'user', user.id], queryFn: () => getUserReservations(user.id) }),
                ])),
                element: <MonthlySelection />,
              },
              {
                path: 'my-payments',
                loader: protectedLoader(['KULLANICI'], (user) => Promise.all([
                  queryClient.ensureQueryData({ queryKey: ['reservations', 'user', user.id], queryFn: () => getUserReservations(user.id) }),
                  queryClient.ensureQueryData({ queryKey: ['refunds', 'user', user.id], queryFn: () => getUserRefunds(user.id) }),
                ])),
                element: <MyPayments />,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={['ADMIN']} />,
            children: [
              {
                path: 'admin/menus',
                loader: protectedLoader(['ADMIN'], () => queryClient.ensureQueryData({
                  queryKey: ['menus', currentYear, currentMonth],
                  queryFn: () => getMenusByMonth(currentYear, currentMonth),
                })),
                element: <AdminMenu />,
              },
              {
                path: 'admin/holidays',
                loader: protectedLoader(['ADMIN'], () => queryClient.ensureQueryData({
                  queryKey: ['holidays'],
                  queryFn: getAllHolidays,
                })),
                element: <AdminHolidays />,
              },
              {
                path: 'admin/reservations',
                loader: protectedLoader(['ADMIN'], () => Promise.all([
                  queryClient.ensureQueryData({ queryKey: ['reservations', 'all'], queryFn: getAllReservations }),
                  queryClient.ensureQueryData({ queryKey: ['refunds', 'all'], queryFn: getAllRefunds }),
                ])),
                element: <AdminReservations />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
