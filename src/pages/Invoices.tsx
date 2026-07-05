import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Eye, Edit, Trash2, X } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function Invoices() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [editData, setEditData] = useState({ paymentMethod: 'Cash' });

  useEffect(() => {
    const q = query(collection(db, 'sales'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setInvoices(items);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'sales', id));
      } catch (err) {
        console.error('Error deleting invoice', err);
      }
    }
  };

  const openEditModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setEditData({ paymentMethod: invoice.paymentMethod || 'Cash' });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await updateDoc(doc(db, 'sales', selectedInvoice.id), {
        paymentMethod: editData.paymentMethod
      });
      setIsEditModalOpen(false);
      setSelectedInvoice(null);
    } catch (err) {
      console.error('Error updating invoice', err);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-none h-full flex flex-col gap-6 bg-slate-50 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Invoices</h1>
          <p className="text-sm text-slate-500">View and manage sales records and invoices.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <button onClick={() => navigate('/pos')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Invoice
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
              placeholder="Search by invoice ID or payment method..."
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
                <th className="py-4 px-6">Invoice ID</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Items</th>
                <th className="py-4 px-6 text-right">Total Amount</th>
                <th className="py-4 px-6">Payment Method</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {filteredInvoices.map((inv) => {
                const date = inv.timestamp?.toDate ? inv.timestamp.toDate() : new Date();
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        INV-{inv.id.slice(0, 8).toUpperCase()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-700">{date.toLocaleDateString()}</div>
                      <div className="text-xs text-slate-400">{date.toLocaleTimeString()}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-slate-700">
                        {inv.items?.length || 0} items
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-800 text-right">
                      ${Number(inv.total || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        inv.paymentMethod === 'Cash' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {inv.paymentMethod || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(inv)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(inv.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium text-sm">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-slate-800">Edit Invoice</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="edit-invoice-form" onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Payment Method</label>
                  <select 
                    value={editData.paymentMethod} 
                    onChange={e => setEditData({...editData, paymentMethod: e.target.value})} 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button type="submit" form="edit-invoice-form" className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
