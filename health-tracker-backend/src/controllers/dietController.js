
const pool = require('../db');
const { exec } = require('child_process');

const findDietByUserIdAndDate = async (userId, date) => {
    const result = await pool.query(
        'SELECT id FROM diet WHERE user_id = $1 AND date = $2',
        [userId, date]
    );
    return result.rows[0];
};


const addDiet = async (req, res) => {
        const { food_items, date } = req.body;
    const userId = req.user.id;

    if (!userId || !food_items || !date) {
        return res.status(400).send('Invalid data');
    }
  
    try {
        const formattedDate = new Date(date).toISOString().split('T')[0]; 
        const existingDiet = await findDietByUserIdAndDate(userId, formattedDate);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let dietId;
            if (existingDiet) {
                dietId = existingDiet.id;
            } else {
                const dietResult = await client.query(
                    'INSERT INTO diet (user_id, date) VALUES ($1, $2) RETURNING id',
                    [userId, formattedDate]
                );
                dietId = dietResult.rows[0].id;
            }

            const promises = food_items.map(item => {
                if (!item.name || !item.calories || !item.meal_type) {
                    throw new Error('Incomplete food item data');
                }
                return client.query(
                    'INSERT INTO diet_food_items (diet_id, food_item, calories, meal_type) VALUES ($1, $2, $3, $4)',
                    [dietId, item.name, item.calories, item.meal_type]
                );
            });

            await Promise.all(promises);
            await client.query('COMMIT');

            res.json({ id: dietId, date: formattedDate, food_items });
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

const getDiets = async (req, res) => {
    const userId = req.user.id;

    try {
        const diets = await pool.query(`
            SELECT d.id, d.date, f.food_item, f.calories, f.meal_type
            FROM diet d
            LEFT JOIN diet_food_items f ON d.id = f.diet_id
            WHERE d.user_id = $1
        `, [userId]);

        const groupedDiets = diets.rows.reduce((acc, row) => {
            if (!acc[row.date]) {
                acc[row.date] = { id: row.id, date: row.date, formattedDate: new Date(row.date).toLocaleDateString(), food_items: [] };
            }
            acc[row.date].food_items.push({ name: row.food_item, calories: row.calories, meal_type: row.meal_type });
            return acc;
        }, {});

        res.json(Object.values(groupedDiets));
    } catch (err) {
        res.status(500).send(err.message);
    }
};


const updateDiet = async (req, res) => {
    const { food_items, date } = req.body;
    const userId = req.user.id;
    const dietId = parseInt(req.params.id, 10); 

    if (!dietId || isNaN(dietId) || !userId || !food_items || !date) {
        return res.status(400).send('Invalid data');
    }

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const formattedDate = new Date(date).toISOString().split('T')[0];

            // Update the diet entry with the new date
            await client.query('UPDATE diet SET date = $1 WHERE id = $2 AND user_id = $3', [formattedDate, dietId, userId]);

            // Delete existing food items for the diet entry
            await client.query('DELETE FROM diet_food_items WHERE diet_id = $1', [dietId]);

            // Insert updated food items for the diet entry
            const promises = food_items.map(item => {
                if (!item.name || !item.calories || !item.meal_type) { // Ensure meal_type is checked
                    throw new Error('Incomplete food item data');
                }
                return client.query(
                    'INSERT INTO diet_food_items (diet_id, food_item, calories, meal_type) VALUES ($1, $2, $3, $4)',
                    [dietId, item.name, item.calories, item.meal_type]
                );
            });

            await Promise.all(promises);
            await client.query('COMMIT');

            res.json({ id: dietId, date: formattedDate, food_items });
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

const deleteDiet = async (req, res) => {
    const userId = req.user.id;
    const dietId = parseInt(req.params.id, 10);

    if (!dietId || isNaN(dietId) || !userId) {
        return res.status(400).send('Invalid data');
    }

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query('DELETE FROM diet_food_items WHERE diet_id = $1', [dietId]);

            await client.query('DELETE FROM diet WHERE id = $1 AND user_id = $2', [dietId, userId]);

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

const getDietRecommendations = async (req, res) => {
    console.log('getDietRecommendations function called');

    if (!req.user || !req.user.id) {
        return res.status(401).send('Unauthorized: No user ID found');
    }

    const userId = req.user.id;

    try {
        const { rows } = await pool.query(
            `SELECT f.food_item, f.calories, d.date 
             FROM diet d
             JOIN diet_food_items f ON d.id = f.diet_id
             WHERE d.user_id = $1`,
            [userId]
        );

        if (rows.length === 0) {
            return res.json({
                recommendations: [
                    "You haven't logged any meals yet. Consider starting with a balanced diet including fruits, vegetables, and lean proteins.",
                    "Remember to include a variety of food groups in your meals.",
                    "Consider planning your meals ahead to ensure a balanced intake."
                ]
            });
        }

        const data = {
            foodItems: rows.map(row => row.food_item.toLowerCase()),
            quantities: rows.map(row => row.calories), 
            dates: rows.map(row => row.date)
        };

        console.log('Data sent to Python script:', data);

        const pythonCommand = `python3 ./src/diet_recommendation_model.py '${JSON.stringify(data)}'`;

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

            let jsonString;
            try {
                jsonString = JSON.parse(stdout.trim());
            } catch (parseErr) {
                console.error('Error parsing Python output:', parseErr.message);
                return res.status(500).send(`Error parsing Python output: ${parseErr.message}`);
            }

            console.log('Parsed diet recommendations:', jsonString);
            res.json(jsonString);
        });

    } catch (error) {
        console.error('Database error:', error.message);
        res.status(500).send(`Database error: ${error.message}`);
    }
};

module.exports = {
    addDiet,
    getDiets,
    updateDiet,
    deleteDiet,
    getDietRecommendations,
}
