-- CRM Database Setup with Test Data
-- This script creates the database schema and inserts dummy data for testing

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS erp_crm;
USE erp_crm;

-- Drop existing tables (in correct order to avoid foreign key conflicts)
DROP TABLE IF EXISTS challan_items;
DROP TABLE IF EXISTS sales_challans;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS customer_followups;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'sales', 'warehouse', 'accounts') DEFAULT 'sales',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    business_name VARCHAR(100),
    gst_number VARCHAR(20),
    customer_type ENUM('lead', 'prospect', 'customer') DEFAULT 'lead',
    address TEXT,
    status ENUM('lead', 'prospect', 'customer', 'inactive') DEFAULT 'lead',
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 10,
    warehouse VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create customer_followups table
CREATE TABLE customer_followups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    note TEXT NOT NULL,
    follow_up_date DATE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create stock_movements table
CREATE TABLE stock_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    movement_type ENUM('IN', 'OUT') NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create sales_challans table
CREATE TABLE sales_challans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    challan_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    total_quantity INT NOT NULL,
    status ENUM('draft', 'confirmed', 'cancelled') DEFAULT 'draft',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create challan_items table
CREATE TABLE challan_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    challan_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challan_id) REFERENCES sales_challans(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert test users with hashed passwords (password: 'password123' for all)
-- Note: These are bcrypt hashes for 'password123'
INSERT INTO users (name, email, password, role) VALUES
('John Admin', 'admin@opsflow.com', '$2b$10$rOHw8qZnPh9YXKl8J4Vwj.xM.Nz8VQrq2Rp5vK7hGfQq9J8L3Ns6K', 'admin'),
('Sarah Sales', 'sales@opsflow.com', '$2b$10$rOHw8qZnPh9YXKl8J4Vwj.xM.Nz8VQrq2Rp5vK7hGfQq9J8L3Ns6K', 'sales'),
('Mike Warehouse', 'warehouse@opsflow.com', '$2b$10$rOHw8qZnPh9YXKl8J4Vwj.xM.Nz8VQrq2Rp5vK7hGfQq9J8L3Ns6K', 'warehouse'),
('Lisa Accounts', 'accounts@opsflow.com', '$2b$10$rOHw8qZnPh9YXKl8J4Vwj.xM.Nz8VQrq2Rp5vK7hGfQq9J8L3Ns6K', 'accounts'),
('Demo User', 'demo@opsflow.com', '$2b$10$rOHw8qZnPh9YXKl8J4Vwj.xM.Nz8VQrq2Rp5vK7hGfQq9J8L3Ns6K', 'sales');

-- Insert sample customers
INSERT INTO customers (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes) VALUES
('Rajesh Gupta', '+919876543210', 'rajesh@techsolutions.com', 'Tech Solutions Pvt Ltd', '27ABCDE1234F1Z5', 'customer', '123 Tech Park, Bangalore, Karnataka 560001', 'customer', NULL, 'Major client for IT hardware'),
('Priya Sharma', '+919876543211', 'priya@electromart.com', 'Electro Mart', '29FGHIJ5678K2L6', 'customer', '456 Electronics Street, Mumbai, Maharashtra 400001', 'customer', NULL, 'Regular orders for electronic components'),
('Amit Kumar', '+919876543212', 'amit@manufacturing.in', 'Kumar Manufacturing', '24MNOPQ9012R3S7', 'prospect', '789 Industrial Area, Delhi 110001', 'prospect', '2024-08-20', 'Interested in bulk machinery parts'),
('Neha Patel', '+919876543213', 'neha@retailstore.com', 'Patel Retail Store', '07TUVWX3456Y4Z8', 'lead', '321 Market Plaza, Ahmedabad, Gujarat 380001', 'lead', '2024-08-15', 'New lead from trade show'),
('Vikram Singh', '+919876543214', 'vikram@logistics.co.in', 'Singh Logistics', '33ABCDE7890F5G1', 'customer', '654 Transport Hub, Pune, Maharashtra 411001', 'customer', NULL, 'Fleet management supplies'),
('Anita Reddy', '+919876543215', 'anita@textiles.com', 'Reddy Textiles', '36HIJKL2345M6N2', 'prospect', '987 Textile District, Chennai, Tamil Nadu 600001', 'prospect', '2024-08-18', 'Looking for fabric machinery'),
('Ravi Agarwal', '+919876543216', 'ravi@pharma.in', 'Agarwal Pharmaceuticals', '10OPQRS6789T7U3', 'customer', '147 Pharma City, Hyderabad, Telangana 500001', 'customer', NULL, 'Medical equipment supplier'),
('Deepika Jain', '+919876543217', 'deepika@foodprocessing.com', 'Jain Food Processing', '22VWXYZ1234A8B4', 'lead', '258 Food Park, Jaipur, Rajasthan 302001', 'lead', '2024-08-22', 'Interested in food processing equipment');

-- Insert sample products
INSERT INTO products (name, sku, category, unit_price, current_stock, minimum_stock, warehouse) VALUES
('Industrial Motor 5HP', 'MOT-5HP-001', 'Motors', 15000.00, 25, 5, 'Main Warehouse'),
('Bearing Set - Premium', 'BRG-PREM-002', 'Bearings', 2500.00, 50, 10, 'Main Warehouse'),
('Steel Pipe 6m', 'PIPE-STL-003', 'Pipes', 3200.00, 100, 20, 'Storage A'),
('Hydraulic Pump', 'HYD-PMP-004', 'Hydraulic', 25000.00, 15, 3, 'Main Warehouse'),
('Electrical Control Panel', 'ECP-STD-005', 'Electronics', 8500.00, 30, 8, 'Electronics Wing'),
('Conveyor Belt 10m', 'CVB-10M-006', 'Conveyor', 12000.00, 20, 5, 'Storage B'),
('Safety Valve DN50', 'SV-DN50-007', 'Valves', 4500.00, 40, 10, 'Main Warehouse'),
('Gearbox 1:10 Ratio', 'GBX-110-008', 'Gearbox', 18000.00, 12, 4, 'Main Warehouse'),
('PLC Module', 'PLC-MOD-009', 'Electronics', 6500.00, 25, 6, 'Electronics Wing'),
('Pneumatic Cylinder', 'PNC-CYL-010', 'Pneumatic', 3500.00, 35, 8, 'Main Warehouse'),
('Chain Drive 2m', 'CHN-DRV-011', 'Drives', 1800.00, 60, 15, 'Storage A'),
('Temperature Sensor', 'TMP-SNS-012', 'Sensors', 850.00, 80, 20, 'Electronics Wing'),
('Coupling Flexible', 'CPL-FLX-013', 'Couplings', 1200.00, 45, 12, 'Main Warehouse'),
('Pressure Gauge', 'PRG-STD-014', 'Instruments', 650.00, 70, 18, 'Main Warehouse'),
('Electric Cable 100m', 'CBL-100M-015', 'Cables', 2200.00, 25, 8, 'Electronics Wing');

-- Insert sample customer followups
INSERT INTO customer_followups (customer_id, note, follow_up_date, created_by) VALUES
(3, 'Discussed requirements for 20 industrial motors. Waiting for budget approval.', '2024-08-20', 2),
(4, 'Sent product catalog and pricing. Very interested in conveyor systems.', '2024-08-15', 2),
(6, 'Technical meeting scheduled to discuss fabric machinery requirements.', '2024-08-18', 2),
(8, 'Initial inquiry about food processing equipment. Need to understand scale.', '2024-08-22', 2),
(3, 'Follow-up call completed. Budget approved, ready to place order.', NULL, 2),
(4, 'Site visit completed. Preparing detailed quotation.', NULL, 2);

-- Insert sample stock movements
INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by) VALUES
(1, 50, 'IN', 'Initial stock purchase', 3),
(2, 100, 'IN', 'Initial stock purchase', 3),
(3, 150, 'IN', 'Initial stock purchase', 3),
(4, 30, 'IN', 'Initial stock purchase', 3),
(5, 50, 'IN', 'Initial stock purchase', 3),
(1, 25, 'OUT', 'Sales to Tech Solutions Pvt Ltd', 2),
(2, 50, 'OUT', 'Sales to Electro Mart', 2),
(3, 50, 'OUT', 'Sales to Singh Logistics', 2),
(6, 40, 'IN', 'Restocking from supplier', 3),
(7, 60, 'IN', 'New batch received', 3),
(8, 20, 'IN', 'Initial stock purchase', 3),
(9, 35, 'IN', 'Initial stock purchase', 3),
(10, 50, 'IN', 'Initial stock purchase', 3);

-- Insert sample sales challans
INSERT INTO sales_challans (challan_number, customer_id, total_quantity, status, created_by) VALUES
('CH-000001', 1, 30, 'confirmed', 2),
('CH-000002', 2, 25, 'confirmed', 2),
('CH-000003', 5, 15, 'confirmed', 2),
('CH-000004', 7, 40, 'confirmed', 2),
('CH-000005', 1, 20, 'draft', 2),
('CH-000006', 3, 35, 'draft', 2);

-- Insert sample challan items
INSERT INTO challan_items (challan_id, product_id, product_name, sku, quantity, unit_price) VALUES
-- Challan 1 items (Tech Solutions)
(1, 1, 'Industrial Motor 5HP', 'MOT-5HP-001', 10, 15000.00),
(1, 2, 'Bearing Set - Premium', 'BRG-PREM-002', 20, 2500.00),

-- Challan 2 items (Electro Mart)
(2, 5, 'Electrical Control Panel', 'ECP-STD-005', 5, 8500.00),
(2, 9, 'PLC Module', 'PLC-MOD-009', 10, 6500.00),
(2, 12, 'Temperature Sensor', 'TMP-SNS-012', 10, 850.00),

-- Challan 3 items (Singh Logistics)
(3, 3, 'Steel Pipe 6m', 'PIPE-STL-003', 15, 3200.00),

-- Challan 4 items (Agarwal Pharmaceuticals)
(4, 7, 'Safety Valve DN50', 'SV-DN50-007', 20, 4500.00),
(4, 14, 'Pressure Gauge', 'PRG-STD-014', 20, 650.00),

-- Draft challan items
(5, 4, 'Hydraulic Pump', 'HYD-PMP-004', 5, 25000.00),
(5, 8, 'Gearbox 1:10 Ratio', 'GBX-110-008', 15, 18000.00),

(6, 6, 'Conveyor Belt 10m', 'CVB-10M-006', 10, 12000.00),
(6, 10, 'Pneumatic Cylinder', 'PNC-CYL-010', 25, 3500.00);

-- Display completion message
SELECT 'Database setup completed successfully!' AS Message;
SELECT 'Test credentials created:' AS Info;
SELECT 
    email as 'Email',
    'password123' as 'Password',
    role as 'Role'
FROM users 
ORDER BY role, name;