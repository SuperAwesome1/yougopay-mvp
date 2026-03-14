import { Component } from '@angular/core';

@Component({
  selector: 'app-parent-dashboard-page',
  templateUrl: './parent-dashboard.component.html'
})
export class ParentDashboardPageComponent {
  displayedColumns = ['name', 'balance', 'dailyLimit', 'spentToday', 'remainingToday'];
  rows = [
    { name: 'Sample Student', balance: 120, dailyLimit: 50, spentToday: 20, remainingToday: 30 }
  ];
}
