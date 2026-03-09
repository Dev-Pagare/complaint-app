import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { db } from '../../firebase.config';
import {
  collection, onSnapshot, doc, updateDoc, deleteDoc, query
} from 'firebase/firestore';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  loggedIn = false; username = ''; password = ''; loginError = '';
  searchQuery = '';
  complaints: any[] = [];
  total = 0; pending = 0; inProgress = 0; resolved = 0;
  chartData: any[] = [];
  activeTab = 'dashboard';
  private unsubscribe: any;

  today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  areaData: any[] = [];
  monthlyData: any[] = [];

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
    if (this.unsubscribe) this.unsubscribe();
  }

  login() {
    if (this.username === 'admin' && this.password === 'admin123') {
      this.loggedIn = true; this.loginError = '';
      this.loadFromFirebase();
    } else {
      this.loginError = '❌ Wrong credentials. Use: admin / admin123';
    }
  }

  logout() { this.loggedIn = false; this.username = ''; this.password = ''; }

  setTab(tab: string) { this.activeTab = tab; }

  loadFromFirebase() {
    // Pehle localStorage se turant load karo
    this.loadLocal();

    try {
      const q = query(collection(db, 'complaints'));
      this.unsubscribe = onSnapshot(
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
          // Firebase fail hone par sirf localStorage use karo
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
        c.name?.toLowerCase().includes(q) || c.id?.toLowerCase().includes(q) ||
        c.type?.toLowerCase().includes(q) || c.area?.toLowerCase().includes(q)
      );
    }
    return data;
  }

  async updateStatus(c: any) {
    const local = JSON.parse(localStorage.getItem('complaints') || '[]');
    const idx = local.findIndex((x: any) => x.id === c.id);
    if (idx > -1) { local[idx].status = c.status; localStorage.setItem('complaints', JSON.stringify(local)); }
    if (c._docId) {
      try { await updateDoc(doc(db, 'complaints', c._docId), { status: c.status }); } catch {}
    }
    this.calcStats();
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