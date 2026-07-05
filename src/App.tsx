/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Stock from './pages/Stock';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Customers from './pages/Customers';
import Vendors from './pages/Vendors';
import Reports from './pages/Reports';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Pill } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthorized, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <p className="text-emerald-400 text-sm font-bold tracking-widest uppercase">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-[2.5rem] max-w-md shadow-2xl">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Pill className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">Access Denied</h1>
          <p className="text-sm font-medium text-slate-500 mb-8">
            Your email ({user.email}) is not authorized to access this store. Please contact the Super Admin.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold transition-all shadow-lg shadow-slate-800/20"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="pos" element={<POS />} />
            <Route path="products" element={<Inventory />} />
            <Route path="stock" element={<Stock />} />
            <Route path="customers" element={<Customers />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

