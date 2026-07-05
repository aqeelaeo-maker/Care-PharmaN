import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  Receipt,
  FileText,
  Settings,
  LogOut,
  Pill,
  Archive
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Receipt, label: 'Invoices', path: '/invoices' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: Archive, label: 'Stock', path: '/stock' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: Truck, label: 'Vendors', path: '/vendors' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Layout() {
  const { user, role, logout } = useAuth();
  const [storeLogo, setStoreLogo] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'store_config'), (doc) => {
      if (doc.exists()) {
        setStoreLogo(doc.data().logoUrl || null);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 flex items-center gap-3">
          {storeLogo ? (
            <img src={storeLogo} alt="Store Logo" className="w-8 h-8 rounded-lg object-cover shadow-lg shadow-emerald-500/20" />
          ) : (
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Pill className="w-5 h-5 text-white" />
            </div>
          )}
          <span className="text-xl font-bold text-white tracking-tight">CarePharma</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors gap-3",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-emerald-500 flex items-center justify-center font-bold text-sm text-white overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.email?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.displayName || user?.email}</p>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{role}</p>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors gap-3"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-3">
            {storeLogo ? (
              <img src={storeLogo} alt="Store Logo" className="w-8 h-8 rounded-lg object-cover shadow-lg shadow-emerald-500/20" />
            ) : (
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <Pill className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="font-bold text-slate-800 tracking-tight">CarePharma</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-600 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.email?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
