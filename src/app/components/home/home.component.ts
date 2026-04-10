import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { db } from '../../firebase.config';
import { collection, onSnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  total = 0; resolved = 0; inProgress = 0; pending = 0;
  private unsub: any;

  constructor(private router: Router) { }

  ngOnInit(): void {
    try {
      this.unsub = onSnapshot(collection(db, 'complaints'), (snap) => {
        const data = snap.docs.map(d => d.data());
        this.total = data.length;
        this.resolved = data.filter((c: any) => c.status === 'Resolved').length;
        this.inProgress = data.filter((c: any) => c.status === 'In Progress').length;
        this.pending = data.filter((c: any) => c.status === 'Pending').length;
      });
    } catch {
      const local = JSON.parse(localStorage.getItem('complaints') || '[]');
      this.total = local.length;
      this.resolved = local.filter((c: any) => c.status === 'Resolved').length;
      this.inProgress = local.filter((c: any) => c.status === 'In Progress').length;
      this.pending = local.filter((c: any) => c.status === 'Pending').length;
    }
  }

  ngOnDestroy() {
    if (this.unsub) this.unsub();
  }

  goToComplaint(type: string) {
    localStorage.setItem('selectedType', type);
    this.router.navigate(['/complaint']);
  }
}