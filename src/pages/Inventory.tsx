import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Download, MoreVertical, Edit, Trash, X } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Medicines',
    subCategory: 'Painkillers',
    company: '',
    batch: '',
    stock: 0,
    price: 0,
    status: 'Out of Stock',
    expiryDate: ''
  });

  const CATEGORIES = {
    'Medicines': ['Painkillers', 'Antibiotics', 'Vitamins & Supplements', 'Cold & Flu', 'First Aid'],
    'Personal Care': ['Skincare', 'Haircare', 'Oral Care', 'Bath & Body'],
    'Baby Care': ['Baby Food', 'Diapers & Wipes', 'Baby Skincare'],
    'Equipment': ['Monitors', 'Support Braces', 'Thermometers']
  };

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        stock: 0,
        price: 0,
        batch: '',
        expiryDate: '',
        status: 'Out of Stock'
      });
      setIsAddModalOpen(false);
      setNewProduct({ name: '', category: 'Medicines', subCategory: 'Painkillers', company: '', batch: '', stock: 0, price: 0, status: 'Out of Stock', expiryDate: '' });
    } catch (err) {
      console.error("Error adding product", err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        console.error("Error deleting product", err);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.batch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-none h-full flex flex-col gap-6 bg-slate-50 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products Management</h1>
          <p className="text-sm text-slate-500">Manage your pharmacy products and stock levels.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
          >
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
              placeholder="Search products..."
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
                <th className="py-4 px-6">Company</th>
                <th className="py-4 px-6 text-right">Stock</th>
                <th className="py-4 px-6 text-right">Price</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {filteredProducts.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="text-sm font-semibold text-slate-800">{item.name}</div>
                    <div className="text-xs text-slate-400 font-mono">ID: {item.id.slice(0, 8).toUpperCase()}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-slate-800">{item.category}</div>
                    <div className="text-xs text-slate-400">{item.subCategory}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-500">{item.company || '-'}</td>
                  <td className="py-4 px-6 text-sm text-slate-800 text-right">
                    <span className="font-bold">{item.stock || 0}</span>
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-slate-800 text-right">
                    {Number(item.price).toFixed(2)}
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
                      <button onClick={() => handleDeleteProduct(item.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                        <Trash className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
        
        {/* Pagination */}
        <div className="p-6 border-t border-slate-50 bg-white flex items-center justify-between text-sm text-slate-500">
          <div>Showing <span className="font-bold text-slate-800">{filteredProducts.length}</span> products</div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 font-bold text-slate-700 transition-colors" disabled>Previous</button>
            <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold">1</button>
            <button className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-colors" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-slate-800">Add New Product</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="add-product-form" onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Product Name</label>
                  <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="e.g. Paracetamol 500mg" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Company</label>
                  <input type="text" required value={newProduct.company} onChange={e => setNewProduct({...newProduct, company: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="e.g. Pfizer" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                    <select 
                      required 
                      value={newProduct.category} 
                      onChange={e => {
                        const newCat = e.target.value;
                        setNewProduct({
                          ...newProduct, 
                          category: newCat,
                          subCategory: CATEGORIES[newCat as keyof typeof CATEGORIES][0]
                        });
                      }} 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      {Object.keys(CATEGORIES).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Subcategory</label>
                    <select 
                      required 
                      value={newProduct.subCategory} 
                      onChange={e => setNewProduct({...newProduct, subCategory: e.target.value})} 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      {CATEGORIES[newProduct.category as keyof typeof CATEGORIES]?.map((sub: string) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button type="submit" form="add-product-form" className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all">
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
