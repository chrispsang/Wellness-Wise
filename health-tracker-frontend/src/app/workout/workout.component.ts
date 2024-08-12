
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

interface Workout {
  id?: number;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  duration?: number;
}

@Component({
  selector: 'app-workout',
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.css']
})
export class WorkoutComponent implements OnInit {
  workout: Workout = {
    type: '',
    date: '',
    startTime: '',
    endTime: ''
  };
  groupedWorkouts: { [date: string]: Workout[] } = {};
  isEditing = false;
  editWorkoutId: number | null = null;
  recommendations: string[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.getWorkouts();
    this.getRecommendations();
  }

  addWorkout() {
    if (!this.workout.date.trim() || !this.workout.startTime.trim() || !this.workout.endTime.trim()) {
      alert('Please fill in all fields.');
      return;
    }
  
    if (this.isEditing && this.editWorkoutId !== null) {
      this.apiService.updateWorkout(this.editWorkoutId, this.workout).subscribe(
        () => {
          this.getWorkouts();
          this.cancelEdit();  
        },
        (error) => {
          console.error('Error updating workout:', error);
        }
      );
    } else {
      this.apiService.addWorkout(this.workout).subscribe(
        () => {
          this.getWorkouts();
          this.cancelEdit(); 
        },
        (error) => {
          console.error('Error adding workout:', error);
        }
      );
    }
  }  

  editWorkout(workout: Workout) {
    const dateObject = new Date(workout.date);
    const localDate = new Date(dateObject.getTime() - dateObject.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    this.workout = { 
        ...workout,
        date: localDate 
      };
    this.isEditing = true;
    this.editWorkoutId = workout.id ?? null;
  }

  deleteWorkout(id: number | undefined) {
    if (id !== undefined) {
      this.apiService.deleteWorkout(id).subscribe(
        () => {
          this.getWorkouts();
        },
        (error) => {
          console.error('Error deleting workout:', error);
        }
      );
    } else {
      console.error('Workout ID is undefined');
    }
  }

  cancelEdit() {
    this.workout = {
      type: '',
      date: '',
      startTime: '',
      endTime: ''
    };
    this.isEditing = false;
    this.editWorkoutId = null;
  }

  getWorkouts() {
    this.apiService.getWorkouts().subscribe(
      (response) => {
        this.groupedWorkouts = this.groupByDate(response);
      },
      (error) => {
        console.error('Error fetching workouts:', error);
      }
    );
  }

  groupByDate(workouts: Workout[]): { [date: string]: Workout[] } {
    return workouts.reduce((groups: { [date: string]: Workout[] }, workout) => {
      const date = workout.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(workout);
      return groups;
    }, {});
  }

  get keys() {
    return Object.keys;
  }

  getRecommendations() {
    this.apiService.getRecommendations().subscribe({
        next: response => {
            console.log('Recommendations response:', response);
            this.recommendations = response.recommendations || [];
        },
        error: error => {
            console.error('Error fetching recommendations:', error);
        }
    });
}
}

