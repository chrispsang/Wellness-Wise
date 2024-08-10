const pool = require('../db');
const { exec } = require('child_process');

const addSleep = async (req, res) => {
    const { date, startTime, endTime } = req.body;
    const userId = req.user.id;

    try {
        const startDateTime = new Date(`${date}T${startTime}`);
        let endDateTime = new Date(`${date}T${endTime}`);

        if (endDateTime < startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
        }

        const durationMinutes = Math.round((endDateTime - startDateTime) / (1000 * 60));
        const durationHours = durationMinutes / 60;

        const newSleep = await pool.query(
            'INSERT INTO sleep (user_id, date, start_time, end_time, hours) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, date::date as date, start_time as "startTime", end_time as "endTime", hours',
            [userId, date, startTime, endTime, durationHours]
        );

        res.json(newSleep.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getSleep = async (req, res) => {
    const userId = req.user.id;

    try {
        const sleepRecords = await pool.query(
            'SELECT id, user_id, date::date as date, start_time as "startTime", end_time as "endTime", hours FROM sleep WHERE user_id = $1', 
            [userId]
        );

        res.json(sleepRecords.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const updateSleep = async (req, res) => {
    const { date, startTime, endTime } = req.body;
    const userId = req.user.id;
    const sleepId = parseInt(req.params.id, 10);

    if (isNaN(sleepId)) {
        return res.status(400).send('Invalid sleep ID');
    }

    try {
        const startDateTime = new Date(`${date}T${startTime}Z`); 
        let endDateTime = new Date(`${date}T${endTime}Z`);

        if (endDateTime < startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
        }

        const durationMinutes = Math.round((endDateTime - startDateTime) / (1000 * 60));
        const durationHours = (durationMinutes / 60).toFixed(2); 

        const updatedSleep = await pool.query(
            'UPDATE sleep SET date = $1, start_time = $2, end_time = $3, hours = $4 WHERE id = $5 AND user_id = $6 RETURNING id, user_id, date AT TIME ZONE \'UTC\' as date, start_time as "startTime", end_time as "endTime", hours',
            [date, startTime, endTime, durationHours, sleepId, userId]
        );

        res.json(updatedSleep.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const deleteSleep = async (req, res) => {
    const userId = req.user.id;
    const sleepId = req.params.id;

    try {
        await pool.query('DELETE FROM sleep WHERE id = $1 AND user_id = $2', [sleepId, userId]);
        res.status(204).send();
    } catch (err) {
        res.status(500).send(err.message);
    }
};
const getSleepRecommendations = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).send('Unauthorized: No user ID found');
    }

    const userId = req.user.id;

    try {
        const sleepQuery = await pool.query(
            'SELECT date, start_time, end_time, hours FROM sleep WHERE user_id = $1',
            [userId]
        );

        const sleepData = {
            hours: sleepQuery.rows.map(row => row.hours)
        };

        const data = { sleep: sleepData };

        const pythonCommand = `python3 ./src/sleep_recommendation_model.py '${JSON.stringify(data)}'`;

        exec(pythonCommand, (err, stdout, stderr) => {
            if (err) {
                console.error('Error executing Python script:', err.message);
                return res.status(500).send(`Error executing Python script: ${err.message}`);
            }

            if (stderr) {
                console.error('Python stderr:', stderr);
                try {
                    const errorJson = JSON.parse(stderr);
                    return res.status(500).send(`Python error: ${errorJson.error}`);
                } catch (parseErr) {
                    return res.status(500).send(`Python error: ${stderr}`);
                }
            }

            let jsonString;
            try {
                jsonString = JSON.parse(stdout.trim());
            } catch (parseErr) {
                console.error('Error parsing Python output:', parseErr.message);
                return res.status(500).send(`Error parsing Python output: ${parseErr.message}`);
            }

            res.json({ recommendations: jsonString });

        });

    } catch (error) {
        console.error('Database error:', error.message);
        res.status(500).send(`Database error: ${error.message}`);
    }
};


module.exports = {
    addSleep,
    getSleep,
    updateSleep,
    deleteSleep,
    getSleepRecommendations
};
