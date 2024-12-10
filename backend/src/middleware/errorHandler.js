const { validationResult } = require('express-validator');

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      type: 'field',
      value: error.value,
      message: error.msg,
      path: error.param,
      location: error.location
    }));

    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: formattedErrors
    });
  }
  next();
};

const handleServerErrors = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    const errors = Object.values(err.errors).map(error => ({
      type: 'field',
      value: error.value,
      msg: error.message,
      path: error.path,
      location: 'body'
    }));
    return res.status(statusCode).json({
      status: "fail",
      message,
      errors
    });
  }

  res.status(statusCode).json({
    status: "fail",
    message
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { handleErrors, handleServerErrors, notFound };
