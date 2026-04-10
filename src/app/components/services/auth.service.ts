import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../../firebase.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(private router: Router) {
    onAuthStateChanged(auth, (user) => {
      this.currentUser$.next(user);
    });
  }

  async register(email: string, password: string) {
    return await createUserWithEmailAndPassword(auth, email, password);
  }

  async login(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password);
  }

  async logout() {
    await signOut(auth);
    this.router.navigate(['/login']);
  }

  async resetPassword(email: string) {
    return await sendPasswordResetEmail(auth, email);
  }

  isLoggedIn(): boolean {
    return auth.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }
}