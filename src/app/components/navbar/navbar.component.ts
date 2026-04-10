import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase.config';
import { LanguageService, Lang } from '../../services/language.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private unsubscribeAuth: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      this.isLoggedIn = !!user;
    });
  }

  ngOnDestroy() {
    if (this.unsubscribeAuth) this.unsubscribeAuth();
  }

  async logout() {
    await signOut(auth);
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/home']);
  }
}