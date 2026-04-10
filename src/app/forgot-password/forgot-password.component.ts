import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase.config';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  isSubmitted: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router) {}

  async onSubmit() {
    this.errorMessage = '';

    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }
    if (!this.email.includes('@') || !this.email.includes('.')) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.isLoading = true;

    try {
      await sendPasswordResetEmail(auth, this.email.trim());
      this.isSubmitted = true;
    } catch (error: any) {
      switch (error.code) {
        case 'auth/user-not-found':
          this.errorMessage = 'No account found with this email.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Invalid email format.';
          break;
        case 'auth/too-many-requests':
          this.errorMessage = 'Too many requests. Please try again later.';
          break;
        case 'auth/network-request-failed':
          this.errorMessage = 'Network error. Check your internet connection.';
          break;
        default:
          this.errorMessage = 'Something went wrong. Please try again.';
          console.error('Firebase error:', error);
      }
    } finally {
      this.isLoading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}