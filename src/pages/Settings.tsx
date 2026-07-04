import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Settings() {
  const { user, role } = useAuth();
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isSuperAdmin = user?.email === 'aqeelaeo@gmail.com';

  useEffect(() => {
    fetchAuthorizedEmails();
  }, []);

  const fetchAuthorizedEmails = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'settings', 'authorized_emails');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAuthorizedEmails(docSnap.data().emails || []);
      } else {
        // Initialize if doesn't exist
        await setDoc(docRef, { emails: [] });
        setAuthorizedEmails([]);
      }
    } catch (err) {
      console.error("Error fetching emails:", err);
      setError("Failed to load authorized emails. You might not have permission.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (authorizedEmails.includes(newEmail)) {
      setError('This email is already authorized.');
      return;
    }
    if (!isSuperAdmin) {
      setError('Only the Super Admin can authorize emails.');
      return;
    }

    try {
      setError('');
      const updatedEmails = [...authorizedEmails, newEmail];
      await setDoc(doc(db, 'settings', 'authorized_emails'), {
        emails: updatedEmails
      });
      setAuthorizedEmails(updatedEmails);
      setNewEmail('');
      setSuccess('Email successfully authorized.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error("Error adding email:", err);
      setError("Failed to authorize email.");
    }
  };

  const handleRemoveEmail = async (emailToRemove: string) => {
    if (!isSuperAdmin) {
      setError('Only the Super Admin can remove authorized emails.');
      return;
    }
    try {
      setError('');
      const updatedEmails = authorizedEmails.filter(email => email !== emailToRemove);
      await setDoc(doc(db, 'settings', 'authorized_emails'), {
        emails: updatedEmails
      });
      setAuthorizedEmails(updatedEmails);
      setSuccess('Email successfully removed.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error("Error removing email:", err);
      setError("Failed to remove authorized email.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col gap-6 bg-slate-50 overflow-auto">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
        <p className="text-sm text-slate-500">Manage your pharmacy store configurations.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Access Control Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Access Control</h2>
            <p className="text-sm text-slate-500">Manage authorized users for this store.</p>
          </div>
        </div>

        <div className="space-y-6">
          {!isSuperAdmin && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-800">Permission Restricted</h3>
                <p className="text-sm text-amber-700 mt-1">Only the Super Admin (aqeelaeo@gmail.com) can modify authorized emails.</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Super Admin</h3>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">aqeelaeo@gmail.com</p>
                <p className="text-xs text-slate-500 font-medium">Full System Access</p>
              </div>
              <span className="ml-auto bg-emerald-500 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">Owner</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Authorized Emails</h3>
            
            <form onSubmit={handleAddEmail} className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="Enter email to authorize..."
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={!isSuperAdmin}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={!isSuperAdmin || !newEmail}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Authorize
              </button>
            </form>

            <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
              {loading ? (
                <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading authorized emails...</div>
              ) : authorizedEmails.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm font-medium">No additional authorized emails found.</div>
              ) : (
                <ul className="divide-y divide-slate-50">
                  {authorizedEmails.map((email) => (
                    <li key={email} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{email}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveEmail(email)}
                        disabled={!isSuperAdmin}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        title="Remove authorization"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* General Settings placeholder */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 sm:p-8 opacity-60">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Store Configuration</h2>
        <p className="text-sm text-slate-500 mb-6">General settings and preferences.</p>
        <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">More settings coming soon</p>
        </div>
      </div>
    </div>
  );
}
