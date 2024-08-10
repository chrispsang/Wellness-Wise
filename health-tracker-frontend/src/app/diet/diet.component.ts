
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

interface FoodItem {
  name: string;
  calories: number;
   meal_type: string;
}

interface Diet {
  food_items: FoodItem[];
  date: string;
}

@Component({
  selector: 'app-diet',
  templateUrl: './diet.component.html',
  styleUrls: ['./diet.component.css']
})
export class DietComponent implements OnInit {
  diet: Diet = {
    food_items: [{ name: '', calories: 0,  meal_type: '' }],
    date: ''
  };

  diets: { id: number, date: string, formattedDate: string, food_items: FoodItem[] }[] = [];
  editMode = false;
  editDietId: number | null = null;
  recommendations: string[] = [];

  constructor(private apiService: ApiService) { }

  addDiet() {
    const { food_items, date } = this.diet;
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    if (this.editMode && this.editDietId !== null) {
      this.apiService.updateDiet(this.editDietId, { food_items, date: formattedDate }).subscribe(response => {
        this.getDiets(); 
        this.resetForm(); 
      });
    } else {
      this.apiService.addDiet({ food_items, date: formattedDate }).subscribe(response => {
        this.getDiets(); 
        this.resetForm(); 
      });
    }
  }

  getDiets() {
    this.apiService.getDiets().subscribe((response: { id: number, date: string, formattedDate: string, food_items: FoodItem[] }[]) => {
      this.diets = response.map(diet => ({
        ...diet,
        formattedDate: new Date(diet.date).toLocaleDateString() 
      }));
    });
  }
  

  addFoodItem() {
    this.diet.food_items.push({ name: '', calories: 0, meal_type:'' });
  }

  removeFoodItem(index: number) {
    this.diet.food_items.splice(index, 1);
  }

  editDiet(diet: { id: number, date: string, food_items: FoodItem[] }) {
    this.diet = {
      food_items: diet.food_items.map(item => ({ ...item })),
      date: this.formatDateForInput(diet.date) // Format date for input
    };
    this.editMode = true;
    this.editDietId = diet.id;
  }

  cancelEdit() {
    this.resetForm();
  }

  formatDateForInput(date: string): string {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); 
    return d.toISOString().split('T')[0];
  }

  resetForm() {
    this.diet = {
      food_items: [{ name: '', calories: 0, meal_type:''}],
      date: ''
    };
    this.editMode = false;
    this.editDietId = null;
  }

  deleteDiet(id: number) {
    this.apiService.deleteDiet(id).subscribe(response => {
      this.getDiets(); 
    });
  }

  getRecommendations() {
    this.apiService.getDietRecommendations().subscribe({
        next: response => {
            console.log('Diet Recommendations response:', response);
            this.recommendations = response.recommendations || [];
        },
        error: error => {
            console.error('Error fetching diet recommendations:', error);
        }
    });
}

  ngOnInit() {
    this.getDiets();
    this.getRecommendations();
  }
}

