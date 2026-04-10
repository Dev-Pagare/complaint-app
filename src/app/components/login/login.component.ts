import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase.config';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  isLoginMode = true;

  loginData = { email: '', password: '' };

  registerData = {
    fullName: '',
    email: '',
    mobile: '',
    area: '',
    password: ''
  };

  suratAreas = [
    'Adajan', 'Althan', 'Amroli', 'Athwa', 'Bhestan',
    'Chowk Bazaar', 'Dindoli', 'Ghod Dod Road', 'Jahangirpura',
    'Katargam', 'Limbayat', 'Magdalla', 'Majura', 'Olpad',
    'Pal', 'Pandesara', 'Piplod', 'Puna', 'Rander',
    'Sachin', 'Salabatpura', 'Sarthana', 'Udhna', 'Varachha', 'Vesu'
  ];

  isLoading        = false;
  errorMessage     = '';
  successMessage   = '';
  showPassword     = false;

  constructor(private router: Router) {}

  switchMode(mode: 'login' | 'register') {
    this.isLoginMode   = (mode === 'login');
    this.errorMessage  = '';
    this.successMessage = '';
  }

  async onLogin() {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }
    this.isLoading    = true;
    this.errorMessage = '';
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        this.loginData.email.trim(),
        this.loginData.password
      );

      localStorage.setItem('loggedInUser', JSON.stringify({
        name:  cred.user.displayName || '',
        email: cred.user.email,
        uid:   cred.user.uid
      }));

      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMessage = this.getFirebaseError(error.code);
    } finally {
      this.isLoading = false;
    }
  }

  async onRegister() {
    const { fullName, email, mobile, area, password } = this.registerData;

    if (!fullName.trim() || !email.trim() || !mobile.trim() || !area || !password) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      this.errorMessage = 'Please enter a valid 10-digit Indian mobile number.';
      return;
    }
    if (password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    try {
      const mobileSnap = await getDocs(
        query(collection(db, 'users'), where('mobile', '==', mobile.trim()))
      );
      if (!mobileSnap.empty) {
        this.errorMessage = '❌ This mobile number is already registered. Please login.';
        this.isLoading = false;
        return;
      }
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: fullName.trim() });

      await setDoc(doc(db, 'users', cred.user.uid), {
        uid:       cred.user.uid,
        name:      fullName.trim(),
        email:     email.trim(),
        mobile:    mobile.trim(),
        area:      area,
        createdAt: serverTimestamp()
      });

      localStorage.setItem('loggedInUser', JSON.stringify({
        name:   fullName.trim(),
        email:  email.trim(),
        mobile: mobile.trim(),
        area:   area,
        uid:    cred.user.uid
      }));

      this.successMessage = '✅ Account created! Redirecting...';
      this.registerData = { fullName: '', email: '', mobile: '', area: '', password: '' };
      setTimeout(() => {
        this.isLoginMode    = true;
        this.successMessage = '';
      }, 1500);

    } catch (error: any) {
      this.errorMessage = this.getFirebaseError(error.code);
    } finally {
      this.isLoading = false;
    }
  }

  getFirebaseError(code: string): string {
    const errors: { [key: string]: string } = {
      'auth/email-already-in-use':    '❌ This email is already registered. Please login.',
      'auth/invalid-email':           '❌ Please enter a valid email address.',
      'auth/weak-password':           '❌ Password should be at least 6 characters.',
      'auth/user-not-found':          '❌ No account found with this email.',
      'auth/wrong-password':          '❌ Incorrect password. Please try again.',
      'auth/invalid-credential':      '❌ Invalid email or password. Please try again.',
      'auth/too-many-requests':       '⚠️ Too many attempts. Please try again later.',
      'auth/network-request-failed':  '⚠️ Network error. Please check your connection.'
    };
    return errors[code] || '❌ Something went wrong. Please try again.';
  }
}
