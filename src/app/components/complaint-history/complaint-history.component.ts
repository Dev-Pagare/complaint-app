import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { db, auth } from '../../firebase.config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { CountByStatusPipe } from '../../pipes/count-by-status.pipe';

@Component({
  selector: 'app-complaint-history',
  standalone: true,
  imports: [CommonModule, RouterModule, CountByStatusPipe],
  templateUrl: './complaint-history.component.html',
  styleUrls: ['./complaint-history.component.css']
})
export class ComplaintHistoryComponent implements OnInit, OnDestroy {
  complaints: any[] = [];
  loading = true;
  userEmail = '';
  private unsubSnapshot: any;
  private unsubAuth: any;

  ngOnInit() {
    this.unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        this.userEmail = user.email;
        this.loadComplaints(user.email);
      } else {
        this.loading = false;
      }
    });
  }

  loadComplaints(email: string) {
    const q = query(
      collection(db, 'complaints'),
      where('email', '==', email)
    );
    this.unsubSnapshot = onSnapshot(q, (snap) => {
      this.complaints = snap.docs
        .map(d => ({ ...d.data(), _docId: d.id }))
        .sort((a: any, b: any) => {

          const aTime = a.createdAt?.seconds ?? 0;
          const bTime = b.createdAt?.seconds ?? 0;
          return bTime - aTime;
        });
      this.loading = false;
    });
  }

  getStatusClass(status: string): string {
    if (status === 'Resolved') return 'badge-resolved';
    if (status === 'In Progress') return 'badge-inprogress';
    return 'badge-pending';
  }

  getPriorityColor(priority: string): string {
    const map: Record<string, string> = {
      'Urgent': '#ef4444', 'High': '#f97316',
      'Medium': '#f59e0b', 'Low': '#10b981'
    };
    return map[priority] ?? '#94a3b8';
  }

  ngOnDestroy() {
    if (this.unsubSnapshot) this.unsubSnapshot();
    if (this.unsubAuth) this.unsubAuth();
  }
}
