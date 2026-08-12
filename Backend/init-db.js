require("dotenv").config();
const mysql = require("mysql2/promise");

async function initializeDatabase() {
    try {
        console.log("🔄 Initializing database...");
        
        // Connect directly to the target database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME, // Connect directly to the database
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        console.log(`✅ Connected to MySQL database: ${process.env.DB_NAME}`);
        
        // Create users table if it doesn't exist
        console.log("📝 Creating users table...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'sales', 'warehouse', 'accounts') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Users table created/verified");
        
        // Create customers table
        console.log("📝 Creating customers table...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(50),
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Customers table created/verified");
        
        // Create products table
        console.log("📝 Creating products table...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                sku VARCHAR(100) UNIQUE,
                price DECIMAL(10,2),
                stock_quantity INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Products table created/verified");
        
        await connection.end();
        console.log("🎉 Database initialization complete");
        
    } catch (error) {
        console.error("❌ Database initialization failed:");
        console.error(error.message);
        
        // Don't exit the process, let the app continue
        console.log("⚠️ Continuing without database initialization...");
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;