require("dotenv").config();
const mysql = require("mysql2/promise");

async function initializeDatabase() {
    try {
        console.log("🔄 Initializing database...");
        
        // Connect without specifying database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        console.log("✅ Connected to MySQL server");
        
        // Check if database exists
        const [databases] = await connection.execute("SHOW DATABASES");
        const dbExists = databases.some(db => db.Database === process.env.DB_NAME);
        
        if (!dbExists) {
            console.log(`📝 Creating database '${process.env.DB_NAME}'...`);
            await connection.execute(`CREATE DATABASE \`${process.env.DB_NAME}\``);
            console.log(`✅ Database '${process.env.DB_NAME}' created successfully`);
        } else {
            console.log(`✅ Database '${process.env.DB_NAME}' already exists`);
        }
        
        // Switch to the database
        await connection.execute(`USE \`${process.env.DB_NAME}\``);
        
        // Create users table if it doesn't exist
        console.log("📝 Creating users table...");
        await connection.execute(`
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
        
        // Create other necessary tables
        await connection.execute(`
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
        
        await connection.execute(`
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
        
        await connection.end();
        console.log("🎉 Database initialization complete");
        
    } catch (error) {
        console.error("❌ Database initialization failed:");
        console.error(error.message);
        process.exit(1);
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;