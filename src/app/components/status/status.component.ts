import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent {
  mobile = '';
  searched = false;
  results: any[] = [];

  search() {
    if (!this.mobile || this.mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    const all = JSON.parse(localStorage.getItem('complaints') || '[]');
    this.results = all.filter((c: any) => c.mobile === this.mobile);
    this.searched = true;
  }

  getBadgeClass(status: string) {
    return {
      'status-resolved': status === 'Resolved',
      'status-pending':  status === 'Pending',
      'status-progress': status === 'In Progress'
    };
  }

  clear() {
    this.mobile = '';
    this.searched = false;
    this.results = [];
  }
}