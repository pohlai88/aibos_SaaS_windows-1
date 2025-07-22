"use strict";
/**
 * Simple Validation for AI-BOS Shared Library
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchema = validateSchema;
function validateSchema(schema, data) {
    try {
        // Simple validation for now
        if (schema && typeof schema === 'object') {
            const errors = [];
            for (const [key, validator] of Object.entries(schema)) {
                if (validator === 'required' && !data[key]) {
                    errors.push(`${key} is required`);
                }
            }
            return { valid: errors.length === 0, errors };
        }
        return { valid: true, errors: [] };
    }
    catch (error) {
        return { valid: false, errors: [String(error)] };
    }
}
//# sourceMappingURL=validation.js.map