import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  mobile   = '';
  password = '';

  showRegister = false;
  regName      = '';
  regMobile    = '';
  regPassword  = '';
  regArea      = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  login() {
    if (!this.mobile || !this.password) {
      alert('Please fill all fields.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const found = users.find((u: any) => u.mobile === this.mobile && u.password === this.password);

    if (!found) {
      alert('❌ Incorrect mobile number or password! Please register first.');
      return;
    }

    localStorage.setItem('loggedInUser', JSON.stringify({
      name:   found.name,
      mobile: found.mobile,
      area:   found.area
    }));

    alert('✅ Login successful! Welcome ' + found.name);

    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    this.router.navigateByUrl(returnUrl);
  }

  register() {
    if (!this.regName || !this.regMobile || !this.regPassword || !this.regArea) {
      alert('Please fill all fields.');
      return;
    }

    if (this.regMobile.length !== 10) {
      alert('❌ Mobile number must be exactly 10 digits!');
      return;
    }

    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const exists = users.find((u: any) => u.mobile === this.regMobile);

    if (exists) {
      alert('❌ This mobile number is already registered! Please login.');
      return;
    }

    users.push({
      name:     this.regName,
      mobile:   this.regMobile,
      password: this.regPassword,
      area:     this.regArea
    });
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    alert('✅ Registration successful! You can now login.');
    this.showRegister = false;

    this.regName = '';
    this.regMobile = '';
    this.regPassword = '';
    this.regArea = '';
  }
}