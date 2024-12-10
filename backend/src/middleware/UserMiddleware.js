const { validationResult, check, oneOf, body } = require('express-validator');
const { handleErrors } = require('./errorHandler');
const { numericValidator, stringValidator } = require('./CommonMiddleware');

const createUserValidator = () => {
  return [
    numericValidator("mobile", 10, 11),
    check('password')
      .trim().notEmpty()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
      })
      .withMessage('Password is weak')
      .isLength({ max: 31 })
      .withMessage('can be at max 31 chars long')
      .isString()
      .withMessage('input must be a String'),
    handleErrors
  ];
};

const loginValidator = () => {
  return [
    body().custom((value, { req }) => {
      const { mobile, email } = req.body;

      if ((mobile && email) || (!mobile && !email)) {
        throw new Error('Please provide either mobile number or email, but not both');
      }

      return true;
    }),

    check('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email address'),

    check('mobile')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid mobile number'),

    check('password').notEmpty().withMessage('password is required')
  ];
};

const updateUserValidator = () => {
  return [
    check('name')
      .optional()
      .isString().withMessage("String required")
      .matches(/^[A-Za-z\s]+$/).withMessage("Name should only contain letters and spaces"),
    check('email')
      .optional()
      .isEmail().withMessage("Valid Email Required")
      .isString().withMessage("String required"),
    check('gender')
      .optional()
      .isIn(['Male', 'Female']).withMessage("invalid Gender")
      .isString().withMessage("String required"),
    check('dateOfBirth')
      .optional()
      .isDate().withMessage("invalid Date of Birth")
      .isString().withMessage("String required"),
    check('mobile')
      .optional()
      .isString().withMessage("String required")
      .matches(/^[0-9]{10,11}$/).withMessage("Phone number should be 10-11 digits"),
    check('address')
      .optional()
      .isString().withMessage("String required")
      .matches(/^[A-Za-z0-9\s,.-]+$/).withMessage("Address should only contain letters, numbers, spaces, commas, periods, and hyphens"),
    handleErrors
  ];
};

module.exports = { createUserValidator, loginValidator, updateUserValidator };
