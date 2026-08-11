const Customer = require("../models/customer.model");
const CustomerFollowup = require("../models/customerFollowup.model");

const createFollowup = async (req, res) => {
    try {
        const { id: customerId } = req.params;

        const {
            note,
            follow_up_date
        } = req.body;

        // Validate
        if (!note) {
            return res.status(400).json({
                success: false,
                message: "Follow-up note is required"
            });
        }

        // Check customer exists
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // Create follow-up
        const followupId = await CustomerFollowup.create({
            customer_id: customerId,
            note,
            follow_up_date,
            created_by: req.user.id
        });

        const followup = await CustomerFollowup.findById(
            followupId
        );

        return res.status(201).json({
            success: true,
            message: "Follow-up added successfully",
            followup
        });

    } catch (error) {
        console.error("Create follow-up error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while adding follow-up"
        });
    }
};

const getFollowups = async (req, res) => {
    try {
        const { id: customerId } = req.params;

        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const followups =
            await CustomerFollowup.findByCustomerId(customerId);

        return res.status(200).json({
            success: true,
            followups
        });

    } catch (error) {
        console.error("Get follow-ups error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching follow-ups"
        });
    }
};

module.exports = {
    createFollowup,
    getFollowups
}