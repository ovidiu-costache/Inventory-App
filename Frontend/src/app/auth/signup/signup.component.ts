import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SignUpRequest } from '../../models/user.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html'
})
export class SignupComponent {
  model: SignUpRequest = { username: '', fullName: '', password: '', confirmPassword: '' };
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.model.username || !this.model.fullName || !this.model.password) {
      this.errorMessage = 'Please fill out all fields.';
      this.cdr.detectChanges();
      return;
    }

    if (this.model.password !== this.model.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.authService.signup(this.model).subscribe({
      next: () => {
        // Redirect to login after successful signup
        this.router.navigate(['/login']);
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
