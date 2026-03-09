import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-login-container">
      <div class="admin-login-box">
        <div class="admin-icon">🛡️</div>
        <h2>Admin Panel</h2>
        <p>Authorized access only</p>
        <div class="form-group">
          <label>Username</label>
          <input type="text" [(ngModel)]="username" placeholder="Enter username" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" [(ngModel)]="password" placeholder="Enter password" />
        </div>
        <button (click)="adminLogin()">🔐 Login</button>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-container{display:flex;justify-content:center;align-items:center;min-height:85vh;background:#f5f5f5;}
    .admin-login-box{background:white;padding:40px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.1);max-width:380px;width:100%;text-align:center;}
    .admin-icon{font-size:3rem;margin-bottom:10px;}
    h2{color:#1565c0;margin-bottom:5px;}
    p{color:#888;margin-bottom:25px;}
    .form-group{text-align:left;margin-bottom:18px;}
    .form-group label{display:block;font-weight:bold;color:#555;margin-bottom:6px;}
    .form-group input{width:100%;padding:12px 15px;border:2px solid #ddd;border-radius:8px;font-size:1rem;box-sizing:border-box;}
    .form-group input:focus{border-color:#1565c0;outline:none;}
    button{width:100%;background:#1565c0;color:white;border:none;padding:14px;border-radius:8px;font-size:1rem;font-weight:bold;cursor:pointer;}
    button:hover{background:#0d47a1;}
  `]
})
export class AdminLoginComponent {
  username = '';
  password = '';

  // Ye credentials change kar sakte ho
  ADMIN_USER = 'admin';
  ADMIN_PASS = 'surat@123';

  constructor(private router: Router) {}

  adminLogin() {
    if (this.username === this.ADMIN_USER && this.password === this.ADMIN_PASS) {
      localStorage.setItem('adminLoggedIn', 'true');
      this.router.navigate(['/admin']);
    } else {
      alert('❌ Invalid credentials!');
    }
  }
}