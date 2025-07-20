/**
 * Class name utility function
 * Merges class names with proper handling of conditional classes
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @license MIT
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS optimization
 * This function combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
