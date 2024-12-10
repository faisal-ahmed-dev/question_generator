const express = require('express');
const UserController = require('../../controller/UserController.js');
const { updateUserValidator, loginValidator, createUserValidator } = require('../../middleware/UserMiddleware.js');
const { adminAuth, userAuth } = require('../../middleware/AuthMiddleware.js');

const UserRouter = express.Router();

// Create User
UserRouter.post('/CreateUser', UserController.CreateUser);

// Read User
UserRouter.get('/ReadUser', adminAuth, UserController.ReadUserAll);
UserRouter.get('/ReadUser/:id', UserController.ReadUser);

// Update User
UserRouter.put('/UpdateUser/:id', userAuth, [updateUserValidator()], UserController.UpdateUser);

// Delete User
UserRouter.delete('/DeleteUser/:id', adminAuth, UserController.DeleteUser);

// Login User
UserRouter.post('/LoginUser', UserController.LoginUser);
// Login Verify
UserRouter.get('/LoginUser', UserController.LoginVerify);

// Logout User
UserRouter.post('/LogoutUser', UserController.LogoutUser);

// Change Password
UserRouter.put('/ChangePassword', UserController.ChangePassword);

module.exports = UserRouter;
