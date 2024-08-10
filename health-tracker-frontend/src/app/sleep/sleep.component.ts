import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

interface Sleep {
  id?: number;
  date: string;
  startTime: string;
  endTime: string;
  hours?: number;
}

@Component({
  selector: 'app-sleep',
  templateUrl: './sleep.component.html',
  styleUrls: ['./sleep.component.css']
})
export class SleepComponent implements OnInit {
  sleep: Sleep = {
    date: '',
    startTime: '',
    endTime: ''
  };
  groupedSleeps: { [date: string]: Sleep[] } = {};
  isEditing = false;
  editSleepId: number | null = null;
  sleepTips: string[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.getSleeps();
    this.getSleepRecommendations();
  }

  addSleep() {
    if (!this.sleep.date || !this.sleep.startTime || !this.sleep.endTime) {
      console.error('Date, start time, or end time is missing');
      return;
    }

    if (this.isEditing && this.editSleepId !== null) {
      this.apiService.updateSleep(this.editSleepId, this.sleep).subscribe(
        () => {
          this.getSleeps();
          this.cancelEdit();
        },
        (error) => {
          console.error('Error updating sleep:', error);
        }
      );
    } else {
      this.apiService.addSleep(this.sleep).subscribe(
        () => {
          this.getSleeps();
        },
        (error) => {
          console.error('Error adding sleep:', error);
        }
      );
    }
  }

  editSleep(sleep: Sleep) {
    console.log('Editing sleep:', sleep); 
    const dateObject = new Date(sleep.date);
    const localDate = new Date(dateObject.getTime() - dateObject.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
    this.sleep = { 
      ...sleep,
      date: localDate 
    };
    this.isEditing = true;
    this.editSleepId = sleep.id ?? null;
  }
  
  
  deleteSleep(id: number | undefined) {
    if (id !== undefined) {
      this.apiService.deleteSleep(id).subscribe(
        () => {
          this.getSleeps();
        },
        (error) => {
          console.error('Error deleting sleep:', error);
        }
      );
    } else {
      console.error('Sleep ID is undefined');
    }
  }

  cancelEdit() {
    this.sleep = {
      date: '',
      startTime: '',
      endTime: ''
    };
    this.isEditing = false;
    this.editSleepId = null;
  }

  getSleeps() {
    this.apiService.getSleeps().subscribe(
      (response) => {
        this.groupedSleeps = this.groupByDate(response);
      },
      (error) => {
        console.error('Error fetching sleeps:', error);
      }
    );
  }

  groupByDate(sleeps: Sleep[]): { [date: string]: Sleep[] } {
    return sleeps.reduce((groups: { [date: string]: Sleep[] }, sleep) => {
      const date = sleep.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(sleep);
      return groups;
    }, {});
  }

  get keys() {
    return Object.keys;
  }

  getSleepRecommendations() {
    this.apiService.getSleepRecommendations().subscribe(
      (response: any) => {
        console.log('Received recommendations:', response); 
        this.sleepTips = response.recommendations || [];
      },
      (error) => {
        console.error('Error fetching sleep recommendations:', error);
      }
    );
  }
  
  
}