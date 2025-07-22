/**
 * Simple Validation for AI-BOS Shared Library
 */

export function validateSchema(schema: any, data: any): { valid: boolean; errors: string[] } {
  try {
    // Simple validation for now
    if (schema && typeof schema === 'object') {
      const errors: string[] = [];
      for (const [key, validator] of Object.entries(schema)) {
        if (validator === 'required' && !data[key]) {
          errors.push(`${key} is required`);
        }
      }
      return { valid: errors.length === 0, errors };
    }
    return { valid: true, errors: [] };
  } catch (error) {
    return { valid: false, errors: [String(error)] };
  }
}

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};
