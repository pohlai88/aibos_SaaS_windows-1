import { z } from 'zod';

export function validateRequired(value: any, fieldName: string): { isValid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
}

export function validateNumber(value: any, fieldName: string, min?: number, max?: number): { isValid: boolean; error?: string } {
  const num = Number(value);
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  
  if (min !== undefined && num < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { isValid: false, error: `${fieldName} must be at most ${max}` };
  }
  
  return { isValid: true };
}

export function validateString(value: any, fieldName: string, minLength?: number, maxLength?: number): { isValid: boolean; error?: string } {
  if (typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} must be a string` };
  }
  
  if (minLength !== undefined && value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    return { isValid: false, error: `${fieldName} must be at most ${maxLength} characters` };
  }
  
  return { isValid: true };
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailSchema = z.string().email();
  const result = emailSchema.safeParse(email);
  
  if (!result.success) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
}

export function validateDate(date: string): { isValid: boolean; error?: string } {
  const dateSchema = z.string().datetime();
  const result = dateSchema.safeParse(date);
  
  if (!result.success) {
    return { isValid: false, error: 'Invalid date format' };
  }
  
  return { isValid: true };
} 