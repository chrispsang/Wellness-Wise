import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

interface Goal {
  id?: number;
  type: string;
  target_value: number;
  current_value?: number;
  start_date: string;
  end_date?: string;
}

@Component({
  selector: 'app-goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.css']
})
export class GoalComponent implements OnInit {
  goal: Goal = { type: '', target_value: 0, start_date: '', end_date: '' };
  goals: Goal[] = [];
  isEditing: boolean = false;
  editGoalId: number | null = null;

  constructor(private apiService: ApiService) {}

  addGoal() {
    if (!this.goal.type.trim()) {
      alert('Goal type cannot be empty.');
      return;
    }
    
    if (this.goal.target_value === undefined || this.goal.target_value <= 0) {
      alert('Target value must be a positive integer.');
      return;
    }
  
    if (!Number.isInteger(this.goal.target_value)) {
      alert('Target value must be an integer.');
      return;
    }
    
    if (this.goal.current_value === undefined || this.goal.current_value < 0) {
      alert('Progress must be a non-negative integer.');
      return;
    }
  
    if (!Number.isInteger(this.goal.current_value)) {
      alert('Progress must be an integer.');
      return;
    }
    
    if (!this.goal.start_date.trim()) {
      alert('Start date cannot be empty.');
      return;
    }
    
    if (!this.goal.end_date?.trim()) {
      alert('End date cannot be empty.');
      return;
    }

    // Check if start_date is before end_date
    const startDate = new Date(this.goal.start_date);
    const endDate = new Date(this.goal.end_date);
    if (startDate >= endDate) {
      alert('Start date must be before the end date.');
      return;
    }
  
    if (this.isEditing && this.editGoalId !== null) {
      this.apiService.updateGoal(this.editGoalId, this.goal).subscribe(response => {
        console.log('Goal updated', response);
        this.isEditing = false;
        this.editGoalId = null;
        this.goal = { type: '', target_value: 0, start_date: '', end_date: '' };
        this.getGoals();
      });
    } else {
      this.apiService.addGoal(this.goal).subscribe(response => {
        console.log('Goal added', response);
        this.getGoals();
      });
    }
  }
  

  getGoals() {
    this.apiService.getGoals().subscribe(response => {
      this.goals = response;
    });
  }

  editGoal(goal: Goal) {
    this.isEditing = true;
    this.editGoalId = goal.id!;
    this.goal = {
      ...goal,
      start_date: this.formatDate(goal.start_date),
      end_date: this.formatDate(goal.end_date)
    };
  }

  deleteGoal(id: number) {
    this.apiService.deleteGoal(id).subscribe(response => {
      console.log('Goal deleted', response);
      this.getGoals();
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.editGoalId = null;
    this.goal = { type: '', target_value: 0, start_date: '', end_date: '' };
  }

  ngOnInit() {
    this.getGoals();
  }

  private formatDate(date: string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }
}
