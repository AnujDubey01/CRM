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