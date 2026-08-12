require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Add connection settings for better reliability
    waitForConnections: true,
    queueLimit: 0
});

// Test connection with retry logic
async function testConnection(retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const connection = await pool.getConnection();
            console.log(`✅ MySQL Connected to ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
            connection.release();
            return;
        } catch (error) {
            console.log(`❌ MySQL Connection Failed (attempt ${i + 1}/${retries})`);
            console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
            console.log(`Database: ${process.env.DB_NAME}`);
            console.log(`Error: ${error.message}`);
            
            if (i === retries - 1) {
                console.log("🔄 All connection attempts failed. The app will continue but database operations may fail.");
                return;
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

testConnection();

module.exports = pool;