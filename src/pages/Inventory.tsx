import React, { useState } from 'react';
import { Search, Plus, Filter, Download, MoreVertical, Edit, Trash } from 'lucide-react';

const DUMMY_INVENTORY = [
  { id: '1', name: 'Paracetamol 500mg', category: 'Painkillers', stock: 120, unit: 'Strip', price: 5.00, status: 'In Stock' },
  { id: '2', name: 'Amoxicillin 250mg', category: 'Antibiotics', stock: 45, unit: 'Box', price: 12.50, status: 'Low Stock' },
  { id: '3', name: 'Cetirizine 10mg', category: 'Antihistamines', stock: 200, unit: 'Strip', price: 8.00, status: 'In Stock' },
  { id: '4', name: 'Omeprazole 20mg', category: 'Gastrointestinal', stock: 80, unit: 'Bottle', price: 15.00, status: 'In Stock' },
  { id: '5', name: 'Vitamin C 1000mg', category: 'Vitamins', stock: 12, unit: 'Bottle', price: 25.00, status: 'Critical' },
];

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-8 max-w-none h-full flex flex-col gap-6 bg-slate-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
          <p className="text-sm text-slate-500">Manage your pharmacy products and stock levels.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search inventory..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-50">
                <th className="py-4 px-6">Product Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 text-right">Stock</th>
                <th className="py-4 px-6 text-right">Price</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {DUMMY_INVENTORY.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="text-sm font-semibold text-slate-800">{item.name}</div>
                    <div className="text-xs text-slate-400 font-mono">ID: PRD-{item.id.padStart(4, '0')}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-500">{item.category}</td>
                  <td className="py-4 px-6 text-sm text-slate-800 text-right">
                    <span className="font-bold">{item.stock}</span> <span className="text-slate-400 text-xs ml-1">{item.unit}</span>
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-slate-800 text-right">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      item.status === 'Critical' ? 'bg-rose-50 text-rose-500' : 
                      item.status === 'Low Stock' ? 'bg-amber-50 text-amber-500' : 
                      'bg-emerald-50 text-emerald-500'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                        <Trash className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-6 border-t border-slate-50 bg-white flex items-center justify-between text-sm text-slate-500">
          <div>Showing <span className="font-bold text-slate-800">1</span> to <span className="font-bold text-slate-800">5</span> of <span className="font-bold text-slate-800">5</span> entries</div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 font-bold text-slate-700 transition-colors">Previous</button>
            <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold">1</button>
            <button className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
