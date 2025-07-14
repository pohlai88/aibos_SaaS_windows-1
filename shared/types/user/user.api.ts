import { User } from "./user";
import { ISODate } from "../primitives";

// Base response interface to ensure consistency
interface BaseResponse {
  success: boolean;
  timestamp?: ISODate;  // Use ISODate for consistency
  requestId?: string;  // Optional: for correlating logs
}

// Successful responses
export interface GetUserResponse extends BaseResponse {
  success: true;
  data: User;
  meta?: { // Optional pagination for future compatibility
    retrieved: 1;
    total?: number;
  };
}

export interface ListUsersResponse extends BaseResponse {
  success: true;
  data: User[];
  meta?: { // Standard pagination fields
    count: number;
    total: number;
    page: number;
    perPage: number;
  };
}

// Error response with more diagnostic info
export interface ErrorResponse extends BaseResponse {
  success: false;
  error: {
    message: string;
    code?: string;     // Machine-readable error code
    details?: unknown; // Additional error context
  };
}

// Optional: Type guard for success responses
export function isSuccessResponse(
  response: GetUserResponse | ListUsersResponse | ErrorResponse
): response is GetUserResponse | ListUsersResponse {
  return response.success;
} 