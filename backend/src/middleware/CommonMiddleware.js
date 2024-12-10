const { validationResult, check } = require('express-validator');
const sanitize = require('sanitize-html');

// Helper function to validate string validators
const stringValidator = (fieldName, minLength, maxLength) => {
  return check(fieldName)
    .custom((value) => {
      if (value === '' || value === null) {
        return true;
      }
      if (typeof value !== 'string') {
        throw new Error(`${fieldName} must be a string`);
      }
      value = value.trim();
      if (value.length < minLength || value.length > maxLength) {
        throw new Error(`${fieldName} must be between ${minLength} and ${maxLength} characters`);
      }
      if (!/^[a-zA-Z\s]*$/.test(value)) {
        throw new Error(`${fieldName} must contain only letters and spaces`);
      }
      return true;
    })
    .optional({ nullable: true });
};

// Helper function to validate numeric validators
const numericValidator = (fieldName, minLength, maxLength) => {
  return check(fieldName)
    .trim()
    .notEmpty().withMessage(`${fieldName} is required`)
    .isNumeric().withMessage(`${fieldName} must be a number`)
    .isLength({ min: minLength, max: maxLength }).withMessage(`${fieldName} must be between ${minLength} and ${maxLength} characters`);
};

// Helper function to validate numeric string hyphens validators
const NumericStringValidator = (fieldName, minLength, maxLength) => {
  return check(fieldName)
    .custom((value) => {
      if (value === '' || value === null) {
        return true;
      }

      if (typeof value !== 'string') {
        throw new Error(`${fieldName} must be a string`);
      }

      value = value.trim();

      if (value.length < minLength || value.length > maxLength) {
        throw new Error(`${fieldName} must be between ${minLength} and ${maxLength} characters`);
      }

      if (!/^[a-zA-Z0-9\s\-\.,;:'"!?()\[\]{}_+=*&^%$#@~`\\|<>\/]*$/.test(value)) {
        throw new Error(`${fieldName} contains invalid characters.`);
      }

      return true;
    })
    .optional({ nullable: true });
};

// Helper function to validate dates
const DateValidator = (fieldName) => {
  return check(fieldName)
    .custom((value) => {
      if (value === undefined || value === null || value === '') {
        return true;
      }
      if (typeof value !== 'string') {
        throw new Error(`${fieldName} must be a string`);
      }
      value = value.trim();
      if (value === '') {
        return true;
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`${fieldName} must be a valid date`);
      }
      return true;
    })
    .optional({ nullable: true });
};

// Helper function to validate URLs
const urlValidator = (fieldName) => {
  return check(fieldName)
    .custom((value) => {
      if (value === undefined || value === 'undefined' || value === null || value === '') {
        return true;
      }

      if (typeof value !== 'string') {
        throw new Error(`${fieldName} must be a string`);
      }

      value = value.trim();
      if (value === '') {
        return true;
      }

      if (/[^a-zA-Z0-9\-\._~:/?#[\]@!$&'()*+,;=]/.test(value)) {
        throw new Error(`${fieldName} contains invalid characters for a URL`);
      }

      try {
        new URL(value);
        return true;
      } catch (error) {
        throw new Error(`${fieldName} is not a valid URL`);
      }
    })
    .optional({ nullable: true });
};

// Helper function to validate WYSIWYG editors
const wysiwygValidator = (fieldName, minLength, maxLength) => {
  return check(fieldName)
    .custom((value) => {
      if (value === undefined || value === null || value === '') {
        return true;
      }
      if (typeof value !== 'string') {
        throw new Error(`${fieldName} must be a string`);
      }
      value = value.trim();
      if (value === '') {
        return true;
      }

      const textContent = value.replace(/<[^>]*>/g, '');

      if (textContent.length < minLength) {
        throw new Error(`${fieldName} must be at least ${minLength} characters long`);
      }
      if (textContent.length > maxLength) {
        throw new Error(`${fieldName} must not exceed ${maxLength} characters`);
      }

      return true;
    })
    .optional({ nullable: true });
};

// Helper function for array validation
const commonArrayValidator = (fieldName, itemValidator) => {
  return check(fieldName).custom((value, { req }) => {
    if (value === '' || value === null) {
      return true;
    }
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        throw new Error(`${fieldName} must be a valid JSON array`);
      }
    }
    if (!Array.isArray(value)) {
      throw new Error(`${fieldName} must be an array`);
    }

    value.forEach((item, index) => {
      const result = itemValidator(item, index, req);
      if (result !== true) {
        throw new Error(`Item ${index} in ${fieldName}: ${result}`);
      }
    });
    return true;
  }).optional({ nullable: true });
};

// Specific validators
const categoryValidator = (item) => {
  if (item === '' || item === null) {
    return true;
  }
  if (typeof item !== 'string') {
    return 'Category must be a string';
  }
  return true;
};

const specificationValidator = (item) => {
  if (item === '' || item === null) {
    return true;
  }
  if (!item.title || !item.description) {
    return 'Specification must have a title and description';
  }
  return true;
};

const variantValidator = (item) => {
  if (item === '' || item === null) {
    return true;
  }
  if (!item.dosage || !item.sku || !item.packSize || !item.price || !item.quantity) {
    return 'Variant must have dosage, sku, packSize, price, and quantity';
  }
  return true;
};

const alternativeProductValidator = (item) => {
  if (item === '' || item === null) {
    return true;
  }
  if (!item.productId || !item.variantId) {
    return 'Alternative product must have productId and variantId';
  }
  return true;
};

const alternativeProductsValidator = (fieldName) => {
  return commonArrayValidator(fieldName, alternativeProductValidator);
};

const specificationsValidator = (fieldName) => {
  return commonArrayValidator(fieldName, specificationValidator);
};

const variantsValidator = (fieldName) => {
  return commonArrayValidator(fieldName, variantValidator);
};

const categoriesValidator = (fieldName) => {
  return commonArrayValidator(fieldName, categoryValidator);
};

module.exports = {
  stringValidator,
  numericValidator,
  NumericStringValidator,
  DateValidator,
  urlValidator,
  wysiwygValidator,
  commonArrayValidator,
  categoryValidator,
  specificationValidator,
  variantValidator,
  alternativeProductValidator,
  alternativeProductsValidator,
  specificationsValidator,
  variantsValidator,
  categoriesValidator,
};
