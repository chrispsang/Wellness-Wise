
import sys
import json
import pandas as pd
import random

def suggest_diet_routine(user_data):
    df = pd.DataFrame(user_data)
    
    if df.empty:
        return ["You haven't logged any meals yet. Consider starting with a balanced diet including fruits, vegetables, and lean proteins."]
    
    food_group_map = {
        "fruits": ["apples", "bananas", "oranges"],
        "vegetables": ["carrots", "spinach", "broccoli"],
        "proteins": ["chicken", "tofu", "eggs"],
        "grains": ["rice", "quinoa", "oats"],
        "dairy": ["milk", "yogurt", "cheese"],
        "fats": ["avocado", "nuts", "olive oil"],
    }
    
    general_recommendations = ["fruits", "vegetables", "proteins", "grains", "dairy", "fats"]

    recommendations = []
    
    most_frequent_items = df['foodItems'].value_counts().index.tolist()
    
    for food_item in most_frequent_items:
        recommended_group = random.choice(general_recommendations).capitalize()
        recommendation_text = f"Since you've been eating {food_item.capitalize()} regularly, consider incorporating more {recommended_group} into your meals."
        recommendations.append(recommendation_text)
    
    general_health_tips = [
        "Try to balance your plate with a variety of food groups.",
        "Include more whole grains in your diet for sustained energy.",
        "Aim for at least five servings of fruits and vegetables each day.",
        "Consider adding a healthy source of fat, like avocado or nuts, to your meals.",
        "Hydration is key! Drink plenty of water throughout the day.",
        "Consider reducing your intake of processed foods and sugary drinks."
    ]

    recommendations.extend(random.sample(general_health_tips, 2))

    # Recommendations for variety
    recommendations.append("Vary your protein sources by including plant-based options like beans and lentils.")
    recommendations.append("Try to eat seasonal and locally sourced fruits and vegetables.")

    return recommendations[:5] 

def main():
    try:
        input_data = json.loads(sys.argv[1])
        recommendations = suggest_diet_routine(input_data)
        print(json.dumps({"recommendations": recommendations}))
        
    except Exception as e:
        print(f"An error occurred: {e}")
        print(json.dumps({"recommendations": ["An error occurred while generating recommendations."]}))

if __name__ == "__main__":
    main()
