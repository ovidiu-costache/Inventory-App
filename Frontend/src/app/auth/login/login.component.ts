import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  model: LoginRequest = { username: '', password: '' };
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.model.username || !this.model.password) {
      this.errorMessage = 'Please enter both username and password.';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.authService.login(this.model).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.error && err.error.detail) {
          this.errorMessage = err.error.detail;
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Check if backend is running.';
        } else {
          this.errorMessage = 'An error occurred. Status: ' + err.status;
        }
        this.cdr.detectChanges();
      }
    });
  }
}
