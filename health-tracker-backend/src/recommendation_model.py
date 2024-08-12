import sys
import json
import pandas as pd
import random

def suggest_workout_routine(user_data):
    df = pd.DataFrame(user_data)
    
    if df.empty:
        return [
            "You haven't logged any workouts yet. Consider starting with a balanced routine like Running, Yoga, or Cycling.",
            "Remember, consistency is key. Try to establish a regular workout routine that suits your lifestyle."
        ] 
    
    workout_map = {
        "running": ["cycling", "HIIT", "strength training", "swimming"],
        "swimming": ["yoga", "pilates", "tai chi", "running"],
        "biking": ["running", "HIIT", "strength training", "yoga"],
        "tai chi": ["yoga", "pilates", "meditation", "walking"],
        "yoga": ["tai chi", "pilates", "stretching", "swimming"],
        "strength training": ["HIIT", "running", "biking", "crossfit"],
        "crossfit": ["HIIT", "strength training", "cycling", "running"],
        "pilates": ["yoga", "tai chi", "stretching", "barre"],
        "barre": ["yoga", "pilates", "strength training", "dance"],
        "dance": ["zumba", "yoga", "stretching", "HIIT"],
        "zumba": ["dance", "running", "cycling", "HIIT"]
    }

    general_recommendations = ["walking", "stretching", "core exercises", "light cardio", "barre", "dance", "zumba"]

    workout_tips = [
        "Remember to stay hydrated before, during, and after your workout.",
        "Don't forget to warm up before starting your exercise and cool down afterwards.",
        "Consider mixing up your routine to avoid plateaus and keep things interesting.",
        "Pay attention to your form to prevent injuries and get the most out of each movement.",
        "Take rest days to allow your muscles to recover and grow stronger.",
        "Incorporate flexibility exercises like yoga or stretching into your routine for better recovery and performance."
    ]

    # Convert workout types to lowercase for case-insensitivity
    df['type'] = df['type'].str.lower()

    most_frequent_types = df['type'].value_counts().index.tolist()
    
    recommendations = []
    
    for workout_type in most_frequent_types:
        alternatives = workout_map.get(workout_type, general_recommendations)
        recommended_type = random.choice(alternatives).capitalize()

        # Calculate the average duration for this workout type
        avg_duration = df[df['type'] == workout_type]['duration'].mean()
        if pd.isna(avg_duration):
            avg_duration = 0  # fallback in case of NaN

        adjusted_duration = round(avg_duration * random.uniform(0.9, 1.1))

        recommendation_text = f"Since you've been doing {workout_type.capitalize()} regularly, why not try {recommended_type} for about {adjusted_duration} minutes next time? {random.choice(workout_tips)}"
        recommendations.append(recommendation_text)
    
    # Ensure at least 3 recommendations and add general tips
    recommendations.extend(random.sample(workout_tips, 2))

    # Provide a suggestion for intensity variation
    if len(most_frequent_types) > 1:
        varied_intensity_type = random.choice(most_frequent_types)
        varied_intensity_tip = f"To add variety to your routine, consider varying the intensity of your {varied_intensity_type.capitalize()} workouts. Mix in some slower-paced sessions with more intense ones."
        recommendations.append(varied_intensity_tip)

    # Suggest a new type of exercise not in the user's history
    if len(df['type'].unique()) < len(general_recommendations):
        new_exercise = random.choice([exercise for exercise in general_recommendations if exercise not in df['type'].unique()])
        new_exercise_tip = f"Try incorporating a new exercise into your routine, such as {new_exercise.capitalize()}, for a fresh challenge."
        recommendations.append(new_exercise_tip)

    return recommendations[:5] 

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

