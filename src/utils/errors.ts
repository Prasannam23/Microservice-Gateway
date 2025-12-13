import { GraphQLError } from 'graphql';

export class APIError extends GraphQLError {
  constructor(message: string, originalError?: Error, code?: string) {
    super(message, {
      extensions: {
        code: code || 'INTERNAL_SERVER_ERROR'
      }
    });

    if (originalError) {
      Object.defineProperty(this, 'originalError', {
        value: originalError,
        enumerable: true,
        writable: true
      });
    }

    Object.setPrototypeOf(this, APIError.prototype);
  }
}

export const handleAPIError = (error: unknown): never => {
  if (error instanceof Error) {
    const message = error.message;

    if (message.includes('Cannot follow yourself')) {
      throw new APIError('Cannot follow yourself', error, 'SELF_FOLLOW');
    }

    if (message.includes('Already following')) {
      throw new APIError('Already following this user', error, 'DUPLICATE_FOLLOW');
    }

    if (message.includes('User not found')) {
      throw new APIError('User not found', error, 'USER_NOT_FOUND');
    }

    if (message.includes('not found')) {
      throw new APIError('Resource not found', error, 'NOT_FOUND');
    }

    throw new APIError(message, error, 'FOLLOW_SERVICE_ERROR');
  }

  throw new APIError('An unexpected error occurred', undefined, 'INTERNAL_SERVER_ERROR');
};
