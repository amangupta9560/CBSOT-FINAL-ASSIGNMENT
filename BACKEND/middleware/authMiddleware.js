const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token missing',
        code: 'AUTH_TOKEN_INVALID',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find the user and attach to request
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        });
      }

      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired, please login again',
          code: 'AUTH_TOKEN_EXPIRED',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid',
        code: 'AUTH_TOKEN_INVALID',
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
