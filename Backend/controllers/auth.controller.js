const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const register = async(req,res) => {
    try {
        const { name, email, password, role } = req.body;
            // validating the input
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // checking if the user already exits

        const existingUser = await User.findByEmail(email);
        if (existingUser){
            return res.status(409).json({
                success: false,
                message: "User already exists"
            })
        }

        // hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // creating the user
        const userId = await User.create(
            name, email, hashedPassword, role
        )

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: userId,
                name,
                email,
                role
            }
        });

    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred during registration",
        })
    }
};

const loginUser = async(req,res) => {
    try {
        const {email , password} = req.body;
        // validate password
        if ( !email || !password ){
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            })
        }

        // find user 

        const user = await User.findByEmail(email);
        if (!user){
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        // compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if ( !isPasswordValid){
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        // generate jwt 
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        // response
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:",error);

        return res.status(500).json({
            success: false,
            message: "An error occurred during login",
        })
    }
};

const getMe = async(req,res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user){
            return  res.status(404).json({
                success: false,
                message: "User not found"
            })
        };

        return res.status(200).json({
            success: true,
            user
        });
    } catch(error){
        console.error("GetMe error:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching user data",
        });
    }
};

module.exports = {
     register ,
        loginUser,
        getMe

};