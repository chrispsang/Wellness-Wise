import json
import sys

def generate_sleep_recommendations(sleep_data):
    sleep_hours = [float(hours) for hours in sleep_data['hours']]
    
    if len(sleep_hours) == 0:
        return [
            "Aim for 7-8 hours of sleep each night.",
            "Establish a consistent bedtime routine to improve your sleep quality.",
            "Avoid caffeine and heavy meals close to bedtime."
        ]

    average_sleep_hours = sum(sleep_hours) / len(sleep_hours)
    min_sleep_hours = min(sleep_hours)
    max_sleep_hours = max(sleep_hours)
    
    recommendations = []

    if max_sleep_hours - min_sleep_hours > 2:
        recommendations.append("Your sleep duration varies significantly. Try to maintain a more consistent sleep schedule.")

    if any(hours < 4 for hours in sleep_hours):
        recommendations.append("You're getting very little sleep on some days. Try to get at least 7-8 hours of sleep for better health.")

    if any(hours > 9 for hours in sleep_hours):
        recommendations.append("You're getting more than 9 hours of sleep on some days. Consider adjusting your sleep schedule to wake up earlier.")
    
    recommendations.append("Maintain a consistent sleep schedule by going to bed and waking up at the same time every day.")
    
    return recommendations

if __name__ == "__main__":
    input_json = sys.argv[1]
    sleep_data = json.loads(input_json)['sleep']
    
    recommendations = generate_sleep_recommendations(sleep_data)
    
    print(json.dumps(recommendations))
