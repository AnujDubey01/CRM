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

        const jwtSecret =
            process.env.JWT_SECRET ||
            process.env.ACCESS_TOKEN_SECRET;

        if (!jwtSecret) {
            return res.status(500).json({
                success: false,
                message: "JWT secret is not configured"
            });
        }

        const decoded = jwt.verify(token, jwtSecret);

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
