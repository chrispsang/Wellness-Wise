
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

interface Mood {
  id?: string;
  mood: string;
  notes: string;
  formattedDate?: string;
  insights?: string;
}

interface MoodTrend {
  date: string;
  sentiment: number | null;
}


@Component({
  selector: 'app-mood',
  templateUrl: './mood.component.html',
  styleUrls: ['./mood.component.css']
})
export class MoodComponent implements OnInit {
  mood: Mood = { mood: '', notes: '' };
  groupedMoods: { [date: string]: Mood[] } = {};
  moodTrends: { date: string, sentiment: number }[] = [];
  isEditing = false;
  editMoodId: string | null = null;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.fetchMoods();
    this.fetchMoodTrends();
  }

  fetchMoods(): void {
    this.apiService.getMoods().subscribe(
      data => this.groupedMoods = data,
      error => console.error(error)
    );
  }

  fetchMoodTrends(): void {
    this.apiService.getMoodTrends().subscribe(
      (data: MoodTrend[]) => {
        console.log('Mood Trends Data:', data);
  
        // Process the data
        this.moodTrends = data.map((trend: MoodTrend) => ({
          ...trend,
          sentiment: trend.sentiment !== null ? trend.sentiment : 0
        }));
  
        console.log('Processed Mood Trends Data:', this.moodTrends);
  
        // Render the chart
        this.renderChart();
      },
      error => console.error(error)
    );
  }
  
// Define generateInsights function here
generateInsights(moodScore: number): string {
  if (moodScore > 2) {
    return 'You seem to be in a very positive mood! Keep up the good vibes.';
  } else if (moodScore >= 0) {
    return 'Your mood is neutral. Try engaging in activities you enjoy to boost your mood.';
  } else if (moodScore > -2) {
    return 'You seem slightly down. Consider talking to a friend or doing something relaxing.';
  } else {
    return 'You seem to be feeling negative. It might help to reach out to a loved one or practice mindfulness.';
  }
}

renderChart(): void {
  const ctx = document.getElementById('moodTrendsChart') as HTMLCanvasElement;
  if (!ctx) {
    console.error('Canvas element not found.');
    return;
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: this.moodTrends.map(trend => trend.date),
      datasets: [{
        label: 'Mood Sentiment Score',
        data: this.moodTrends.map(trend => trend.sentiment),
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            tooltipFormat: 'MMM dd, yyyy',
            displayFormats: {
              day: 'MMM dd'
            }
          },
          title: {
            display: true,
            text: 'Date'
          },
          ticks: {
            autoSkip: true,   
            maxRotation: 45,  
            minRotation: 0,
            padding: 10       
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Sentiment Score'
          },
          ticks: {
            padding: 10       
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const score = tooltipItem.raw as number;
              const sentimentLabel = `Sentiment Score: ${score}`;
              const insight = this.generateInsights(score);
              return [sentimentLabel, `Insight: ${insight}`];
            }
          }
        }
      }
    }
  });
}


  
addMood(): void {
  if (!this.mood.mood.trim()) {
    console.error('Mood cannot be empty.');
    return;
  }

  if (this.isEditing && this.editMoodId) {
    this.apiService.updateMood(this.editMoodId, this.mood).subscribe(
      () => {
        this.fetchMoods();
        this.cancelEdit();
      },
      error => console.error(error)
    );
  } else {
    this.apiService.addMood(this.mood).subscribe(
      () => {
        this.fetchMoods();
        this.resetForm(); 
      },
      error => console.error(error)
    );
  }
}

resetForm(): void {
  this.mood = { mood: '', notes: '' }; 
}


  editMood(mood: Mood): void {
    this.mood = { ...mood };
    this.isEditing = true;
    this.editMoodId = mood.id || null;
  }

  cancelEdit(): void {
    this.mood = { mood: '', notes: '' };
    this.isEditing = false;
    this.editMoodId = null;
  }

  deleteMood(id: string | undefined): void {
    if (id) {
      this.apiService.deleteMood(id).subscribe(
        () => this.fetchMoods(),
        error => console.error(error)
      );
    }
  }

  getMoodDates(): string[] {
    return Object.keys(this.groupedMoods);
  }
}
