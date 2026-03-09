import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { db } from '../../firebase.config';
import { collection, addDoc } from 'firebase/firestore';

@Component({
  selector: 'app-complaint',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './complaint.component.html',
  styleUrls: ['./complaint.component.css']
})
export class ComplaintComponent implements OnInit {
  name = ''; mobile = ''; area = ''; type = '';
  description = ''; photoPreview: string | null = null;
  submitted = false; loading = false;
  generatedId = ''; errorMsg = '';

  ngOnInit(): void {
    const saved = localStorage.getItem('selectedType');
    if (saved) { this.type = saved; localStorage.removeItem('selectedType'); }
  }

  onPhotoSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => { this.photoPreview = e.target.result; };
      reader.readAsDataURL(file);
    }
  }

  async submitComplaint() {
    this.errorMsg = '';
    if (!this.name || !this.mobile || !this.area || !this.type || !this.description) {
      this.errorMsg = 'Please fill all required fields.'; return;
    }
    if (!/^\d{10}$/.test(this.mobile)) {
      this.errorMsg = 'Enter a valid 10-digit mobile number.'; return;
    }

    this.loading = true;

    const id   = 'CMP' + Math.floor(100000 + Math.random() * 900000);
    const date = new Date().toLocaleDateString('en-IN');
    const complaint = {
      id, name: this.name, mobile: this.mobile,
      area: this.area, type: this.type,
      description: this.description, date, status: 'Pending'
    };

    const withTimeout = (promise: Promise<any>, ms: number) => {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firebase timeout')), ms)
      );
      return Promise.race([promise, timeout]);
    };

    try {
      await withTimeout(addDoc(collection(db, 'complaints'), complaint), 5000);
    } catch (e) {
      console.warn('Firebase unavailable, saving locally:', e);
    } finally {
      const existing = JSON.parse(localStorage.getItem('complaints') || '[]');
      existing.push(complaint);
      localStorage.setItem('complaints', JSON.stringify(existing));
      this.generatedId = id;
      this.submitted   = true;
      this.loading     = false;
    }
  }
}