const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupTestData() {
    let connection;
    
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'erp_crm'
        });

        console.log('Connected to MySQL database');

        // Hash password for all test users
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        // Test credentials
        const testUsers = [
            {
                name: 'John Admin',
                email: 'admin@opsflow.com',
                password: hashedPassword,
                role: 'admin'
            },
            {
                name: 'Sarah Sales',
                email: 'sales@opsflow.com',
                password: hashedPassword,
                role: 'sales'
            },
            {
                name: 'Mike Warehouse',
                email: 'warehouse@opsflow.com',
                password: hashedPassword,
                role: 'warehouse'
            },
            {
                name: 'Lisa Accounts',
                email: 'accounts@opsflow.com',
                password: hashedPassword,
                role: 'accounts'
            },
            {
                name: 'Demo User',
                email: 'demo@opsflow.com',
                password: hashedPassword,
                role: 'sales'
            }
        ];

        // Clear existing data (if any)
        console.log('Clearing existing test data...');
        await connection.execute('DELETE FROM challan_items');
        await connection.execute('DELETE FROM sales_challans');
        await connection.execute('DELETE FROM stock_movements');
        await connection.execute('DELETE FROM customer_followups');
        await connection.execute('DELETE FROM products');
        await connection.execute('DELETE FROM customers');
        await connection.execute('DELETE FROM users');
        
        // Reset auto increment
        await connection.execute('ALTER TABLE users AUTO_INCREMENT = 1');
        await connection.execute('ALTER TABLE customers AUTO_INCREMENT = 1');
        await connection.execute('ALTER TABLE products AUTO_INCREMENT = 1');

        // Insert test users
        console.log('Creating test users...');
        for (const user of testUsers) {
            await connection.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [user.name, user.email, user.password, user.role]
            );
        }

        // Insert sample customers
        console.log('Creating sample customers...');
        const customers = [
            ['Rajesh Gupta', '+919876543210', 'rajesh@techsolutions.com', 'Tech Solutions Pvt Ltd', '27ABCDE1234F1Z5', 'customer', '123 Tech Park, Bangalore, Karnataka 560001', 'customer', null, 'Major client for IT hardware'],
            ['Priya Sharma', '+919876543211', 'priya@electromart.com', 'Electro Mart', '29FGHIJ5678K2L6', 'customer', '456 Electronics Street, Mumbai, Maharashtra 400001', 'customer', null, 'Regular orders for electronic components'],
            ['Amit Kumar', '+919876543212', 'amit@manufacturing.in', 'Kumar Manufacturing', '24MNOPQ9012R3S7', 'prospect', '789 Industrial Area, Delhi 110001', 'prospect', '2024-08-20', 'Interested in bulk machinery parts'],
            ['Neha Patel', '+919876543213', 'neha@retailstore.com', 'Patel Retail Store', '07TUVWX3456Y4Z8', 'lead', '321 Market Plaza, Ahmedabad, Gujarat 380001', 'lead', '2024-08-15', 'New lead from trade show'],
            ['Vikram Singh', '+919876543214', 'vikram@logistics.co.in', 'Singh Logistics', '33ABCDE7890F5G1', 'customer', '654 Transport Hub, Pune, Maharashtra 411001', 'customer', null, 'Fleet management supplies'],
            ['Anita Reddy', '+919876543215', 'anita@textiles.com', 'Reddy Textiles', '36HIJKL2345M6N2', 'prospect', '987 Textile District, Chennai, Tamil Nadu 600001', 'prospect', '2024-08-18', 'Looking for fabric machinery'],
            ['Ravi Agarwal', '+919876543216', 'ravi@pharma.in', 'Agarwal Pharmaceuticals', '10OPQRS6789T7U3', 'customer', '147 Pharma City, Hyderabad, Telangana 500001', 'customer', null, 'Medical equipment supplier'],
            ['Deepika Jain', '+919876543217', 'deepika@foodprocessing.com', 'Jain Food Processing', '22VWXYZ1234A8B4', 'lead', '258 Food Park, Jaipur, Rajasthan 302001', 'lead', '2024-08-22', 'Interested in food processing equipment']
        ];

        for (const customer of customers) {
            await connection.execute(
                `INSERT INTO customers (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                customer
            );
        }

        // Insert sample products
        console.log('Creating sample products...');
        const products = [
            ['Industrial Motor 5HP', 'MOT-5HP-001', 'Motors', 15000.00, 25, 5, 'Main Warehouse'],
            ['Bearing Set - Premium', 'BRG-PREM-002', 'Bearings', 2500.00, 50, 10, 'Main Warehouse'],
            ['Steel Pipe 6m', 'PIPE-STL-003', 'Pipes', 3200.00, 100, 20, 'Storage A'],
            ['Hydraulic Pump', 'HYD-PMP-004', 'Hydraulic', 25000.00, 15, 3, 'Main Warehouse'],
            ['Electrical Control Panel', 'ECP-STD-005', 'Electronics', 8500.00, 30, 8, 'Electronics Wing'],
            ['Conveyor Belt 10m', 'CVB-10M-006', 'Conveyor', 12000.00, 20, 5, 'Storage B'],
            ['Safety Valve DN50', 'SV-DN50-007', 'Valves', 4500.00, 40, 10, 'Main Warehouse'],
            ['Gearbox 1:10 Ratio', 'GBX-110-008', 'Gearbox', 18000.00, 12, 4, 'Main Warehouse'],
            ['PLC Module', 'PLC-MOD-009', 'Electronics', 6500.00, 25, 6, 'Electronics Wing'],
            ['Pneumatic Cylinder', 'PNC-CYL-010', 'Pneumatic', 3500.00, 35, 8, 'Main Warehouse'],
            ['Chain Drive 2m', 'CHN-DRV-011', 'Drives', 1800.00, 60, 15, 'Storage A'],
            ['Temperature Sensor', 'TMP-SNS-012', 'Sensors', 850.00, 80, 20, 'Electronics Wing'],
            ['Coupling Flexible', 'CPL-FLX-013', 'Couplings', 1200.00, 45, 12, 'Main Warehouse'],
            ['Pressure Gauge', 'PRG-STD-014', 'Instruments', 650.00, 70, 18, 'Main Warehouse'],
            ['Electric Cable 100m', 'CBL-100M-015', 'Cables', 2200.00, 25, 8, 'Electronics Wing']
        ];

        for (const product of products) {
            await connection.execute(
                `INSERT INTO products (name, sku, category, unit_price, current_stock, minimum_stock, warehouse) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                product
            );
        }

        // Insert customer followups
        console.log('Creating customer followups...');
        const followups = [
            [3, 'Discussed requirements for 20 industrial motors. Waiting for budget approval.', '2024-08-20', 2],
            [4, 'Sent product catalog and pricing. Very interested in conveyor systems.', '2024-08-15', 2],
            [6, 'Technical meeting scheduled to discuss fabric machinery requirements.', '2024-08-18', 2],
            [8, 'Initial inquiry about food processing equipment. Need to understand scale.', '2024-08-22', 2],
            [3, 'Follow-up call completed. Budget approved, ready to place order.', null, 2],
            [4, 'Site visit completed. Preparing detailed quotation.', null, 2]
        ];

        for (const followup of followups) {
            await connection.execute(
                'INSERT INTO customer_followups (customer_id, note, follow_up_date, created_by) VALUES (?, ?, ?, ?)',
                followup
            );
        }

        // Insert stock movements
        console.log('Creating stock movements...');
        const stockMovements = [
            [1, 50, 'IN', 'Initial stock purchase', 3],
            [2, 100, 'IN', 'Initial stock purchase', 3],
            [3, 150, 'IN', 'Initial stock purchase', 3],
            [4, 30, 'IN', 'Initial stock purchase', 3],
            [5, 50, 'IN', 'Initial stock purchase', 3],
            [1, 25, 'OUT', 'Sales to Tech Solutions Pvt Ltd', 2],
            [2, 50, 'OUT', 'Sales to Electro Mart', 2],
            [3, 50, 'OUT', 'Sales to Singh Logistics', 2],
            [6, 40, 'IN', 'Restocking from supplier', 3],
            [7, 60, 'IN', 'New batch received', 3],
            [8, 20, 'IN', 'Initial stock purchase', 3],
            [9, 35, 'IN', 'Initial stock purchase', 3],
            [10, 50, 'IN', 'Initial stock purchase', 3]
        ];

        for (const movement of stockMovements) {
            await connection.execute(
                'INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by) VALUES (?, ?, ?, ?, ?)',
                movement
            );
        }

        // Insert sales challans
        console.log('Creating sales challans...');
        const challans = [
            ['CH-000001', 1, 30, 'confirmed', 2],
            ['CH-000002', 2, 25, 'confirmed', 2],
            ['CH-000003', 5, 15, 'confirmed', 2],
            ['CH-000004', 7, 40, 'confirmed', 2],
            ['CH-000005', 1, 20, 'draft', 2],
            ['CH-000006', 3, 35, 'draft', 2]
        ];

        for (const challan of challans) {
            await connection.execute(
                'INSERT INTO sales_challans (challan_number, customer_id, total_quantity, status, created_by) VALUES (?, ?, ?, ?, ?)',
                challan
            );
        }

        // Insert challan items
        console.log('Creating challan items...');
        const challanItems = [
            // Challan 1 items (Tech Solutions)
            [1, 1, 'Industrial Motor 5HP', 'MOT-5HP-001', 10, 15000.00],
            [1, 2, 'Bearing Set - Premium', 'BRG-PREM-002', 20, 2500.00],
            // Challan 2 items (Electro Mart)
            [2, 5, 'Electrical Control Panel', 'ECP-STD-005', 5, 8500.00],
            [2, 9, 'PLC Module', 'PLC-MOD-009', 10, 6500.00],
            [2, 12, 'Temperature Sensor', 'TMP-SNS-012', 10, 850.00],
            // Challan 3 items (Singh Logistics)
            [3, 3, 'Steel Pipe 6m', 'PIPE-STL-003', 15, 3200.00],
            // Challan 4 items (Agarwal Pharmaceuticals)
            [4, 7, 'Safety Valve DN50', 'SV-DN50-007', 20, 4500.00],
            [4, 14, 'Pressure Gauge', 'PRG-STD-014', 20, 650.00],
            // Draft challan items
            [5, 4, 'Hydraulic Pump', 'HYD-PMP-004', 5, 25000.00],
            [5, 8, 'Gearbox 1:10 Ratio', 'GBX-110-008', 15, 18000.00],
            [6, 6, 'Conveyor Belt 10m', 'CVB-10M-006', 10, 12000.00],
            [6, 10, 'Pneumatic Cylinder', 'PNC-CYL-010', 25, 3500.00]
        ];

        for (const item of challanItems) {
            await connection.execute(
                'INSERT INTO challan_items (challan_id, product_id, product_name, sku, quantity, unit_price) VALUES (?, ?, ?, ?, ?, ?)',
                item
            );
        }

        console.log('\n🎉 Test data setup completed successfully!');
        console.log('\n📋 Test Credentials:');
        console.log('┌─────────────────────────────┬─────────────┬──────────┐');
        console.log('│ Email                       │ Password    │ Role     │');
        console.log('├─────────────────────────────┼─────────────┼──────────┤');
        console.log('│ admin@opsflow.com           │ password123 │ admin    │');
        console.log('│ sales@opsflow.com           │ password123 │ sales    │');
        console.log('│ warehouse@opsflow.com       │ password123 │ warehouse│');
        console.log('│ accounts@opsflow.com        │ password123 │ accounts │');
        console.log('│ demo@opsflow.com            │ password123 │ sales    │');
        console.log('└─────────────────────────────┴─────────────┴──────────┘');
        
        console.log('\n📊 Sample Data Created:');
        console.log('• 5 test users with different roles');
        console.log('• 8 sample customers (leads, prospects, customers)');
        console.log('• 15 products across different categories');
        console.log('• 6 customer followup records');
        console.log('• 13 stock movement entries');
        console.log('• 6 sales challans (4 confirmed, 2 draft)');
        console.log('• 12 challan items with product details');
        
        console.log('\n🚀 You can now login with any of the test credentials above!');

    } catch (error) {
        console.error('Error setting up test data:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the setup
setupTestData();