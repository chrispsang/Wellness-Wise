import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };
  errorMessage: string = ''; 

  constructor(private apiService: ApiService, private router: Router) { }

  login() {
    this.apiService.login(this.credentials).subscribe(response => {
      console.log('User logged in', response);
      localStorage.setItem('token', response.accessToken); 
      localStorage.setItem('userId', response.userId); 
      this.router.navigate(['/dashboard']); 
    }, error => {
      console.error('Login error', error);
      this.errorMessage = error.error.message; 
    });
  }

  toggleForm() {
    this.router.navigate(['/register']);
  }
}
