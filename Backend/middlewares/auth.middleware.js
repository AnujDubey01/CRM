const jwt = require("jsonwebtoken");

const authenticate = (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;
        // checking if the auth header exists
        if ( !authHeader){
            return res.status(401).json({
                success: false,
                message: "Authorization header missing"
            });
        }

        // splitting the auth header to get the token
        const token = authHeader.split(" ")[1];
        if (!token){
            return res.status(401).json({
                success: false,
                message: "Token missing"
            });
        }

        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
}

module.exports = authenticate;