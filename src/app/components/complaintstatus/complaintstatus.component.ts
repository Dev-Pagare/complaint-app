import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-complaintstatus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complaintstatus.component.html',
  styleUrls: ['./complaintstatus.component.css']
})
export class ComplaintstatusComponent {
  searchMode = 'id'; // 'id' ya 'mobile'
  searchId   = '';
  searchMobile = '';
  complaint: any = null;
  complaints: any[] = [];
  notFound  = false;

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
    const all = JSON.parse(localStorage.getItem('complaints') || '[]');

    if (this.searchMode === 'id') {
      const found = all.find((c: any) => c.id === this.searchId.trim().toUpperCase());
      if (found) { this.complaint = found; }
      else       { this.notFound  = true;  }
    } else {
      const found = all.filter((c: any) => c.mobile === this.searchMobile.trim());
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
}