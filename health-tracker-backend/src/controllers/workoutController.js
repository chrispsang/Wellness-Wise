
const pool = require('../db');
const { exec } = require('child_process');

const addWorkout = async (req, res) => {
    const { type, date, startTime, endTime } = req.body;
    const userId = req.user.id;

    try {
        const startDateTime = new Date(`${date}T${startTime}`);
        let endDateTime = new Date(`${date}T${endTime}`);

        if (endDateTime < startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
        }

        const durationMinutes = Math.round((endDateTime - startDateTime) / 60000);

        const newWorkout = await pool.query(
            'INSERT INTO workouts (user_id, type, date, start_time, end_time, duration) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, type, date, startTime, endTime, durationMinutes]
        );

        res.json(newWorkout.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getWorkouts = async (req, res) => {
    const userId = req.user.id;

    try {
        const workouts = await pool.query(
            'SELECT id, user_id, type, date, start_time as "startTime", end_time as "endTime", duration FROM workouts WHERE user_id = $1 ORDER BY start_time',
            [userId]
        );

        const validWorkouts = workouts.rows.filter(workout => workout.date);
        res.json(validWorkouts);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const updateWorkout = async (req, res) => {
    const { id } = req.params;
    const { type, date, startTime, endTime } = req.body;
    const userId = req.user.id;

    try {
        const startDateTime = new Date(`${date}T${startTime}`);
        let endDateTime = new Date(`${date}T${endTime}`);

        if (endDateTime < startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
        }

        const durationMinutes = Math.round((endDateTime - startDateTime) / 60000);

        const updatedWorkout = await pool.query(
            'UPDATE workouts SET type = $1, date = $2, start_time = $3, end_time = $4, duration = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
            [type, date, startTime, endTime, durationMinutes, id, userId]
        );

        res.json(updatedWorkout.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const deleteWorkout = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        await pool.query(
            'DELETE FROM workouts WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        res.status(204).send();
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getRecommendations = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).send('Unauthorized: No user ID found');
    }

    const userId = req.user.id;

    try {
        const { rows } = await pool.query('SELECT type, start_time, end_time, duration FROM workouts WHERE user_id = $1', [userId]);

        if (rows.length === 0) {
            return res.json({
                recommendations: [
                    "You haven't logged any workouts yet. Consider starting with a balanced routine like Running, Yoga, or Cycling.",
                    "It's a great time to start with simple exercises like walking or stretching.",
                    "How about trying a new activity like Hiking or Swimming?"
                ]
            });
        }

        const data = rows.map(row => ({
            type: row.type.toLowerCase(),
            duration: row.duration,
            start_time: row.start_time,
            end_time: row.end_time,
        }));

        const pythonCommand = `python3 ./src/recommendation_model.py '${JSON.stringify(data)}'`;

        exec(pythonCommand, (err, stdout, stderr) => {
            if (err) {
                console.error('Error executing Python script:', err.message);
                return res.status(500).send(`Error executing Python script: ${err.message}`);
            }

            if (stderr) {
                console.error('Python stderr:', stderr);
                return res.status(500).send(`Python error: ${stderr}`);
            }

            let jsonString;
            try {
                jsonString = JSON.parse(stdout.trim());
            } catch (parseErr) {
                console.error('Error parsing Python output:', parseErr.message);
                return res.status(500).send(`Error parsing Python output: ${parseErr.message}`);
            }

            res.json(jsonString);
        });

    } catch (error) {
        console.error('Database error:', error.message);
        res.status(500).send(`Database error: ${error.message}`);
    }
};

module.exports = {
    addWorkout,
    getWorkouts,
    updateWorkout,
    deleteWorkout,
    getRecommendations
};
