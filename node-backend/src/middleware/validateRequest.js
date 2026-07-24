const { body, param, validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
    });
  }
  next();
}

const registerRules = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const loginRules = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const adminLoginRules = [
  body('username')
    .notEmpty().withMessage('Username is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const messageParamRules = [
  param('otherUserId')
    .isInt().withMessage('Invalid user id'),
  handleValidationErrors,
];

module.exports = { registerRules, loginRules, adminLoginRules, messageParamRules };
