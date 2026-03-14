import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginPageComponent } from './pages/login/login.component';
import { RegisterPageComponent } from './pages/register/register.component';
import { ParentDashboardPageComponent } from './pages/parent-dashboard/parent-dashboard.component';
import { StudentDashboardPageComponent } from './pages/student-dashboard/student-dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'parent/dashboard', component: ParentDashboardPageComponent, canActivate: [AuthGuard] },
  { path: 'parent/students', component: ParentDashboardPageComponent, canActivate: [AuthGuard] },
  { path: 'parent/wallet/:studentId', component: ParentDashboardPageComponent, canActivate: [AuthGuard] },
  { path: 'student/dashboard', component: StudentDashboardPageComponent, canActivate: [AuthGuard] },
  { path: 'student/transactions', component: StudentDashboardPageComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
