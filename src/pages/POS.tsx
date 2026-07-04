import React, { useState } from 'react';
import { Search, Barcode, Trash2, Plus, Minus, CreditCard, Banknote, User } from 'lucide-react';

const DUMMY_PRODUCTS = [
  { id: '1', name: 'Paracetamol 500mg', price: 5.00, stock: 120, generic: 'Acetaminophen' },
  { id: '2', name: 'Amoxicillin 250mg', price: 12.50, stock: 45, generic: 'Amoxicillin' },
  { id: '3', name: 'Cetirizine 10mg', price: 8.00, stock: 200, generic: 'Cetirizine' },
  { id: '4', name: 'Omeprazole 20mg', price: 15.00, stock: 80, generic: 'Omeprazole' },
  { id: '5', name: 'Vitamin C 1000mg', price: 25.00, stock: 150, generic: 'Ascorbic Acid' },
];

export default function POS() {
  const [cart, setCart] = useState<{product: any, qty: number}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { product, qty: 1 }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.product.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  const filteredProducts = DUMMY_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.generic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col lg:flex-row bg-slate-50">
      {/* Products Section */}
      <div className="flex-1 flex flex-col h-full border-r border-slate-200">
        <div className="p-4 bg-white border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products by name, generic, or scan barcode..."
              className="w-full pl-12 pr-12 py-3 rounded-full bg-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600">
              <Barcode className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-left flex flex-col"
              >
                <div className="flex-1 mb-3">
                  <h3 className="font-bold text-slate-800 text-sm mb-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{product.generic}</p>
                </div>
                <div className="flex items-center justify-between mt-auto w-full">
                  <span className="font-bold text-emerald-600">${product.price.toFixed(2)}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                    {product.stock} in stock
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-[400px] flex flex-col bg-white h-full shrink-0 shadow-[-4px_0_24px_-10px_rgba(0,0,0,0.05)] z-10">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            Current Order
          </h2>
          <button className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:text-emerald-700">
            <User className="w-4 h-4" /> Add Customer
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm">Scan or search for items to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex gap-3 bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
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

        <div className="p-6 bg-slate-50 space-y-4 mt-auto rounded-t-[2.5rem] border-t border-slate-100">
          <div className="flex justify-between text-sm text-slate-500 font-medium">
            <span>Subtotal</span>
            <span className="text-slate-800">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500 font-medium">
            <span>Tax (5%)</span>
            <span className="text-slate-800">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500 font-medium">
            <span>Discount</span>
            <span className="text-emerald-500">-$0.00</span>
          </div>
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center mb-6">
            <span className="text-lg font-bold text-slate-800">Total</span>
            <span className="text-2xl font-black text-emerald-600">${total.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors">
              <Banknote className="w-5 h-5" /> Cash
            </button>
            <button className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors">
              <CreditCard className="w-5 h-5" /> Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
