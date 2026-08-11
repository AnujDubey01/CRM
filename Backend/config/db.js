require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

pool.getConnection()
    .then(connection => {
        console.log("✅ MySQL Connected");
        connection.release();
    })
    .catch(error => {
        console.log("❌ MySQL Connection Failed");
        console.log(error.message);
    });

module.exports = pool;