const Customer = require("../models/customer.model");

const createCustomer = async (req,res) => {
    try {
        const {
            name,
            mobile,
            customer_type
        } = req.body;

        // basic validation
        if (!name || !mobile || !customer_type){
            return res.status(400).json({
                success: false,
                message: "Name, mobile and customer type are required"
            })
        };

        const customerId = await Customer.create(req.body);
        const customer  = await Customer.findById(customerId);

        return res.status(201).json({
            success: true,
            message: "Customer created successfully",
            customer
        });

    } catch (error) {
        console.error("Error creating customer:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the customer"
        })
    }
};

const getCustomer = async ( req,res) => {
    try{
        
        const search = req.query.search || "";

        const page = Math.max(
            parseInt(req.query.page) || 1, 1
        );

        const limit = Math.min(
            parseInt(req.query.limit) || 10 , 100
        );

        const offset = (page-1) * limit;

        const customers  = await Customer.findAll(
            search, limit, offset
        );

        return res.status(200).json({
            success: true,
            page,
            limit,
            customers,
        });
        
    } catch(error) {
        console.error("Get customers error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
    })
}
}

const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            customer
        });

    } catch (error) {
        console.error("Get customer error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching customer"
        });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const {id} = req.params;

        const existingCustomer = await Customer.findById(id);

        if(!existingCustomer){
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const {
            name,
            mobile,
            customer_type
        } = req.body;

        if(!name || !mobile || !customer_type){
            return res.status(400).json({
                success: false,
                message: "Name, mobile and customer type are required"
            });
        }

        await Customer.update(id, req.body);

        const customer  = await Customer.findById(id);

        return res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            customer
        });

    } catch (error) {
        console.error("Update customer error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the customer"
        });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const {id} = req.params;

        const existingCustomer = await Customer.findById(id);

        if(!existingCustomer){
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        await Customer.delete(id);

        return res.status(200).json({
            success: true,
            message: "Customer deleted successfully"
        });

    } catch (error) {
        console.error("Delete customer error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the customer"
        });
    }
};

module.exports = {
    createCustomer,
    getCustomer,
    getCustomerById,
    updateCustomer,
    deleteCustomer
}