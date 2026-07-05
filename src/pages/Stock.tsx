import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash, X, Calendar, AlertCircle, Plus } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Stock() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  
  const [updateData, setUpdateData] = useState({
    batch: '',
    stock: 0,
    price: 0,
    expiryDate: ''
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setProducts(items);
    });
    return () => unsub();
  }, []);

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    
    try {
      const stockNum = Number(updateData.stock);
      const priceNum = Number(updateData.price);
      const status = stockNum < 10 ? 'Critical' : stockNum < 30 ? 'Low Stock' : 'In Stock';
      
      await updateDoc(doc(db, 'products', selectedProductId), {
        batch: updateData.batch,
        stock: stockNum,
        price: priceNum,
        expiryDate: updateData.expiryDate,
        status
      });
      setIsUpdateModalOpen(false);
      setSelectedProductId('');
      setUpdateData({ batch: '', stock: 0, price: 0, expiryDate: '' });
    } catch (err) {
      console.error("Error updating stock", err);
    }
  };

  const openUpdateModal = (product?: any) => {
    if (product) {
      setSelectedProductId(product.id);
      setUpdateData({
        batch: product.batch || '',
        stock: product.stock || 0,
        price: product.price || 0,
        expiryDate: product.expiryDate || ''
      });
    } else {
      setSelectedProductId('');
      setUpdateData({ batch: '', stock: 0, price: 0, expiryDate: '' });
    }
    setIsUpdateModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.batch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-none h-full flex flex-col gap-6 bg-slate-50 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stock Management</h1>
          <p className="text-sm text-slate-500">Monitor and update inventory levels, batches, and expiry dates.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <button 
            onClick={() => openUpdateModal()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Update Stock
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
              placeholder="Search by name or batch..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-50">
                <th className="py-4 px-6">Product & Batch</th>
                <th className="py-4 px-6 text-center">Current Stock</th>
                <th className="py-4 px-6 text-right">Price</th>
                <th className="py-4 px-6">Expiry Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {filteredProducts.map((item) => {
                const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="text-sm font-semibold text-slate-800">{item.name}</div>
                      <div className="text-xs text-slate-400 font-mono">Batch: {item.batch || '-'}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-sm font-bold ${item.stock < 10 ? 'text-rose-500' : 'text-slate-800'}`}>
                        {item.stock || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-slate-800">
                      ${Number(item.price || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className={`text-sm font-medium ${isExpired ? 'text-rose-500' : 'text-slate-700'}`}>
                          {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'Not Set'}
                        </span>
                        {isExpired && <AlertCircle className="w-4 h-4 text-rose-500" title="Expired" />}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        item.status === 'Critical' || item.stock === 0 ? 'bg-rose-50 text-rose-500' : 
                        item.status === 'Low Stock' ? 'bg-amber-50 text-amber-500' : 
                        'bg-emerald-50 text-emerald-500'
                      }`}>
                        {item.status || 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => openUpdateModal(item)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        Update Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium text-sm">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Stock Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-slate-800">Update Stock</h2>
              <button onClick={() => setIsUpdateModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="update-stock-form" onSubmit={handleUpdateStock} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Select Product</label>
                  <select 
                    required 
                    value={selectedProductId} 
                    onChange={e => {
                      const pid = e.target.value;
                      setSelectedProductId(pid);
                      const prod = products.find(p => p.id === pid);
                      if (prod) {
                        setUpdateData({
                          batch: prod.batch || '',
                          stock: prod.stock || 0,
                          price: prod.price || 0,
                          expiryDate: prod.expiryDate || ''
                        });
                      } else {
                        setUpdateData({ batch: '', stock: 0, price: 0, expiryDate: '' });
                      }
                    }} 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="" disabled>Select a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Batch Number</label>
                  <input type="text" required value={updateData.batch} onChange={e => setUpdateData({...updateData, batch: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="e.g. BTH-1029" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Stock Level</label>
                    <input type="number" required min="0" value={updateData.stock} onChange={e => setUpdateData({...updateData, stock: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Price ($)</label>
                    <input type="number" required min="0" step="0.01" value={updateData.price} onChange={e => setUpdateData({...updateData, price: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input type="date" required value={updateData.expiryDate} onChange={e => setUpdateData({...updateData, expiryDate: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsUpdateModalOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button type="submit" form="update-stock-form" disabled={!selectedProductId} className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

