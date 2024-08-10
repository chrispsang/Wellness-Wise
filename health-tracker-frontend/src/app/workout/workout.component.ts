
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

interface Workout {
    id?: number;
    type: string;
    date: string | null;
    startTime: string;
    endTime: string;
    start_time?: string;
    end_time?: string;
    formattedDate?: string;
    formattedStartTime?: string;
    formattedEndTime?: string;
    duration?: number;
}

interface Recommendation {
    text: string;
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
    isEditing: boolean = false;
    editWorkoutId: number | null = null;
    groupedWorkouts: { [date: string]: Workout[] } = {};
    recommendations: string[] = [];
    constructor(private apiService: ApiService) { }

    addWorkout() {
        const startTime = `${this.workout.date}T${this.workout.startTime}`;
        const endTime = `${this.workout.date}T${this.workout.endTime}`;
    
        if (this.isEditing && this.editWorkoutId !== null) {
            this.apiService.updateWorkout(this.editWorkoutId, { ...this.workout, startTime, endTime }).subscribe(response => {
                console.log('Workout updated', response);
                this.isEditing = false;
                this.editWorkoutId = null;
                this.workout = { type: '', date: '', startTime: '', endTime: '' }; 
                this.getWorkouts();
            });
        } else {
            this.apiService.addWorkout({ ...this.workout, startTime, endTime }).subscribe(response => {
                console.log('Workout added', response);
                this.workout = { type: '', date: '', startTime: '', endTime: '' }; 
                this.getWorkouts();
            });
        }
    }
    
    getWorkouts() {
        this.apiService.getWorkouts().subscribe(response => {
            this.groupedWorkouts = response;
        });
    }

    getWorkoutDates(): string[] {
        return Object.keys(this.groupedWorkouts);
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

    editWorkout(workout: Workout) {
        this.isEditing = true;
        this.editWorkoutId = workout.id!;

        console.log('Editing workout:', workout);

        try {
            const date = workout.date || workout.start_time?.split('T')[0];
            const startTime = workout.start_time || `${date}T${workout.startTime}`;
            const endTime = workout.end_time || `${date}T${workout.endTime}`;

            const startDate = new Date(startTime);
            const endDate = new Date(endTime);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Invalid date format');
            }

            const formattedDate = startDate.toISOString().split('T')[0];
            const formattedStartTime = startDate.toTimeString().split(' ')[0].substring(0, 5);
            const formattedEndTime = endDate.toTimeString().split(' ')[0].substring(0, 5);

            console.log('Parsed dates:', { formattedDate, formattedStartTime, formattedEndTime });

            this.workout = {
                type: workout.type,
                date: formattedDate,
                startTime: formattedStartTime,
                endTime: formattedEndTime
            };
        } catch (error) {
            console.error('Error parsing dates:', error);
        }
    }

    cancelEdit() {
        this.isEditing = false;
        this.editWorkoutId = null;
        this.workout = { type: '', date: '', startTime: '', endTime: '' };
    }

    deleteWorkout(id: number) {
        this.apiService.deleteWorkout(id).subscribe(response => {
            console.log('Workout deleted', response);
            this.getWorkouts();
        });
    }

    ngOnInit() {
        this.getWorkouts();
        this.getRecommendations();
    }
}
