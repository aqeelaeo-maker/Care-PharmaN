import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle,
  IndianRupee,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { getStoreCollection } from '../utils/store';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [productsInStock, setProductsInStock] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<{name: string, value: number}[]>([]);
  const [salesData, setSalesData] = useState<{name: string, sales: number}[]>([]);

  useEffect(() => {
    if (!user?.email) return;

    // Listen to Products
    const unsubProducts = onSnapshot(getStoreCollection(user.email, 'products'), (snapshot) => {
      let totalStock = 0;
      let lowCount = 0;
      let categories: Record<string, number> = {};
      const lowItems: any[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const stock = data.stock || 0;
        totalStock += stock;
        
        if (stock < 20) { // arbitrary low stock threshold
          lowCount++;
          lowItems.push({ id: doc.id, ...data });
        }

        const category = data.category || 'Uncategorized';
        categories[category] = (categories[category] || 0) + stock;
      });

      setProductsInStock(totalStock);
      setLowStockCount(lowCount);
      setLowStockItems(lowItems.slice(0, 5)); // show top 5 low items
      
      const catData = Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // top 5 categories
      setCategoryData(catData);
    });

    // Listen to Customers
    const unsubCustomers = onSnapshot(getStoreCollection(user.email, 'customers'), (snapshot) => {
      setTotalCustomers(snapshot.docs.length);
    });

    // Listen to Sales
    const unsubSales = onSnapshot(getStoreCollection(user.email, 'sales'), (snapshot) => {
      let todayRev = 0;
      
      // We will group by day (Mon, Tue, etc.) for the last 7 days
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const currentDay = new Date().getDay();
      const weeklySales = Array.from({ length: 7 }, (_, i) => ({
        name: days[(currentDay - 6 + i + 7) % 7], // last 7 days order
        sales: 0,
        date: new Date(new Date().setDate(new Date().getDate() - (6 - i))).toDateString()
      }));

      const todayString = new Date().toDateString();

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const total = data.total || 0;
        const date = data.timestamp?.toDate() || new Date();
        const dateString = date.toDateString();
        
        if (dateString === todayString) {
          todayRev += total;
        }

        // Add to weekly chart
        const dayIndex = weeklySales.findIndex(d => d.date === dateString);
        if (dayIndex !== -1) {
          weeklySales[dayIndex].sales += total;
        }
      });

      setDailyRevenue(todayRev);
      setSalesData(weeklySales);
    });

    return () => {
      unsubProducts();
      unsubCustomers();
      unsubSales();
    };
  }, []);

  return (
    <div className="p-8 max-w-none flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Command Center</h1>
          <p className="text-sm text-slate-500">Live store health & pharmaceutical metrics</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            Download Report
          </button>
          <button onClick={() => navigate('/pos')} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors">
            New Sale
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        {[
          { label: "Daily Revenue", value: `${dailyRevenue.toFixed(2)}`, icon: TrendingUp, trend: "Today", color: "blue" },
          { label: "Total Customers", value: totalCustomers.toString(), icon: Users, trend: "Total", color: "purple" },
          { label: "Products in Stock", value: productsInStock.toString(), icon: Package, trend: "Current", color: "amber" },
          { label: "Low Stock Items", value: lowStockCount.toString(), icon: AlertTriangle, trend: "Critical", color: "rose", alert: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                'bg-rose-100 text-rose-600'
              }`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                stat.alert ? 'bg-rose-50 text-rose-500' :
                stat.trend === 'Today' || stat.trend === 'Current' ? 'bg-emerald-50 text-emerald-500' : 'text-slate-400'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Revenue Overview (Last 7 Days)</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Top Categories in Stock</h2>
          <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={80} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Alerts Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">Critical Stock Monitor</h2>
          <button className="text-sm text-emerald-600 font-bold hover:text-emerald-700">View All</button>
        </div>
        <div className="overflow-x-auto flex-1">
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 font-medium">All stocks are optimal.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-50">
                  <th className="pb-3 px-2">Medicine Name</th>
                  <th className="pb-3 px-2">Category</th>
                  <th className="pb-3 px-2 text-center">Stock Status</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lowStockItems.map((item, i) => {
                  const percent = Math.min((item.stock / 20) * 100, 100);
                  const isCritical = item.stock < 10;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                      <td className="py-4 px-2 font-semibold text-slate-700">{item.name}</td>
                      <td className="py-4 px-2 text-slate-500 font-mono">{item.category}</td>
                      <td className="py-4 px-2">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-xs font-bold ${isCritical ? 'text-rose-500' : 'text-amber-500'}`}>{item.stock} in stock</span>
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mx-auto">
                            <div className={`h-full ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <button className="px-3 py-1 bg-slate-100 rounded-lg font-bold text-[10px] uppercase hover:bg-slate-200 transition-colors text-slate-700">Reorder</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
