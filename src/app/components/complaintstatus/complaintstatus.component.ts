import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnlyTenDigitsDirective } from '../../directives/only-ten-digits.directive';
import { db } from '../../firebase.config';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { TrustUrlPipe } from '../../pipes/trust-url.pipe';

@Component({
  selector: 'app-complaintstatus',
  standalone: true,
  imports: [CommonModule, FormsModule, OnlyTenDigitsDirective, TrustUrlPipe],
  templateUrl: './complaintstatus.component.html',
  styleUrls: ['./complaintstatus.component.css']
})
export class ComplaintstatusComponent implements OnDestroy {
  searchMode = 'id'; 
  searchId   = '';
  searchMobile = '';
  complaint: any = null;
  complaints: any[] = [];
  notFound  = false;
  
  private unsubManager: any;
  allComplaints: any[] = [];
  
  constructor() {
    this.listenToFirebase();
  }
  
  listenToFirebase() {
    const q = query(collection(db, 'complaints'));
    this.unsubManager = onSnapshot(q, (snap) => {
      this.allComplaints = snap.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));

      if (this.searchId || this.searchMobile) {
        this.checkStatus();
      }
    });
  }
  
  ngOnDestroy() {
    if (this.unsubManager) {
      this.unsubManager();
    }
  }

  setMode(mode: string) {
    this.searchMode = mode;
    this.complaint  = null;
    this.complaints = [];
    this.notFound   = false;
    this.searchId   = '';
    this.searchMobile = '';
  }

  checkStatus() {
    this.complaint  = null;
    this.complaints = [];
    this.notFound   = false;

    const local = JSON.parse(localStorage.getItem('complaints') || '[]');
    let dataToSearch = this.allComplaints.length > 0 ? this.allComplaints : local;

    if (this.searchMode === 'id') {
      const found = dataToSearch.find((c: any) => c.id === this.searchId.trim().toUpperCase());
      if (found) { this.complaint = found; }
      else       { this.notFound  = true;  }
    } else {
      const found = dataToSearch.filter((c: any) => c.mobile === this.searchMobile.trim());
      if (found.length > 0) { this.complaints = found; }
      else                  { this.notFound   = true;  }
    }
  }

  getBadgeClass(status: string) {
    return {
      'status-resolved': status === 'Resolved',
      'status-pending':  status === 'Pending',
      'status-progress': status === 'In Progress'
    };
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
  
  getMapUrl(latLng: any): string {
     if (latLng) {
      return `https://maps.google.com/maps?q=${latLng.lat},${latLng.lng}&z=16&output=embed`;
    }
    return '';
  }
}