import sys
import json
import pandas as pd
import random

def suggest_workout_routine(user_data):
    df = pd.DataFrame(user_data)
    
    if df.empty:
        return ["You haven't logged any workouts yet. Consider starting with a balanced routine like Running, Yoga, or Cycling."] 
    
    workout_map = {
        "running": ["cycling", "HIIT", "strength training"],
        "swimming": ["yoga", "pilates", "tai chi"],
        "biking": ["running", "HIIT", "strength training"],
        "tai chi": ["yoga", "pilates", "meditation"],
        "yoga": ["tai chi", "pilates", "stretching"],
        "strength training": ["HIIT", "running", "biking"],
    }

    general_recommendations = ["walking", "stretching", "core exercises", "light cardio"]

    workout_tips = [
        "Remember to stay hydrated before, during, and after your workout.",
        "Don't forget to warm up before starting your exercise and cool down afterwards.",
        "Consider mixing up your routine to avoid plateaus and keep things interesting.",
        "Pay attention to your form to prevent injuries and get the most out of each movement.",
        "Take rest days to allow your muscles to recover and grow stronger."
    ]

    most_frequent_types = df['type'].value_counts().index.tolist()
    
    recommendations = []
    
    for workout_type in most_frequent_types:
        alternatives = workout_map.get(workout_type.lower(), general_recommendations)
        recommended_type = random.choice(alternatives).capitalize()
        avg_duration = df[df['type'] == workout_type]['duration'].mean()
        adjusted_duration = round(avg_duration * random.uniform(0.9, 1.1))
        
        recommendation_text = f"Since you've been doing {workout_type.capitalize()} regularly, why not try {recommended_type} for about {adjusted_duration} minutes next time? {random.choice(workout_tips)}"
        recommendations.append(recommendation_text)
    
    return recommendations[:3] 

def main():
    try:
        input_data = json.loads(sys.argv[1])
        recommendations = suggest_workout_routine(input_data)
        print(json.dumps({"recommendations": recommendations}))
        
    except Exception as e:
        print(f"An error occurred: {e}")
        print(json.dumps({"recommendations": ["An error occurred while generating recommendations."]}))

if __name__ == "__main__":
    main()
