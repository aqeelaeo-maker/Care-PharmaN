import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, CreditCard, Banknote, User, ArrowLeft, Package } from 'lucide-react';
import { collection, onSnapshot, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function POS() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<{product: any, qty: number}[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      setProducts(items);
    });
    
    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      setCustomers(items);
    });
    
    return () => {
      unsubProducts();
      unsubCustomers();
    };
  }, []);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleAddSelectedProduct = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.qty < product.stock) {
        setCart(cart.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { product, qty: 1 }]);
      }
    }
    setSelectedProductId(''); // Reset after adding
  };

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === id) {
        const newQty = item.qty + delta;
        if (newQty > 0 && newQty <= item.product.stock) {
          return { ...item, qty: newQty };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.product.id !== id));
  };

  const processPayment = async (method: string) => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      // 1. Create sale record
      await addDoc(collection(db, 'sales'), {
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          qty: item.qty,
          price: item.product.price
        })),
        customerId: selectedCustomerId || null,
        customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
        subtotal,
        tax,
        total,
        paymentMethod: method,
        timestamp: new Date()
      });

      // 2. Update stock
      for (const item of cart) {
        const productRef = doc(db, 'products', item.product.id);
        await updateDoc(productRef, {
          stock: increment(-item.qty)
        });
      }

      setCart([]);
      setSelectedCustomerId('');
      navigate('/invoices');
    } catch (err) {
      console.error("Error processing payment", err);
      alert('Error processing payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-2 shrink-0">
        <button onClick={() => navigate('/invoices')} className="p-2 text-slate-400 hover:text-slate-800 transition-colors bg-white rounded-xl shadow-sm border border-slate-200">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create New Invoice</h1>
          <p className="text-sm text-slate-500">Select a customer and add products to generate an invoice.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        
        {/* Left Side: Customer Selection */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col p-6 overflow-y-auto">
          <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" /> Customer Details
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Customer</label>
              <select 
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">Walk-in Customer (No details)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.phone ? `- ${c.phone}` : ''}</option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Name</div>
                  <div className="text-sm font-semibold text-slate-800">{selectedCustomer.name}</div>
                </div>
                {selectedCustomer.phone && (
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</div>
                    <div className="text-sm font-semibold text-slate-800">{selectedCustomer.phone}</div>
                  </div>
                )}
                {selectedCustomer.email && (
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</div>
                    <div className="text-sm font-semibold text-slate-800">{selectedCustomer.email}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Loyalty Points</div>
                  <div className="text-sm font-bold text-emerald-600">{selectedCustomer.loyaltyPoints || 0} pts</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Product Selection & Invoice Items */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex-shrink-0">
            <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" /> Add Products
            </h2>
            <div className="flex gap-2">
              <select 
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">Select a product...</option>
                {products.filter(p => p.stock > 0).map(p => (
                  <option key={p.id} value={p.id}>{p.name} - ${Number(p.price).toFixed(2)} (Stock: {p.stock})</option>
                ))}
              </select>
              <button 
                onClick={handleAddSelectedProduct}
                disabled={!selectedProductId}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm">No products added yet.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm items-center">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-800 truncate">{item.product.name}</h4>
                    <div className="text-sm font-bold text-emerald-600 mt-1">${(item.product.price * item.qty).toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200">
                      <button onClick={() => updateQty(item.product.id, -1)} className="p-2 text-slate-500 hover:text-emerald-600"><Minus className="w-4 h-4" /></button>
                      <span className="w-6 text-center text-sm font-bold text-slate-700">{item.qty}</span>
                      <button onClick={() => updateQty(item.product.id, 1)} className="p-2 text-slate-500 hover:text-emerald-600"><Plus className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-slate-50 space-y-4 rounded-t-[2.5rem] border-t border-slate-100 flex-shrink-0">
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Subtotal</span>
              <span className="text-slate-800">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Tax (5%)</span>
              <span className="text-slate-800">${tax.toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-slate-800">Total</span>
              <span className="text-2xl font-black text-emerald-600">${total.toFixed(2)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button disabled={isProcessing || cart.length === 0} onClick={() => processPayment('Cash')} className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50">
                <Banknote className="w-5 h-5" /> {isProcessing ? '...' : 'Cash'}
              </button>
              <button disabled={isProcessing || cart.length === 0} onClick={() => processPayment('Card')} className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors disabled:opacity-50">
                <CreditCard className="w-5 h-5" /> {isProcessing ? '...' : 'Card'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
