<h1 align="center">Wellness Wise</h1>

Wellness Wise is a comprehensive Health and Wellness Tracker that allows users to track their physical activities, diet, sleep, mood, and goals. The project showcases user-centric application development, integrating various types of data into a cohesive and useful tool.

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)

## Key Features

- **Tracking Physical Activities**: Log your workouts, track durations, and monitor progress.
- **Diet Tracking**: Record your daily food intake with calories and meal types.
- **Sleep Tracking**: Track your sleep patterns, including hours slept, start time, and end time.
- **Mood Tracking**: Record daily moods.
- **Mood Analysis and Insights**: Use sentiment analysis to provide insights into users' mood patterns and suggest ways to improve mental well-being.
- **Dashboard for Mood Trends**: Visualize sentiment trends over time in a chart, showing how the user's mood has changed. 
- **Goals Tracking**: Set and monitor your health and wellness goals.
- **Personalized Recommendations**: Leverage machine learning algorithms to provide personalized recommendations for workouts, dietary changes, and sleep improvements.
- **User Authentication**: Secure user authentication using JWT (JSON Web Token).

## Tech Stack

- **Frontend**: [Angular](https://angular.io/)
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Machine Learning**: [Python](https://www.python.org/) for sentiment analysis and recommendations
- **Charting Library**: [Chart.js](https://www.chartjs.org/) for visualizing mood trends.

## Prerequisites

Before you start, ensure you have the following software installed:

- **Node.js**: [Download Node.js](https://nodejs.org/)
- **PostgreSQL**: [Download PostgreSQL](https://www.postgresql.org/download/)
- **Angular CLI**: Install via npm: `npm install -g @angular/cli`
- **Python**: [Download Python](https://www.python.org/downloads/)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/chrispsang/Wellness-Wise.git
cd Wellness-Wise
```

### 2. Setup the Backend

Navigate to the backend directory:

```bash
cd health-tracker-backend
```

**2.1 Install Dependencies**

```bash
npm install
```

**2.2 Set Up Environment Variables**

Create the `.env` file:

```bash
touch .env
```

Add the following configuration to the .env file:

```bash
DB_HOST=localhost
DB_USER=new_user
DB_PASSWORD=new_password
DB_NAME=health_wellness
DB_PORT=5432
PORT=3000
ACCESS_TOKEN_SECRET=your_jwt_secret 

```
**2.3 Set Up PostgreSQL Database**

Before running the schema script, follow these steps to create a new PostgreSQL user and set up the health_wellness database:

1. **Create a New PostgreSQL User:**

    - Open your terminal and connect to the PostgreSQL server using the default postgres superuser:

        ```bash
        psql -U postgres -d postgres
         ```

    - Create a new user:

        ```bash
        CREATE USER new_user WITH PASSWORD 'new_password';
        ```

    - Grant the new user the privilege to create databases:

        ```bash
        ALTER USER new_user CREATEDB;
        ```

    - Exit psql:

        ```bash
        \q
        ```

2. **Create the health_wellness Database:**

    - Connect to PostgreSQL as the new user:

        ```bash
        psql -U new_user -d postgres
        ```
    - Create the database:

        ```bash
        CREATE DATABASE health_wellness;
        ```

    - Exit psql:

        ```bash
        \q
        ```

3. **Run the Schema Script:**

    Now that the health_wellness database has been created, run the schema script:

    ```bash
    psql -U new_user -d health_wellness -f ./schema.sql
    ```

**2.4 Run the Backend**

```bash
node src/server.js
```

### 3. Access the Backend
Open your browser and go to http://localhost:3000 to access the backend.

### 4. Setup the Frontend
Navigate to the frontend directory:

```bash
cd health-tracker-frontend
```

**4.1 Install Dependencies**

```bash
npm install
```

**4.2 Run the Frontend**

```bash
ng serve
```

### 5. Access the Application
Open your browser and go to http://localhost:4200 to access Wellness Wise.

---
