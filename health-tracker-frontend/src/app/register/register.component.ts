import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    username: '',
    password: '',
    email: ''
  };
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) { }

  register() {
    if (!this.user.username || !this.user.password || !this.user.email) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    if (!this.validateEmail(this.user.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.apiService.register(this.user).subscribe(response => {
      console.log('User registered', response);
      this.router.navigate(['/login']);
    }, error => {
      console.error('Registration error', error);
      if (error.status === 409) {  
        this.errorMessage = 'An account with this username or email already exists.';
      } else {
        this.errorMessage = 'Registration failed. Please try again.';
      }
    });
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  toggleForm() {
    this.router.navigate(['/login']);
  }
}
