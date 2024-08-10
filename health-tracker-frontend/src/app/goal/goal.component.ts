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
