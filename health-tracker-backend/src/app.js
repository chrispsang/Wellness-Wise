
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const dietRoutes = require('./routes/dietRoutes'); 
const sleepRoutes = require('./routes/sleepRoutes');
const moodRoutes = require('./routes/moodRoutes');
const goalRoutes = require('./routes/goalRoutes');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Welcome to the Health Tracker API!');
});

app.use('/users', userRoutes);
app.use('/workouts', workoutRoutes);
app.use('/diet', dietRoutes); 
app.use('/sleep', sleepRoutes);
app.use('/moods', moodRoutes);
app.use('/goals', goalRoutes);

module.exports = app;
