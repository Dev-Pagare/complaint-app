import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { db } from '../../firebase.config';
import { collection, onSnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements OnInit, OnDestroy {
  total      = 0;
  resolved   = 0;
  inProgress = 0;
  pending    = 0;
  private unsub: any;

  ngOnInit() {
    try {
      this.unsub = onSnapshot(collection(db, 'complaints'), (snap) => {
        const data = snap.docs.map(d => d.data());
        this.total      = data.length;
        this.resolved   = data.filter((c: any) => c.status === 'Resolved').length;
        this.inProgress = data.filter((c: any) => c.status === 'In Progress').length;
        this.pending    = data.filter((c: any) => c.status === 'Pending').length;
      });
    } catch {
      const local = JSON.parse(localStorage.getItem('complaints') || '[]');
      this.total      = local.length;
      this.resolved   = local.filter((c: any) => c.status === 'Resolved').length;
      this.inProgress = local.filter((c: any) => c.status === 'In Progress').length;
      this.pending    = local.filter((c: any) => c.status === 'Pending').length;
    }
  }

  ngOnDestroy() {
    if (this.unsub) this.unsub();
  }
}