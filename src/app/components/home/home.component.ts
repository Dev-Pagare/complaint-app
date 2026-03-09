import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  total = 0; resolved = 0; inProgress = 0; pending = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const c = JSON.parse(localStorage.getItem('complaints') || '[]');
    this.total      = c.length;
    this.resolved   = c.filter((x: any) => x.status === 'Resolved').length;
    this.inProgress = c.filter((x: any) => x.status === 'In Progress').length;
    this.pending    = c.filter((x: any) => x.status === 'Pending').length;
  }

  goToComplaint(type: string) {
    localStorage.setItem('selectedType', type);
    this.router.navigate(['/complaint']);
  }
}