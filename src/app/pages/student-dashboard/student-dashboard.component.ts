import { Component } from '@angular/core';

@Component({
  selector: 'app-student-dashboard-page',
  templateUrl: './student-dashboard.component.html'
})
export class StudentDashboardPageComponent {
  balance = 120;
  remaining = 30;
  transactions = [
    { type: 'DEBIT', amount: 10, description: 'Lunch' },
    { type: 'TOPUP', amount: 50, description: 'Parent top-up' }
  ];
}
