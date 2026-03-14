import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-register-page',
  templateUrl: './register.component.html'
})
export class RegisterPageComponent {
  form = this.fb.group({
    phone: ['', Validators.required],
    otp: [''],
    pin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
    role: ['PARENT', Validators.required]
  });

  constructor(private fb: FormBuilder) {}
}
