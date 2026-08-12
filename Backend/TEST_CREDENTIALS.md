# Test Credentials & Sample Data

This document contains test credentials and instructions for setting up sample data in your CRM system.

## 🔐 Test Credentials

All test accounts use the password: `password123`

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| admin@opsflow.com | password123 | admin | Full system access |
| sales@opsflow.com | password123 | sales | Sales operations |
| warehouse@opsflow.com | password123 | warehouse | Inventory management |
| accounts@opsflow.com | password123 | accounts | Financial operations |
| demo@opsflow.com | password123 | sales | Demo/testing |

## 🚀 Quick Setup

1. **Ensure your database is running** and your `.env` file is configured properly.

2. **Run the test data setup script**:
   ```bash
   cd Backend
   node setup-test-data.js
   ```

3. **Start the backend server**:
   ```bash
   npm run dev
   ```

4. **Login with any test credential** listed above.

## 📊 Sample Data Included

### Customers (8 records)
- **Tech Solutions Pvt Ltd** (Rajesh Gupta) - Active customer
- **Electro Mart** (Priya Sharma) - Regular customer
- **Kumar Manufacturing** (Amit Kumar) - Prospect with follow-up
- **Patel Retail Store** (Neha Patel) - New lead
- **Singh Logistics** (Vikram Singh) - Fleet management client
- **Reddy Textiles** (Anita Reddy) - Textile industry prospect
- **Agarwal Pharmaceuticals** (Ravi Agarwal) - Medical equipment client
- **Jain Food Processing** (Deepika Jain) - Food industry lead

### Products (15 items)
- Industrial motors and machinery
- Electronic components (PLCs, sensors, cables)
- Hydraulic and pneumatic systems
- Safety equipment and instruments
- Various industrial supplies with realistic pricing

### Sales Data
- **6 Sales Challans** (4 confirmed orders, 2 drafts)
- **Stock movements** showing inventory transactions
- **Customer followups** with scheduled dates and notes
- **Realistic pricing** and quantities

## 🎯 Testing Scenarios

### For Admin Role
- View dashboard with complete analytics
- Manage all users and system settings
- Access all modules and reports

### For Sales Role
- Create and manage customer records
- Generate sales challans
- Track follow-ups and leads
- View sales performance data

### For Warehouse Role
- Manage inventory levels
- Process stock movements
- Update product information
- Monitor low stock alerts

### For Accounts Role
- View financial reports
- Track sales transactions
- Manage pricing and costs
- Generate accounting reports

## 📋 Customer Scenarios

1. **New Lead (Neha Patel)**: Practice lead qualification and follow-up scheduling
2. **Hot Prospect (Amit Kumar)**: Ready for conversion with follow-up date set
3. **Regular Customer (Priya Sharma)**: Ongoing relationship management
4. **High-Value Client (Rajesh Gupta)**: Premium account management

## 🛍️ Product Categories

- **Motors**: Industrial motors with different HP ratings
- **Electronics**: Control panels, PLCs, sensors
- **Hydraulic**: Pumps and hydraulic systems
- **Pneumatic**: Cylinders and air systems
- **Mechanical**: Gearboxes, couplings, chains
- **Safety**: Valves and pressure instruments

## 📈 Dashboard Data

The sample data includes realistic metrics for:
- Total sales revenue
- Customer distribution by type
- Inventory levels and alerts
- Recent activities and transactions
- Performance indicators

## 🔄 Resetting Data

To reset the sample data, simply run the setup script again:
```bash
node setup-test-data.js
```

This will clear existing data and recreate all sample records.

## 🆘 Troubleshooting

### Database Connection Issues
- Verify your `.env` file has correct database credentials
- Ensure MySQL service is running
- Check if the database `erp_crm` exists

### Login Issues
- Confirm backend server is running on correct port
- Check network connectivity between frontend and backend
- Verify JWT secrets are configured in `.env`

### Missing Data
- Run the setup script if tables appear empty
- Check database permissions for your MySQL user
- Ensure all required tables were created successfully

## 📞 Support

If you encounter issues with the test data setup, check:
1. Database connection in the backend
2. All required npm packages are installed
3. Environment variables are properly configured
4. MySQL service is running and accessible