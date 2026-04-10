import { Injectable } from '@angular/core';
import {
  collection, addDoc, getDocs,
  doc, updateDoc, query, where, orderBy
} from 'firebase/firestore';
import { db } from '../../firebase.config';

@Injectable({ providedIn: 'root' })
export class ComplaintService {

  async addComplaint(complaint: any) {
    const ref = collection(db, 'complaints');
    return await addDoc(ref, {
      ...complaint,
      status: 'Prapta',
      createdAt: new Date()
    });
  }

  async getAllComplaints() {
    const ref = collection(db, 'complaints');
    const q = query(ref, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async getComplaintById(complaintId: string) {
    const ref = collection(db, 'complaints');
    const q = query(ref, where('complaintId', '==', complaintId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }

  async updateStatus(docId: string, status: string) {
    const ref = doc(db, 'complaints', docId);
    return await updateDoc(ref, { status, updatedAt: new Date() });
  }
}