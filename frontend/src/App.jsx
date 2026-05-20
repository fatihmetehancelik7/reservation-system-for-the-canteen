import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MonthlySelection from './pages/MonthlySelection';
import MyPayments from './pages/MyPayments';
import AdminHolidays from './pages/AdminHolidays';
import AdminMenu from './pages/AdminMenu';
import AdminReservations from './pages/AdminReservations';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="monthly-selection" element={<MonthlySelection />} />
            <Route path="my-payments" element={<MyPayments />} />
            
            {/* Admin Routes */}
            <Route path="admin/menus" element={<AdminMenu />} />
            <Route path="admin/holidays" element={<AdminHolidays />} />
            <Route path="admin/reservations" element={<AdminReservations />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
