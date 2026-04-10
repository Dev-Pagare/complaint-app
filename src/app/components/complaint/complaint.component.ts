import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { db } from '../../firebase.config';
import { collection, addDoc } from 'firebase/firestore';
import { OnlyTenDigitsDirective } from '../../directives/only-ten-digits.directive';
import { TrustUrlPipe } from '../../pipes/trust-url.pipe';
import emailjs from '@emailjs/browser';
import jsPDF from 'jspdf';

const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';

@Component({
  selector: 'app-complaint',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, OnlyTenDigitsDirective, TrustUrlPipe],
  templateUrl: './complaint.component.html',
  styleUrls: ['./complaint.component.css']
})
export class ComplaintComponent implements OnInit {

  name         = '';
  email        = '';
  mobile       = '';
  area         = '';
  type         = '';
  description  = '';
  locationText = '';
  latLng: { lat: number; lng: number } | null = null;

  photoFile:    File   | null = null;
  photoPreview: string | null = null;

  submitted       = false;
  loading         = false;
  generatedId     = '';
  errorMsg        = '';
  locationLoading = false;
  copied          = false;
  lastComplaint: any = null;

  suratAreas = [
    'Adajan', 'Althan', 'Amroli', 'Athwa', 'Bhestan',
    'Chowk Bazaar', 'Dindoli', 'Ghod Dod Road', 'Jahangirpura',
    'Katargam', 'Limbayat', 'Magdalla', 'Majura', 'Olpad',
    'Pal', 'Pandesara', 'Piplod', 'Puna', 'Rander',
    'Sachin', 'Salabatpura', 'Sarthana', 'Udhna', 'Varachha', 'Vesu'
  ];

  private priorityMap: Record<string, string> = {
    'Water Supply':         'Urgent',
    'Public Health':        'Urgent',
    'Drainage':             'High',
    'Electricity':          'High',
    'Road Issues':          'High',
    'Stray Animals':        'Medium',
    'Illegal Construction': 'Medium',
    'Cleanliness':          'Medium',
    'Noise Pollution':      'Low',
    'Tax Issues':           'Low',
  };

  getAutoPriority(type: string): string {
    return this.priorityMap[type] ?? 'Medium';
  }

  ngOnInit(): void {
    const saved = localStorage.getItem('selectedType');
    if (saved) { this.type = saved; localStorage.removeItem('selectedType'); }
  }

  onPhotoSelect(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    this.photoFile = file;
    const reader  = new FileReader();
    reader.onload = (e: any) => { this.photoPreview = e.target.result; };
    reader.readAsDataURL(file);
  }

  removePhoto() {
    this.photoFile    = null;
    this.photoPreview = null;
  }

  getLocation() {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
    this.locationLoading = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.latLng      = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.locationText = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        this.locationLoading = false;
      },
      () => {
        this.locationLoading = false;
        alert('Could not get location. Please type your address manually.');
      }
    );
  }

  getMapUrl(): string {
    if (this.latLng) {
      return `https://maps.google.com/maps?q=${this.latLng.lat},${this.latLng.lng}&z=16&output=embed`;
    }
    return `https://maps.google.com/maps?q=Surat+Municipal+Corporation&z=13&output=embed`;
  }

  async submitComplaint() {
    this.errorMsg = '';
    if (!this.name || !this.email || !this.mobile || !this.area || !this.type) {
      this.errorMsg = 'Please fill all required fields.'; return;
    }
    if (!/^\d{10}$/.test(this.mobile)) {
      this.errorMsg = 'Enter a valid 10-digit mobile number.'; return;
    }
    if (!this.email.includes('@')) {
      this.errorMsg = 'Enter a valid email address.'; return;
    }

    this.loading = true;

    const photoBase64 = this.photoPreview || '';

    const id          = 'CMP' + Math.floor(100000 + Math.random() * 900000);
    const date        = new Date().toLocaleDateString('en-IN');
    const autoPriority = this.getAutoPriority(this.type);
    const complaint: any = {
      id, name: this.name, email: this.email,
      mobile: this.mobile, area: this.area,
      type: this.type, priority: autoPriority,
      description: this.description, date, status: 'Pending',
      createdAt: new Date()
    };
    if (this.locationText) complaint.locationText = this.locationText;
    if (this.latLng)       complaint.latLng       = this.latLng;

    if (photoBase64) {
      localStorage.setItem('photo_' + id, photoBase64);
    }

    try {
      await addDoc(collection(db, 'complaints'), complaint);
    } catch (e) {
      console.warn('Firebase save failed, using localStorage:', e);
    }

    const existing = JSON.parse(localStorage.getItem('complaints') || '[]');
    existing.push(complaint);
    localStorage.setItem('complaints', JSON.stringify(existing));

    try {
      if (EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID') {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          to_email:       this.email,
          user_name:      this.name,
          complaint_id:   id,
          complaint_type: this.type,
          priority:       autoPriority,
          area:           this.area,
          date:           date,
        }, EMAILJS_PUBLIC_KEY);
      }
    } catch (e) {
      console.warn('Email notification failed:', e);
    }

    this.generatedId   = id;
    this.lastComplaint = complaint;
    this.submitted     = true;
    this.loading       = false;
  }

  copyId() {
    navigator.clipboard.writeText(this.generatedId).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2500);
    });
  }

  downloadPdf() {
    const doc  = new jsPDF();
    const c    = this.lastComplaint;
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageW, 38, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Surat Municipal Corporation', pageW / 2, 16, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Complaint Registration Receipt', pageW / 2, 27, { align: 'center' });

    doc.setFillColor(239, 246, 255);
    doc.roundedRect(14, 46, pageW - 28, 22, 4, 4, 'F');
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Complaint ID:', 20, 57);
    doc.setFontSize(15);
    doc.text(c.id, pageW - 20, 57, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Please save this ID for tracking your complaint status.', 20, 64);

    doc.setTextColor(30, 41, 59);
    const fields = [
      ['Full Name',        c.name],
      ['Email Address',   c.email],
      ['Mobile Number',   c.mobile],
      ['Area / Ward',     c.area],
      ['Complaint Type',  c.type],
      ['Priority',        c.priority],
      ['Submission Date', c.date],
      ['Status',          c.status],
      ['Description',     c.description || 'N/A'],
    ];
    let y = 82;
    fields.forEach(([label, value], i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 6, pageW - 28, 12, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(label + ':', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.text(String(value || ''), 80, y);
      y += 13;
    });

    doc.setFillColor(30, 58, 138);
    doc.rect(0, 275, pageW, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('complaint@suratmunicipal.gov.in  |  0261-2422725  |  complaint-app-bca.web.app', pageW / 2, 284, { align: 'center' });
    doc.text('Generated on ' + new Date().toLocaleString('en-IN'), pageW / 2, 290, { align: 'center' });

    doc.save(`Complaint_Receipt_${c.id}.pdf`);
  }
}
