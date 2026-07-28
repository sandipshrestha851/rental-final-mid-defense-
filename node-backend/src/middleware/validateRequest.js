const { body, param, query, validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
}

const passwordRules = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
  .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
  .matches(/[0-9]/).withMessage('Password must contain a number')
  .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character');

const registerRules = [
  body('full_name')
    .trim().notEmpty().withMessage('Full name is required')
    .isLength({ max: 100 }).withMessage('Full name must be under 100 characters'),
  body('email')
    .trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  passwordRules,
  body('phone')
    .optional({ values: 'falsy' })
    .matches(/^[\d\s\-+()]{7,20}$/).withMessage('Invalid phone number format'),
  body('gender')
    .optional({ values: 'falsy' })
    .isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender value'),
  body('date_of_birth')
    .optional({ values: 'falsy' })
    .isDate().withMessage('Invalid date of birth'),
  body('bio')
    .optional({ values: 'falsy' })
    .isLength({ max: 500 }).withMessage('Bio must be under 500 characters'),
  body('role')
    .optional({ values: 'falsy' })
    .isIn(['tenant', 'landlord', 'admin']).withMessage('Invalid role'),
  handleValidationErrors,
];

const loginRules = [
  body('email')
    .trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const adminLoginRules = [
  body('username')
    .trim().notEmpty().withMessage('Username is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const messageParamRules = [
  param('otherUserId')
    .isInt({ min: 1 }).withMessage('Invalid user id'),
  handleValidationErrors,
];

const propertyRules = [
  body('title')
    .trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must be under 255 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description')
    .optional({ values: 'falsy' })
    .isLength({ max: 5000 }).withMessage('Description must be under 5000 characters'),
  body('location')
    .optional({ values: 'falsy' })
    .isLength({ max: 255 }).withMessage('Location must be under 255 characters'),
  body('beds')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 }).withMessage('Beds must be a non-negative integer'),
  body('baths')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 }).withMessage('Baths must be a non-negative integer'),
  body('guests')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 }).withMessage('Guests must be a non-negative integer'),
  body('category')
    .optional({ values: 'falsy' })
    .isIn(['Apartment', 'House', 'Villa', 'Studio', 'Condo', 'Loft']).withMessage('Invalid category'),
  handleValidationErrors,
];

const bookingRules = [
  body('propertyId')
    .trim().notEmpty().withMessage('Property ID is required')
    .isUUID().withMessage('Invalid property ID format'),
  body('checkIn')
    .notEmpty().withMessage('Check-in date is required')
    .isDate().withMessage('Invalid check-in date'),
  body('checkOut')
    .notEmpty().withMessage('Check-out date is required')
    .isDate().withMessage('Invalid check-out date'),
  body('guests')
    .notEmpty().withMessage('Number of guests is required')
    .isInt({ min: 1 }).withMessage('Guests must be at least 1'),
  body('totalAmount')
    .notEmpty().withMessage('Total amount is required')
    .isFloat({ min: 0 }).withMessage('Total amount must be positive'),
  handleValidationErrors,
];

const idParamRule = [
  param('id')
    .notEmpty().withMessage('ID is required'),
  handleValidationErrors,
];

const statusUpdateRule = [
  param('id')
    .notEmpty().withMessage('Property ID is required'),
  body('status')
    .trim().notEmpty().withMessage('Status is required')
    .isIn(['Active', 'Pending', 'Rejected', 'Draft']).withMessage('Invalid status value'),
  handleValidationErrors,
];

module.exports = {
  registerRules, loginRules, adminLoginRules,
  messageParamRules, propertyRules, bookingRules,
  idParamRule, statusUpdateRule,
  handleValidationErrors, passwordRules,
};
