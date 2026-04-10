import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  Firestore,
  collection,
  collectionData,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';

interface Complaint {
  id: string;
  complaintId: string;
  category: string;
  description: string;
  status: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  photoUrl?: string;
  timestamp: any;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  timestamp: any;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  activeTab: 'overview' | 'complaints' | 'messages' = 'overview';

  complaints: Complaint[] = [];
  messages: ContactMessage[] = [];
  selectedMessage: ContactMessage | null = null;

  totalComplaints = 0;
  pendingCount = 0;
  inProgressCount = 0;
  resolvedCount = 0;
  rejectedCount = 0;
  unreadCount = 0;

  filterStatus = 'All';
  statusOptions = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

  constructor(private firestore: Firestore, private router: Router) {}

  ngOnInit() {
    this.loadComplaints();
    this.loadMessages();
  }

  loadComplaints() {
    const ref = collection(this.firestore, 'complaints');
    const q = query(ref, orderBy('timestamp', 'desc'));
    collectionData(q, { idField: 'id' }).subscribe((data: any[]) => {
      this.complaints = data;
      this.totalComplaints = data.length;
      this.pendingCount    = data.filter(c => c.status === 'Pending').length;
      this.inProgressCount = data.filter(c => c.status === 'In Progress').length;
      this.resolvedCount   = data.filter(c => c.status === 'Resolved').length;
      this.rejectedCount   = data.filter(c => c.status === 'Rejected').length;
    });
  }

  loadMessages() {
    const ref = collection(this.firestore, 'contactMessages');
    const q = query(ref, orderBy('timestamp', 'desc'));
    collectionData(q, { idField: 'id' }).subscribe((data: any[]) => {
      this.messages = data;
      this.unreadCount = data.filter(m => !m.isRead).length;
    });
  }

  get filteredComplaints(): Complaint[] {
    if (this.filterStatus === 'All') return this.complaints;
    return this.complaints.filter(c => c.status === this.filterStatus);
  }

  setTab(tab: 'overview' | 'complaints' | 'messages') {
    this.activeTab = tab;
    this.selectedMessage = null;
  }

  async updateComplaintStatus(complaintDocId: string, newStatus: string) {
    const ref = doc(this.firestore, 'complaints', complaintDocId);
    await updateDoc(ref, { status: newStatus });
  }

  openMessage(msg: ContactMessage) {
    this.selectedMessage = msg;
    if (!msg.isRead) {
      const ref = doc(this.firestore, 'contactMessages', msg.id);
      updateDoc(ref, { isRead: true });
      msg.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
  }

  async deleteMessage(msgId: string) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    const ref = doc(this.firestore, 'contactMessages', msgId);
    await deleteDoc(ref);
    if (this.selectedMessage?.id === msgId) this.selectedMessage = null;
  }

  replyToMessage(email: string, subject: string) {
    const replySubject = encodeURIComponent('Re: ' + (subject || 'Your message to SMC'));
    window.location.href = `mailto:${email}?subject=${replySubject}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'In Progress': return 'badge-progress';
      case 'Resolved': return 'badge-resolved';
      case 'Rejected': return 'badge-rejected';
      default: return '';
    }
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  logout() {
    localStorage.removeItem('adminLoggedIn');
    this.router.navigate(['/admin-login']);
  }
}