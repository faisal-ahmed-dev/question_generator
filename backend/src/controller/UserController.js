const bcrypt = require('bcrypt');
const UsersModel = require('../model/UsersModel.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const CreateUser = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    const existingUser = await UsersModel.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      console.log('User already exists:', existingUser);
      return res
        .status(409)
        .json({ status: 'Conflict', message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UsersModel({
      name,
      email,
      mobile,
      password: hashedPassword,
      userStatus: 'active',
    });

    const savedUser = await newUser.save();

    if (!savedUser) {
      console.log('User not created');
      return res
        .status(500)
        .json({ status: 'Internal Server Error', message: 'User not created' });
    }

    const token = jwt.sign(
      { userId: savedUser._id, userType: savedUser.userType },
      process.env.SECRET_KEY,
      { expiresIn: '7d' }
    );

    res
      .cookie('token', token, {
        httpOnly: true,
        sameSite: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        status: 'Success',
        message: 'User created successfully',
        user: {
          _id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          mobile: savedUser.mobile,
          userType: savedUser.userType,
          userStatus: savedUser.userStatus,
        },
      });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

const ReadUserAll = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = req.query.search || '';
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null;
    const toDate = req.query.toDate ? new Date(req.query.toDate) : null;
    const status = req.query.status;

    const startIndex = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { userType: { $regex: search, $options: 'i' } },
      ];
    }

    if (fromDate && toDate) {
      query.createdAt = { $gte: fromDate, $lte: toDate };
    } else if (fromDate) {
      query.createdAt = { $gte: fromDate };
    } else if (toDate) {
      query.createdAt = { $lte: toDate };
    }

    if (status) {
      query.userStatus = status;
    }

    const totalUsersCount = await UsersModel.countDocuments(query);

    const users = await UsersModel.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(startIndex)
      .limit(limit);

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json({
      status: 'Success',
      currentPage: page,
      totalPages: Math.ceil(totalUsersCount / limit),
      data: users,
    });
  } catch (err) {
    res.json({ status: 'fail', message: err });
  }
};

const ReadUser = async (req, res) => {
  try {
    const user = await UsersModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ status: 'Success', message: user });
  } catch (err) {
    res.json({ status: 'fail', message: err });
  }
};

const UpdateUser = async (req, res) => {
  try {
    const query = { _id: req.params.id };

    const update = await UsersModel.findOneAndUpdate(query, req.body, {
      new: true,
    });

    if (!update) {
      return res.status(404).json({ status: 'Not Found', message: 'User not found' });
    }

    res
      .status(200)
      .json({ status: 'Success', message: 'User Updated successfully' });
  } catch (err) {
    res.json({ status: 'fail', message: err });
  }
};

const DeleteUser = async (req, res) => {
  try {
    const query = { _id: req.params.id };

    const deleted = await UsersModel.findOneAndDelete(query);

    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res
      .status(200)
      .json({ status: 'Success', message: 'User Deleted successfully' });
  } catch (err) {
    res.json({ status: 'fail', message: err });
  }
};

const LoginUser = async (req, res) => {
  try {
    const { mobile, email, password } = req.body;

    let user;

    if (mobile) {
      user = await UsersModel.findOne({ mobile });
    } else if (email) {
      user = await UsersModel.findOne({ email });
    } else {
      return res.status(400).json({ error: 'Mobile number or email is required' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Authentication Failed' });
    }

    if (user.userStatus !== 'active') {
      return res.status(403).json({ message: `Account is ${user.userStatus}` });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.SECRET_KEY,
      { expiresIn: '7d' }
    );

    return res.cookie('token', token, {
      httpOnly: true,
      sameSite: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).json({
      status: 'success',
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        userType: user.userType,
        userStatus: user.userStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

const LoginVerify = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.json({ status: 'fail', message: 'No user token' });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await UsersModel.findById(decoded.userId, { password: 0 });
    if (!user) {
      return res.json({ status: 'fail', message: 'Authentication failed' });
    }

    if (user.userStatus !== 'active') {
      return res.status(403).json({ message: `Account is ${user.userStatus}` });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Error in LoginVerify:', error);
    return res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};

const LogoutUser = (req, res) => {
  try {
    res.clearCookie('token', { path: '/' });
    res.status(200).json({ status: 'success', message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Logout failed', error });
  }
};

const ChangePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    const user = await UsersModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: 'fail', message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res
      .status(200)
      .json({ status: 'Success', message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};

module.exports = {
  CreateUser,
  ReadUserAll,
  ReadUser,
  UpdateUser,
  DeleteUser,
  LoginUser,
  LoginVerify,
  LogoutUser,
  ChangePassword,
};
