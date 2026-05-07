// backend/middleware/authMiddleware.js
// This runs BEFORE any protected route handler
// It checks if the user is logged in by verifying their JWT token

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // JWT tokens are sent in the "Authorization" header like:
    // Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract the token part (remove "Bearer " prefix)
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found, block the request
    if (!token) {
      return res.status(401).json({
        message: 'Not authorized. Please log in first.',
      });
    }

    // Verify the token using our secret key
    // If token is fake or expired, jwt.verify() will throw an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user from the token's payload (we stored id in the token)
    // .select('-password') means: get everything EXCEPT the password
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'User not found. Token is invalid.',
      });
    }

    // Attach the user to the request object
    // Now any route after this middleware can access req.user
    req.user = user;

    // Call next() to move on to the actual route handler
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      message: 'Not authorized. Token failed.',
    });
  }
};

module.exports = { protect };