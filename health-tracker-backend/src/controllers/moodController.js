
const pool = require('../db');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const addMood = async (req, res) => {
    const { mood, notes } = req.body;
    const userId = req.user.id;

    try {
        const sentimentResult = sentiment.analyze(notes);
        const moodScore = sentimentResult.score;

        const newMood = await pool.query(
            'INSERT INTO mood (user_id, mood, notes, mood_score, date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [userId, mood, notes, moodScore]
        );

        const moodDate = new Date(newMood.rows[0].date);
        const formattedDate = moodDate.toLocaleDateString();

        res.json({
            ...newMood.rows[0],
            formattedDate,
            insights: generateInsights(moodScore),
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getMoods = async (req, res) => {
    const userId = req.user.id;

    try {
        const moods = await pool.query('SELECT * FROM mood WHERE user_id = $1 ORDER BY date', [userId]);

        const groupedMoods = moods.rows.reduce((acc, mood) => {
            const moodDate = new Date(mood.date);
            const formattedDate = moodDate.toLocaleDateString();

            const formattedMood = {
                ...mood,
                formattedDate,
                insights: generateInsights(mood.mood_score),
            };

            if (!acc[formattedDate]) {
                acc[formattedDate] = [];
            }
            acc[formattedDate].push(formattedMood);

            return acc;
        }, {});

        res.json(groupedMoods);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const generateInsights = (moodScore) => {
    if (moodScore > 2) {
        return 'You seem to be in a very positive mood! Keep up the good vibes.';
    } else if (moodScore >= 0) {
        return 'Your mood is neutral. Try engaging in activities you enjoy to boost your mood.';
    } else if (moodScore > -2) {
        return 'You seem slightly down. Consider talking to a friend or doing something relaxing.';
    } else {
        return 'You seem to be feeling negative. It might help to reach out to a loved one or practice mindfulness.';
    }
};

const updateMood = async (req, res) => {
    const { mood, notes } = req.body;
    const userId = req.user.id;
    const moodId = req.params.id;

    try {
        const sentimentResult = sentiment.analyze(notes);
        const moodScore = sentimentResult.score;

        const updatedMood = await pool.query(
            'UPDATE mood SET mood = $1, notes = $2, mood_score = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
            [mood, notes, moodScore, moodId, userId]
        );

        const moodDate = new Date(updatedMood.rows[0].date);
        const formattedDate = moodDate.toLocaleDateString();

        res.json({
            ...updatedMood.rows[0],
            formattedDate,
            insights: generateInsights(moodScore),
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const deleteMood = async (req, res) => {
    const userId = req.user.id;
    const moodId = req.params.id;

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query('DELETE FROM mood WHERE id = $1 AND user_id = $2', [moodId, userId]);

            await client.query('COMMIT');

            res.sendStatus(204);
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getMoodTrends = async (req, res) => {
    const userId = req.user.id;

    try {
        const moods = await pool.query('SELECT date, mood_score FROM mood WHERE user_id = $1 ORDER BY date', [userId]);

        const trends = moods.rows.map(mood => ({
            date: new Date(mood.date).toISOString(),  // Use ISO format for consistency
            sentiment: mood.mood_score
        }));

        res.json(trends);
    } catch (err) {
        res.status(500).send(err.message);
    }
};


module.exports = {
    addMood,
    getMoods,
    updateMood,
    deleteMood,
    getMoodTrends 
};
