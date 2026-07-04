import React from 'react';
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

const salesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const categoryData = [
  { name: 'Antibiotics', value: 400 },
  { name: 'Painkillers', value: 300 },
  { name: 'Vitamins', value: 300 },
  { name: 'First Aid', value: 200 },
];

export default function Dashboard() {
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
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors">
            New Sale
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        {[
          { label: "Daily Revenue", value: "$4,289.00", icon: TrendingUp, trend: "+12.5%", color: "blue" },
          { label: "Total Customers", value: "1,429", icon: Users, trend: "+4.1%", color: "purple" },
          { label: "Products in Stock", value: "8,942", icon: Package, trend: "Current", color: "amber" },
          { label: "Low Stock Items", value: "24", icon: AlertTriangle, trend: "Critical", color: "rose", alert: true },
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
                stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-500' : 'text-slate-400'
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
            <h2 className="text-lg font-bold text-slate-800">Revenue Overview</h2>
            <select className="text-sm border-slate-200 rounded-md bg-slate-50 py-1.5 px-3">
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
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
          <h2 className="text-lg font-bold text-slate-800 mb-6">Top Categories</h2>
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-50">
                <th className="pb-3 px-2">Medicine Name</th>
                <th className="pb-3 px-2">Category / Batch No.</th>
                <th className="pb-3 px-2 text-center">Stock Status</th>
                <th className="pb-3 px-2">Expiry</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: 'Amoxicillin 500mg', batch: 'BTH-8932', stock: 45, date: 'Oct 2026', status: 'Warning', category: 'Antibiotics' },
                { name: 'Metformin HCl', batch: 'BTH-1029', stock: 120, date: 'Jan 2027', status: 'Warning', category: 'Antidiabetic' },
                { name: 'Atorvastatin 20mg', batch: 'BTH-4451', stock: 12, date: 'Mar 2026', status: 'Critical', category: 'Cholesterol' },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="py-4 px-2 font-semibold text-slate-700">{item.name}</td>
                  <td className="py-4 px-2 text-slate-500 font-mono">{item.batch}</td>
                  <td className="py-4 px-2">
                    <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mx-auto">
                      <div className={`h-full ${item.status === 'Critical' ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: item.status === 'Critical' ? '12%' : '45%' }}></div>
                    </div>
                  </td>
                  <td className={`py-4 px-2 font-medium ${item.status === 'Critical' ? 'text-rose-500' : 'text-slate-500'}`}>{item.date}</td>
                  <td className="py-4 px-2 text-right">
                    <button className="px-3 py-1 bg-slate-100 rounded-lg font-bold text-[10px] uppercase hover:bg-slate-200 transition-colors text-slate-700">Reorder</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
