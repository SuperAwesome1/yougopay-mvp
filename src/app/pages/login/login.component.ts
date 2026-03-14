import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.component.html'
})
export class LoginPageComponent {
  confirmationResult: any;

  form = this.fb.group({
    phone: ['', [Validators.required]],
    otp: [''],
    pin: ['', [Validators.minLength(4), Validators.maxLength(4)]]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  async requestOtp() {
    this.authService.setupRecaptcha('recaptcha-container');
    this.confirmationResult = await this.authService.requestOtp(this.form.value.phone as string);
  }

  async verifyOtpAndLogin() {
    await this.confirmationResult.confirm(this.form.value.otp);
    this.router.navigate(['/student/dashboard']);
  }
}
