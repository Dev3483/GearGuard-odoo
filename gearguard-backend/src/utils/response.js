/**
 * Standardized API Response
 * @param {boolean} success - Request success status
 * @param {string} message - Response message
 * @param {any} data - Payload data
 */
module.exports = (success, message, data = null) => ({ success, message, data });
