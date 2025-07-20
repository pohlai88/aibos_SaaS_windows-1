// Simple validation functions for CRM-SDK

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  message: string;
  path: string[];
  input?: any;
}

export function validateCustomer(customerData: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!customerData.customer_code || customerData.customer_code.trim() === '') {
    errors.push({
      message: 'Customer code is required',
      path: ['customer_code'],
      input: customerData.customer_code
    });
  }

  if (!customerData.name || customerData.name.trim() === '') {
    errors.push({
      message: 'Customer name is required',
      path: ['name'],
      input: customerData.name
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 