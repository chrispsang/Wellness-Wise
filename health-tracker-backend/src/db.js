const { Pool } = require('pg');
require('dotenv').config();

// Determine if the environment is production
const isProduction = process.env.NODE_ENV === 'production';

// Create the pool configuration based on the environment
const pool = new Pool({
    connectionString: isProduction
        ? process.env.DATABASE_URL
        : `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ssl: isProduction ? { rejectUnauthorized: false } : false,  
});

module.exports = pool;
