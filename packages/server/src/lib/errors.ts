export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly cause?: unknown;

  constructor(
    message: string,
    options: { statusCode?: number; code?: string; cause?: unknown; isOperational?: boolean } = {},
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? 'INTERNAL_ERROR';
    this.cause = options.cause;
    this.isOperational = options.isOperational ?? true;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

export class ValidationError extends AppError {
  public readonly details?: unknown;

  constructor(message: string, details?: unknown, cause?: unknown) {
    super(message, { statusCode: 400, code: 'VALIDATION_ERROR', cause });
    this.details = details;
  }

  toJSON(): Record<string, unknown> {
    return { ...super.toJSON(), details: this.details };
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', cause?: unknown) {
    super(message, { statusCode: 401, code: 'UNAUTHORIZED', cause });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not found', cause?: unknown) {
    super(message, { statusCode: 404, code: 'NOT_FOUND', cause });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, { statusCode: 409, code: 'CONFLICT', cause });
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service unavailable', cause?: unknown) {
    super(message, { statusCode: 503, code: 'SERVICE_UNAVAILABLE', cause });
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}