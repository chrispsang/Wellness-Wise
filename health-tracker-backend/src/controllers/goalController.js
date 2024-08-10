const pool = require('../db');

const addGoal = async (req, res) => {
    const { type, target_value, current_value, start_date, end_date } = req.body;
    const userId = req.user.id;

    try {
        const newGoal = await pool.query(
            'INSERT INTO goals (user_id, type, target_value, current_value, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, type, target_value, current_value || 0, start_date, end_date]
        );

        res.json(newGoal.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getGoals = async (req, res) => {
    const userId = req.user.id;

    try {
        const goals = await pool.query('SELECT * FROM goals WHERE user_id = $1 ORDER BY start_date', [userId]);
        res.json(goals.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const updateGoal = async (req, res) => {
    const { id } = req.params;
    const { type, target_value, current_value, start_date, end_date } = req.body;
    const userId = req.user.id;

    try {
        const updatedGoal = await pool.query(
            'UPDATE goals SET type = $1, target_value = $2, current_value = $3, start_date = $4, end_date = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
            [type, target_value, current_value || 0, start_date, end_date, id, userId]
        );

        if (updatedGoal.rows.length === 0) {
            return res.status(404).send('Goal not found');
        }

        res.json(updatedGoal.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const deleteGoal = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const deletedGoal = await pool.query(
            'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (deletedGoal.rows.length === 0) {
            return res.status(404).send('Goal not found');
        }

        res.json(deletedGoal.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

module.exports = {
    addGoal,
    getGoals,
    updateGoal,
    deleteGoal
};
