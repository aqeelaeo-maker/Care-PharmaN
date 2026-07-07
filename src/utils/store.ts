import { doc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const getStoreRef = (email: string) => doc(db, 'stores', email);
export const getStoreCollection = (email: string, path: string) => collection(db, 'stores', email, path);
export const getStoreDoc = (email: string, path: string, id: string) => doc(db, 'stores', email, path, id);
