import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { db } from '../../firebase.config';
import {
  collection, onSnapshot, doc, updateDoc,
  deleteDoc, query, orderBy
} from 'firebase/firestore';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  loggedIn = false;
  username = '';
  password = '';
  loginError = '';

  complaints: any[] = [];
  searchQuery = '';
  total = 0;
  pending = 0;
  inProgress = 0;
  resolved = 0;
  chartData: any[] = [];
  areaData: any[] = [];
  monthlyData: any[] = [];
  private unsubComplaints: any;

  messages: any[] = [];
  unreadCount = 0;
  activeMessageId: string | null = null;
  private unsubMessages: any;

  activeTab = 'dashboard';
  selectedPhoto = '';

  today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  ngOnInit(): void {
    const nav  = document.querySelector('app-navbar') as HTMLElement;
    const foot = document.querySelector('app-footer') as HTMLElement;
    if (nav)  nav.style.display = 'none';
    if (foot) foot.style.display = 'none';
  }

  ngOnDestroy(): void {
    const nav  = document.querySelector('app-navbar') as HTMLElement;
    const foot = document.querySelector('app-footer') as HTMLElement;
    if (nav)  nav.style.display = '';
    if (foot) foot.style.display = '';
    if (this.unsubComplaints) this.unsubComplaints();
    if (this.unsubMessages)   this.unsubMessages();
  }

  login() {
    if (this.username === 'admin' && this.password === 'admin123') {
      this.loggedIn = true;
      this.loginError = '';
      this.loadFromFirebase();
      this.loadMessages();
    } else {
      this.loginError = '❌ Wrong credentials. Use: admin / admin123';
    }
  }

  logout() {
    this.loggedIn = false;
    this.username = '';
    this.password = '';
    if (this.unsubComplaints) this.unsubComplaints();
    if (this.unsubMessages)   this.unsubMessages();
  }

  setTab(tab: string) { this.activeTab = tab; }

  openPhoto(url: string) { this.selectedPhoto = url; }
  closePhoto() { this.selectedPhoto = ''; }

  loadFromFirebase() {
    this.loadLocal();
    try {
      const q = query(collection(db, 'complaints'));
      this.unsubComplaints = onSnapshot(
        q,
        (snap) => {
          const firebaseData = snap.docs.map(d => ({ ...d.data(), _docId: d.id }));
          const local = JSON.parse(localStorage.getItem('complaints') || '[]');
          const allIds = new Set(firebaseData.map((c: any) => c.id));
          const localOnly = local.filter((c: any) => !allIds.has(c.id));
          this.complaints = [...firebaseData, ...localOnly];
          this.calcStats();
        },
        (error) => {
          console.warn('Firebase error, using local data:', error);
          this.loadLocal();
        }
      );
    } catch (e) {
      this.loadLocal();
    }
  }

  loadLocal() {
    this.complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    this.calcStats();
  }

  calcStats() {
    this.total      = this.complaints.length;
    this.pending    = this.complaints.filter(c => c.status === 'Pending').length;
    this.inProgress = this.complaints.filter(c => c.status === 'In Progress').length;
    this.resolved   = this.complaints.filter(c => c.status === 'Resolved').length;
    this.complaints = this.complaints.map(c => ({
      ...c,
      photoUrl: c.photoUrl || localStorage.getItem('photo_' + c.id) || ''
    }));
    this.buildCharts();
  }

  buildCharts() {
    const types: any = {};
    const areas: any = {};
    this.complaints.forEach(c => {
      types[c.type] = (types[c.type] || 0) + 1;
      areas[c.area] = (areas[c.area] || 0) + 1;
    });
    const colors = ['#1a56db','#10b981','#f97316','#7c3aed','#ef4444','#06b6d4'];
    this.chartData = Object.keys(types).map((k, i) => ({
      label: k, value: types[k], color: colors[i % colors.length]
    }));
    this.areaData = Object.keys(areas).map((k, i) => ({
      label: k, value: areas[k], color: colors[i % colors.length]
    }));
  }

  filteredComplaints() {
    let data = [...this.complaints];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      data = data.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.id?.toLowerCase().includes(q) ||
        c.type?.toLowerCase().includes(q) ||
        c.area?.toLowerCase().includes(q)
      );
    }
    return data;
  }

  async updateStatus(c: any) {
    const local = JSON.parse(localStorage.getItem('complaints') || '[]');
    const idx = local.findIndex((x: any) => x.id === c.id);
    if (idx > -1) {
      local[idx].status = c.status;
      localStorage.setItem('complaints', JSON.stringify(local));
    }
    if (c._docId) {
      try {
        await updateDoc(doc(db, 'complaints', c._docId), { status: c.status });
      } catch {}
    }
    this.calcStats();
  }

  async updateDueDate(c: any, event: any) {
    const newDate = event.target.value;
    c.dueDate = newDate;
    const local = JSON.parse(localStorage.getItem('complaints') || '[]');
    const idx = local.findIndex((x: any) => x.id === c.id);
    if (idx > -1) {
      local[idx].dueDate = newDate;
      localStorage.setItem('complaints', JSON.stringify(local));
    }
    if (c._docId) {
      try {
        await updateDoc(doc(db, 'complaints', c._docId), { dueDate: newDate });
      } catch {}
    }
  }

  async deleteComplaint(c: any, i: number) {
    if (!confirm('Delete this complaint?')) return;
    this.complaints.splice(i, 1);
    const local = JSON.parse(localStorage.getItem('complaints') || '[]');
    const filtered = local.filter((x: any) => x.id !== c.id);
    localStorage.setItem('complaints', JSON.stringify(filtered));
    if (c._docId) {
      try { await deleteDoc(doc(db, 'complaints', c._docId)); } catch {}
    }
    this.calcStats();
  }

  loadMessages() {
    try {
      const q = query(
        collection(db, 'contact_messages'),
        orderBy('createdAt', 'desc')
      );
      this.unsubMessages = onSnapshot(
        q,
        (snap) => {
          this.messages = snap.docs.map(d => ({ ...d.data(), _docId: d.id }));
          this.unreadCount = this.messages.filter(m => m.status === 'unread').length;
        },
        (error) => {
          console.warn('Messages load error:', error);
        }
      );
    } catch (e) {
      console.warn('Messages listener error:', e);
    }
  }

  toggleMessage(m: any) {
    if (m.status === 'unread' && m._docId) {
      m.status = 'read';
      updateDoc(doc(db, 'contact_messages', m._docId), { status: 'read' }).catch(() => {});
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
    this.activeMessageId = this.activeMessageId === m._docId ? null : m._docId;
  }

  async deleteMessage(m: any, i: number) {
    if (!confirm('Delete this message?')) return;
    this.messages.splice(i, 1);
    if (m.status === 'unread') {
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
    if (m._docId) {
      try { await deleteDoc(doc(db, 'contact_messages', m._docId)); } catch {}
    }
  }

  replyViaEmail(email: string, name: string, subject: string) {
    const sub  = encodeURIComponent(`Re: ${subject} — SMC Response`);
    const body = encodeURIComponent(
      `Dear ${name},\n\nThank you for contacting Surat Municipal Corporation.\n\n` +
      `We have received your message and will address it shortly.\n\n` +
      `Best regards,\nSurat Municipal Corporation\n1800-233-7779`
    );
    window.open(`mailto:${email}?subject=${sub}&body=${body}`, '_blank');
  }

  markAllRead() {
    this.messages.forEach(m => {
      if (m.status === 'unread' && m._docId) {
        m.status = 'read';
        updateDoc(doc(db, 'contact_messages', m._docId), { status: 'read' }).catch(() => {});
      }
    });
    this.unreadCount = 0;
  }

  getBadgeClass(status: string) {
    return {
      'status-resolved': status === 'Resolved',
      'status-pending':  status === 'Pending',
      'status-progress': status === 'In Progress'
    };
  }

  getBarWidth(value: number) {
    return this.total > 0 ? (value / this.total) * 100 : 0;
  }

  getPriorityColor(priority: string) {
    switch (priority) {
      case 'Low': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'High': return '#f97316';
      case 'Urgent': return '#ef4444';
      default: return '#64748b';
    }
  }

  getResolutionRate() {
    return this.total > 0 ? ((this.resolved / this.total) * 100).toFixed(1) : '0';
  }

  clearLocal() {
    if (confirm('Clear all local complaints data?')) {
      localStorage.removeItem('complaints');
      this.complaints = [];
      this.calcStats();
    }
  }
}