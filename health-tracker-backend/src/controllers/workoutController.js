
const pool = require('../db');
const { exec } = require('child_process');

const addWorkout = async (req, res) => {
    const { type, startTime, endTime } = req.body;
    const userId = req.user.id;

    try {
        const newWorkout = await pool.query(
            'INSERT INTO workouts (user_id, type, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, type, startTime, endTime]
        );

        const startDate = new Date(newWorkout.rows[0].start_time);
        const endDate = new Date(newWorkout.rows[0].end_time);
        const formattedDate = startDate.toLocaleDateString();
        const formattedStartTime = startDate.toLocaleTimeString();
        const formattedEndTime = endDate.toLocaleTimeString();
        const duration = Math.round((endDate - startDate) / 60000);

        res.json({
            ...newWorkout.rows[0],
            formattedDate,
            formattedStartTime,
            formattedEndTime,
            duration
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getWorkouts = async (req, res) => {
    const userId = req.user.id;

    try {
        const workouts = await pool.query('SELECT * FROM workouts WHERE user_id = $1 ORDER BY start_time', [userId]);

        const groupedWorkouts = workouts.rows.reduce((acc, workout) => {
            const startDate = new Date(workout.start_time);
            const endDate = new Date(workout.end_time);
            const formattedDate = startDate.toISOString().split('T')[0];
            const formattedStartTime = startDate.toTimeString().split(' ')[0].substring(0, 5);
            const formattedEndTime = endDate.toTimeString().split(' ')[0].substring(0, 5);
            const duration = Math.round((endDate - startDate) / 60000);

            const formattedWorkout = {
                ...workout,
                formattedDate,
                formattedStartTime,
                formattedEndTime,
                duration: isNaN(duration) ? 0 : duration 
            };

            if (!acc[formattedDate]) {
                acc[formattedDate] = [];
            }
            acc[formattedDate].push(formattedWorkout);

            return acc;
        }, {});

        res.json(groupedWorkouts);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const updateWorkout = async (req, res) => {
    const { id } = req.params;
    const { type, startTime, endTime } = req.body;
    const userId = req.user.id;

    try {
        const updatedWorkout = await pool.query(
            'UPDATE workouts SET type = $1, start_time = $2, end_time = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
            [type, startTime, endTime, id, userId]
        );

        if (updatedWorkout.rows.length === 0) {
            return res.status(404).send('Workout not found');
        }

        const startDate = new Date(updatedWorkout.rows[0].start_time);
        const endDate = new Date(updatedWorkout.rows[0].end_time);
        const formattedDate = startDate.toLocaleDateString();
        const formattedStartTime = startDate.toLocaleTimeString();
        const formattedEndTime = endDate.toLocaleTimeString();
        const duration = Math.round((endDate - startDate) / 60000);

        res.json({
            ...updatedWorkout.rows[0],
            formattedDate,
            formattedStartTime,
            formattedEndTime,
            duration
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const deleteWorkout = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const deletedWorkout = await pool.query(
            'DELETE FROM workouts WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (deletedWorkout.rows.length === 0) {
            return res.status(404).send('Workout not found');
        }

        res.json(deletedWorkout.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getRecommendations = async (req, res) => {
    console.log('getRecommendations function called');

    if (!req.user || !req.user.id) {
        return res.status(401).send('Unauthorized: No user ID found');
    }

    const userId = req.user.id;

    try {
        const { rows } = await pool.query('SELECT type, start_time, end_time FROM workouts WHERE user_id = $1', [userId]);

        if (rows.length === 0) {
            return res.json({
                recommendations: [
                    "You haven't logged any workouts yet. Consider starting with a balanced routine like Running, Yoga, or Cycling.",
                    "It's a great time to start with simple exercises like walking or stretching.",
                    "How about trying a new activity like Hiking or Swimming?"
                ]
            });
        }

        const data = {
            type: rows.map(row => row.type.toLowerCase()),
            duration: rows.map(row => {
                const startDate = new Date(row.start_time);
                const endDate = new Date(row.end_time);
                const duration = Math.round((endDate - startDate) / 60000);
                return isNaN(duration) ? 0 : duration;
            }),
        };

        console.log('Data sent to Python script:', data);

        const pythonCommand = `python3 ./src/recommendation_model.py '${JSON.stringify(data)}'`;

        exec(pythonCommand, (err, stdout, stderr) => {
            console.log('Python script executed');
            if (err) {
                console.error('Error executing Python script:', err.message);
                return res.status(500).send(`Error executing Python script: ${err.message}`);
            }

            if (stderr) {
                console.error('Python stderr:', stderr);
                return res.status(500).send(`Python error: ${stderr}`);
            }

            console.log('Raw Python script output:', stdout);

            // Parse JSON output from Python script
            let jsonString;
            try {
                jsonString = JSON.parse(stdout.trim());
            } catch (parseErr) {
                console.error('Error parsing Python output:', parseErr.message);
                return res.status(500).send(`Error parsing Python output: ${parseErr.message}`);
            }

            console.log('Parsed recommendations:', jsonString);
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
