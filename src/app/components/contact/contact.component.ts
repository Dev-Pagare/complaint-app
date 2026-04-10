import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { db } from '../../firebase.config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  isSubmitted = false;
  isLoading   = false;
  errorMessage = '';

  smcOffices = [
    {
      icon: '🏛️',
      title: 'SMC Headquarters',
      address: 'Muglisara, Surat — 395001, Gujarat',
      timing: 'Mon – Sat: 10:30 AM – 6:00 PM'
    },
    {
      icon: '📞',
      title: 'Helpline',
      address: 'Toll Free: 1800-233-7779',
      timing: '24x7 Available'
    },
    {
      icon: '✉️',
      title: 'Email',
      address: 'commissioner@suratmunicipal.gov.in',
      timing: 'Reply within 1–2 working days'
    }
  ];

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 10);
    this.formData.phone = input.value;
  }

  async onSubmit() {
    this.errorMessage = '';

    if (!this.formData.name.trim()) {
      this.errorMessage = 'Please enter your name.';
      return;
    }
    if (!this.formData.email.trim() || !this.formData.email.includes('@')) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }
    if (!this.formData.message.trim()) {
      this.errorMessage = 'Please write your message.';
      return;
    }

    this.isLoading = true;

    try {
      await addDoc(collection(db, 'contact_messages'), {
        name:      this.formData.name.trim(),
        email:     this.formData.email.trim(),
        phone:     this.formData.phone.trim() || 'N/A',
        subject:   this.formData.subject || 'General',
        message:   this.formData.message.trim(),
        status:    'unread',
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric'
        })
      });

      this.isSubmitted = true;
    } catch (err) {
      console.error('Firestore error:', err);
      this.errorMessage = 'Failed to send message. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  resetForm() {
    this.isSubmitted = false;
    this.formData = { name: '', email: '', phone: '', subject: '', message: '' };
    this.errorMessage = '';
  }
}