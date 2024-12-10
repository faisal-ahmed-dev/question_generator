const jwt = require('jsonwebtoken');
const UsersModel = require('../model/UsersModel');
require('dotenv').config();

const authenticate = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ status: "unauthorized" });
  }

  jwt.verify(token, process.env.SECRET_KEY, async (err, decodedData) => {
    if (err) {
      return res.status(401).json({ status: "unauthorized" });
    } else {
      try {
        const user = await UsersModel.findById(decodedData.userId);
        if (!user) {
          return res.status(401).json({ status: "unauthorized" });
        }
        req.user = user; // Attach user to request
        next();
      } catch (error) {
        return res.status(500).json({ status: "error", message: "Internal server error" });
      }
    }
  });
};

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await UsersModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (decoded.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { authenticate, userAuth, adminAuth };
