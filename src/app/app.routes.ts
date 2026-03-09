import { StatusComponent } from './components/status/status.component';
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HomeComponent }            from './components/home/home.component';
import { ComplaintComponent }       from './components/complaint/complaint.component';
import { ComplaintstatusComponent } from './components/complaintstatus/complaintstatus.component';
import { AdminComponent }           from './components/admin/admin.component';
import { LoginComponent }           from './components/login/login.component';

const authGuard = () => {
  const router = inject(Router);
  const user = localStorage.getItem('loggedInUser');
  if (user) {
    return true;
  } else {
    router.navigate(['/login'], { queryParams: { returnUrl: '/complaint' } });
    return false;
  }
};

export const routes: Routes = [
  { path: '',          redirectTo: 'home', pathMatch: 'full' },
  { path: 'home',      component: HomeComponent },
  { path: 'complaint', component: ComplaintComponent, canActivate: [authGuard] },
  { path: 'status', component: ComplaintstatusComponent },
  { path: 'admin',     component: AdminComponent },
  { path: 'login',     component: LoginComponent },
];