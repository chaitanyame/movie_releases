/**
 * JSON Validation Utility
 * 
 * Provides validation functions to check data against JSON schemas.
 * Uses simple manual validation (no external dependencies per constitution).
 * 
 * @module scripts/utils/validate-json
 */

'use strict';

/**
 * Validate data against a JSON schema (simple implementation).
 * 
 * @param {Object} data - Data to validate
 * @param {Object} schema - JSON Schema object
 * @returns {{valid: boolean, errors: string[]}}
 */
function validate(data, schema) {
  const errors = [];
  
  // Check type
  if (schema.type && typeof data !== schema.type && schema.type !== 'object' && schema.type !== 'array') {
    errors.push(`Expected type ${schema.type}, got ${typeof data}`);
    return { valid: false, errors };
  }
  
  if (schema.type === 'object' && data !== null && typeof data !== 'object') {
    errors.push(`Expected object, got ${typeof data}`);
    return { valid: false, errors };
  }
  
  if (schema.type === 'array' && !Array.isArray(data)) {
    errors.push(`Expected array, got ${typeof data}`);
    return { valid: false, errors };
  }
  
  // Check required fields (for objects)
  if (schema.required && schema.type === 'object') {
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }
  
  // Check properties (for objects)
  if (schema.properties && schema.type === 'object') {
    for (const key in data) {
      const propSchema = schema.properties[key];
      if (!propSchema && !schema.additionalProperties) {
        errors.push(`Unexpected property: ${key}`);
      } else if (propSchema) {
        const propResult = validate(data[key], propSchema);
        if (!propResult.valid) {
          propResult.errors.forEach(err => errors.push(`${key}: ${err}`));
        }
      }
    }
  }
  
  // Check array items
  if (schema.items && Array.isArray(data)) {
    data.forEach((item, index) => {
      const itemResult = validate(item, schema.items);
      if (!itemResult.valid) {
        itemResult.errors.forEach(err => errors.push(`[${index}]: ${err}`));
      }
    });
  }
  
  // Check enum
  if (schema.enum && !schema.enum.includes(data)) {
    errors.push(`Value must be one of: ${schema.enum.join(', ')}`);
  }
  
  // Check pattern (for strings)
  if (schema.pattern && typeof data === 'string') {
    const regex = new RegExp(schema.pattern);
    if (!regex.test(data)) {
      errors.push(`String does not match pattern: ${schema.pattern}`);
    }
  }
  
  // Check minItems/maxItems (for arrays)
  if (schema.minItems && Array.isArray(data) && data.length < schema.minItems) {
    errors.push(`Array must have at least ${schema.minItems} items, has ${data.length}`);
  }
  
  if (schema.maxItems && Array.isArray(data) && data.length > schema.maxItems) {
    errors.push(`Array must have at most ${schema.maxItems} items, has ${data.length}`);
  }
  
  // Check minimum/maximum (for numbers)
  if (schema.minimum !== undefined && typeof data === 'number' && data < schema.minimum) {
    errors.push(`Number must be >= ${schema.minimum}, got ${data}`);
  }
  
  if (schema.maximum !== undefined && typeof data === 'number' && data > schema.maximum) {
    errors.push(`Number must be <= ${schema.maximum}, got ${data}`);
  }
  
  // Check minLength/maxLength (for strings)
  if (schema.minLength !== undefined && typeof data === 'string' && data.length < schema.minLength) {
    errors.push(`String must be at least ${schema.minLength} characters, got ${data.length}`);
  }
  
  if (schema.maxLength !== undefined && typeof data === 'string' && data.length > schema.maxLength) {
    errors.push(`String must be at most ${schema.maxLength} characters, got ${data.length}`);
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate week data structure.
 * 
 * @param {Object} data - Week data object
 * @param {Object} schema - Week data JSON schema
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateWeekData(data, schema) {
  if (!data) {
    return { valid: false, errors: ['Data is null or undefined'] };
  }
  
  if (typeof data !== 'object') {
    return { valid: false, errors: ['Data must be an object'] };
  }
  
  return validate(data, schema);
}

/**
 * Validate movie release entity.
 * 
 * @param {Object} data - Movie release object
 * @param {Object} schema - Movie release JSON schema
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateMovieRelease(data, schema) {
  if (!data) {
    return { valid: false, errors: ['Data is null or undefined'] };
  }
  
  if (typeof data !== 'object') {
    return { valid: false, errors: ['Data must be an object'] };
  }
  
  return validate(data, schema);
}

/**
 * Load and parse a JSON schema file.
 * 
 * @param {string} schemaPath - Path to schema file
 * @returns {Object} Parsed schema object
 */
function loadSchema(schemaPath) {
  const fs = require('fs');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  return JSON.parse(schemaContent);
}

module.exports = {
  validate,
  validateWeekData,
  validateMovieRelease,
  loadSchema
};
