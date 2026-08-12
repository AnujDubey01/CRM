require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10,
    acquireTimeout: 60000,
    // Removed invalid options: timeout and reconnect
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.getConnection()
    .then(connection => {
        console.log(`✅ MySQL Connected to ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
        connection.release();
    })
    .catch(error => {
        console.log("❌ MySQL Connection Failed");
        console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
        console.log(error.message);
    });

module.exports = pool;