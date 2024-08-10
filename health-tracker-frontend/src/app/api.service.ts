
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  register(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/login`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('userId', response.userId);
      })
    );
  }

  addWorkout(workout: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.post(`${this.baseUrl}/workouts`, workout, { headers });
  }

  getWorkouts(): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.get(`${this.baseUrl}/workouts`, { headers });
  }

  updateWorkout(id: number, workout: any): Observable<any> { 
    const headers = this.createAuthorizationHeader();
    return this.http.put(`${this.baseUrl}/workouts/${id}`, workout, { headers });
  }

  deleteWorkout(id: number): Observable<any> { 
    const headers = this.createAuthorizationHeader();
    return this.http.delete(`${this.baseUrl}/workouts/${id}`, { headers });
  }

  addDiet(diet: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.post(`${this.baseUrl}/diet`, diet, { headers });
  }

  getDiets(): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.get(`${this.baseUrl}/diet`, { headers });
  }
  
  updateDiet(id: number, diet: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.put(`${this.baseUrl}/diet/${id}`, diet, { headers });
  }
  
  deleteDiet(id: number): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.delete(`${this.baseUrl}/diet/${id}`, { headers });
  }

  getDietRecommendations(): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any>(`${this.baseUrl}/diet/recommendations`, { headers });
  }

  addSleep(sleep: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.post(`${this.baseUrl}/sleep`, sleep, { headers });
  }
  
  getSleeps(): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.get(`${this.baseUrl}/sleep`, { headers });
  }

  updateSleep(id: number, sleep: any): Observable<any> {  
    const headers = this.createAuthorizationHeader();
    return this.http.put(`${this.baseUrl}/sleep/${id}`, sleep, { headers });
  }

  deleteSleep(id: number): Observable<any> { 
    const headers = this.createAuthorizationHeader();
    return this.http.delete(`${this.baseUrl}/sleep/${id}`, { headers });
  }

  getSleepRecommendations(): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any>(`${this.baseUrl}/sleep/recommendations`, { headers });
}



  addMood(mood: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.post(`${this.baseUrl}/moods`, mood, { headers });
  }

  getMoods(): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.get(`${this.baseUrl}/moods`, { headers });
  }
  
  updateMood(id: string, mood: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.put(`${this.baseUrl}/moods/${id}`, mood, { headers });
  }
  
  deleteMood(id: string): Observable<any> { // Add deleteMood method
    const headers = this.createAuthorizationHeader();
    return this.http.delete(`${this.baseUrl}/moods/${id}`, { headers });
  }

  getMoodTrends(): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.get(`${this.baseUrl}/moods/trends`, { headers });
  }

  addGoal(goal: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.post(`${this.baseUrl}/goals`, goal, { headers });
  }

  getGoals(): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.get(`${this.baseUrl}/goals`, { headers });
  }

  updateGoal(id: number, goal: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.put(`${this.baseUrl}/goals/${id}`, goal, { headers });
  }

  deleteGoal(id: number): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.delete(`${this.baseUrl}/goals/${id}`, { headers });
  }

  getRecommendations(): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any>(`${this.baseUrl}/workouts/recommendations`, { headers });
}


  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  private createAuthorizationHeader(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}
